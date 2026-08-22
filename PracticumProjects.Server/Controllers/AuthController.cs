using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net.Mail;
using System.Text.Json.Serialization;
using ExcelDataReader;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    // DTOs
    public record LoginRequest(string Username, string Password, string Role);

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string? Password { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UserRole? Role { get; set; }

        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
    }

    // ----------------------------------------------------
    // POST: /api/auth/login
    // ----------------------------------------------------
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Username and password are required." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        // --- NEW CHECK: Block disabled accounts from logging in ---
        if (!user.IsActive)
        {
            return Unauthorized(new { message = "Your account has been disabled. Please contact the administrator." });
        }

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var requestedRole) || user.Role != requestedRole)
        {
            return Unauthorized(new { message = $"Account exists, but does not match the selected role '{dto.Role}'." });
        }

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                user.UserId,
                user.Username,
                user.Role,
                user.Email,
                user.FirstName,
                user.LastName,
                user.IsProfileCompleted,
                user.IsActive
            }
        });
    }

    
    // POST: /api/auth/bulk-create
    [HttpPost("bulk-create")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> BulkCreateUser([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowed = new[] { ".csv", ".xls", ".xlsx", ".xlsm" };

        if (!allowed.Contains(ext))
            return BadRequest(new { message = "Please upload CSV or Excel files." });

        try
        {
            System.Text.Encoding.RegisterProvider(
                System.Text.CodePagesEncodingProvider.Instance);

            var existingUsernames = new HashSet<string>(
                await _context.Users
                    .Select(x => x.Username.ToLower())
                    .ToListAsync());

            var existingEmails = new HashSet<string>(
                await _context.Users
                    .Where(x => x.Email != null)
                    .Select(x => x.Email!.ToLower())
                    .ToListAsync());

            var importedUsernames = new HashSet<string>(
                StringComparer.OrdinalIgnoreCase);

            var importedEmails = new HashSet<string>(
                StringComparer.OrdinalIgnoreCase);

            var users = new List<User>();
            var errors = new List<string>();

            using var stream = file.OpenReadStream();

            using var reader = ext == ".csv"
                ? ExcelReaderFactory.CreateCsvReader(stream)
                : ExcelReaderFactory.CreateReader(stream);

            var dataSet = reader.AsDataSet(new ExcelDataSetConfiguration
            {
                ConfigureDataTable = _ => new ExcelDataTableConfiguration
                {
                    UseHeaderRow = true
                }
            });

            if (dataSet.Tables.Count == 0)
                return BadRequest(new { message = "The file contains no readable sheets." });

            var table = dataSet.Tables[0];

            if (table.Columns.Count == 0)
                return BadRequest(new { message = "The file contains no columns." });

            var columns = table.Columns
                .Cast<DataColumn>()
                .Select(x => x.ColumnName.Trim())
                .ToList();

            string? FindColumn(string name) =>
                columns.FirstOrDefault(x =>
                    x.Equals(name, StringComparison.OrdinalIgnoreCase));

            var usernameCol = FindColumn("Username");

            if (usernameCol == null)
            {
                return BadRequest(new
                {
                    message = "The file must contain a 'Username' column.",
                    availableColumns = columns
                });
            }

            var emailCol = FindColumn("Email");
            var fullNameCol = FindColumn("FullName");
            var roleCol = FindColumn("Role");
            var passwordCol = FindColumn("Password");

            int rowNumber = 2;

            foreach (DataRow row in table.Rows)
            {
                try
                {
                    var username = Cell(row, usernameCol);

                    if (string.IsNullOrWhiteSpace(username))
                    {
                        rowNumber++;
                        continue;
                    }

                    username = username.Trim();

                    if (existingUsernames.Contains(username.ToLower()) ||
                        !importedUsernames.Add(username))
                    {
                        errors.Add(
                            $"Row {rowNumber}: Username '{username}' already exists or is duplicated.");
                        rowNumber++;
                        continue;
                    }

                    var email = emailCol == null ? "" : Cell(row, emailCol);

                    if (!string.IsNullOrWhiteSpace(email))
                    {
                        email = email.Trim();

                        if (!IsValidEmail(email))
                        {
                            errors.Add(
                                $"Row {rowNumber}: Invalid email '{email}'.");
                            importedUsernames.Remove(username);
                            rowNumber++;
                            continue;
                        }

                        if (existingEmails.Contains(email.ToLower()) ||
                            !importedEmails.Add(email))
                        {
                            errors.Add(
                                $"Row {rowNumber}: Email '{email}' already exists or is duplicated.");
                            importedUsernames.Remove(username);
                            rowNumber++;
                            continue;
                        }
                    }

                    var fullName = fullNameCol == null
                        ? ""
                        : Cell(row, fullNameCol);

                    var nameParts = fullName
                        .Trim()
                        .Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);

                    var firstName = nameParts.Length > 0
                        ? nameParts[0]
                        : null;

                    var lastName = nameParts.Length > 1
                        ? nameParts[1]
                        : null;

                    var roleText = roleCol == null
                        ? "STUDENT"
                        : Cell(row, roleCol);

                    UserRole role;

                    if (string.IsNullOrWhiteSpace(roleText))
                    {
                        role = UserRole.STUDENT;
                    }
                    else if (!Enum.TryParse<UserRole>(
                        roleText.Trim(),
                        true,
                        out role))
                    {
                        errors.Add(
                            $"Row {rowNumber}: Invalid role '{roleText}'. User was skipped.");
                        importedUsernames.Remove(username);
                        if (!string.IsNullOrWhiteSpace(email))
                            importedEmails.Remove(email);
                        rowNumber++;
                        continue;
                    }

                    var rawPassword = passwordCol == null
                        ? ""
                        : Cell(row, passwordCol);

                    var password = string.IsNullOrWhiteSpace(rawPassword)
                        ? $"{username}@123"
                        : rawPassword.Trim();

                    users.Add(new User
                    {
                        Username = username,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                        Role = role,
                        FirstName = firstName,
                        LastName = lastName,
                        Email = string.IsNullOrWhiteSpace(email) ? null : email,
                        IsActive = true,
                        IsProfileCompleted = false,
                        CreatedAt = DateTime.UtcNow
                    });

                    existingUsernames.Add(username.ToLower());

                    if (!string.IsNullOrWhiteSpace(email))
                        existingEmails.Add(email.ToLower());
                }
                catch (Exception ex)
                {
                    errors.Add($"Row {rowNumber}: {ex.Message}");
                }

                rowNumber++;
            }

            if (users.Count > 0)
            {
                await _context.Users.AddRangeAsync(users);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = $"{users.Count} user(s) imported successfully.",
                createdCount = users.Count,
                errorCount = errors.Count,
                errors
            });
        }
        catch (Exception ex)
        {
            // Check your server console for the complete exception.
            Console.WriteLine(ex);

            return StatusCode(500, new
            {
                message = "An error occurred while importing users.",
                error = ex.Message
            });
        }
    }

    private static string Cell(DataRow row, string column)
    {
        if (!row.Table.Columns.Contains(column))
            return "";

        var value = row[column];

        return value == null || value == DBNull.Value
            ? ""
            : value.ToString()?.Trim() ?? "";
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var address = new MailAddress(email);
            return address.Address.Equals(
                email,
                StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    // Helper: JWT Generation
    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString().ToUpper())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    public record ResetPasswordRequest(string NewPassword);

    // ----------------------------------------------------
    // POST: /api/user/{id}/reset-password (ADMIN ONLY)
    // ----------------------------------------------------
    [HttpPost("{id}/reset-password")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return BadRequest(new { message = "New password cannot be empty." });
        }

        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Hash and update the password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Password for user '{user.Username}' was successfully reset." });
    }


    // ----------------------------------------------------
    // POST: /api/user/{id}/change-password
    // ----------------------------------------------------
    [HttpPost("{id}/change-password")]
    // [Authorize(Role = "STUDENT")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest dto)
    {
        // 1. Validate inputs
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return BadRequest(new { message = "Current password and new password are required." });
        }

        if (dto.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "New password must be at least 6 characters long." });
        }

        // 2. Fetch user
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // 3. Verify current password using BCrypt
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);
        if (!isPasswordValid)
        {
            return BadRequest(new { message = "Incorrect current password." });
        }

        // 4. Hash and update new password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully." });
    }
    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
