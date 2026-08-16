using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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

    // ----------------------------------------------------
    // POST: /api/auth/create-user (ADMIN ONLY)
    // ----------------------------------------------------
    [HttpPost("create-user")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username))
        {
            return BadRequest(new { message = "Username is required." });
        }

        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
        {
            return BadRequest(new { message = $"Username '{dto.Username}' already exists." });
        }

        if (!string.IsNullOrWhiteSpace(dto.Email) && await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest(new { message = $"Email '{dto.Email}' is already in use." });
        }

        // Set default password if none provided (e.g. Username@123)
        string passwordToUse = string.IsNullOrWhiteSpace(dto.Password) ? $"{dto.Username}@123" : dto.Password;
        UserRole roleToUse = dto.Role ?? UserRole.STUDENT;

        var newUser = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordToUse),
            Role = roleToUse,
            Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email,
            FirstName = string.IsNullOrWhiteSpace(dto.FirstName) ? null : dto.FirstName,
            LastName = string.IsNullOrWhiteSpace(dto.LastName) ? null : dto.LastName,
            PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User created successfully.", userId = newUser.UserId });
    }

    // ----------------------------------------------------
    // POST: /api/auth/bulk-create (ADMIN ONLY)
    // ----------------------------------------------------
    [HttpPost("bulk-create")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> BulkCreateUser([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        var allowedExtensions = new[] { ".csv", ".xls", ".xlsx", ".xlsm" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest(new { message = "Unsupported file format. Please upload CSV or Excel files." });

        System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

        var existingUsernames = new HashSet<string>(await _context.Users.Select(u => u.Username.ToLower()).ToListAsync());
        var existingEmails = new HashSet<string>(await _context.Users.Where(u => u.Email != null).Select(u => u.Email!.ToLower()).ToListAsync());

        var usersToCreate = new List<User>();
        var errors = new List<string>();

        using (var stream = file.OpenReadStream())
        {
            using (var reader = ExcelReaderFactory.CreateReader(stream))
            {
                var result = reader.AsDataSet(new ExcelDataSetConfiguration()
                {
                    ConfigureDataTable = (_) => new ExcelDataTableConfiguration() { UseHeaderRow = true }
                });

                var table = result.Tables[0];
                int rowIndex = 1;

                foreach (DataRow row in table.Rows)
                {
                    rowIndex++;
                    string username = row["Username"]?.ToString()?.Trim() ?? string.Empty;

                    if (string.IsNullOrWhiteSpace(username))
                    {
                        continue; // Skip empty rows
                    }

                    if (existingUsernames.Contains(username.ToLower()) || usersToCreate.Any(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase)))
                    {
                        errors.Add($"Row {rowIndex}: Username '{username}' already exists.");
                        continue;
                    }

                    string email = row.Table.Columns.Contains("Email") ? row["Email"]?.ToString()?.Trim() ?? "" : "";
                    if (!string.IsNullOrWhiteSpace(email))
                    {
                        if (existingEmails.Contains(email.ToLower()) || usersToCreate.Any(u => email.Equals(u.Email, StringComparison.OrdinalIgnoreCase)))
                        {
                            errors.Add($"Row {rowIndex}: Email '{email}' is already in use.");
                            continue;
                        }
                    }

                    string fullName = row.Table.Columns.Contains("FullName") ? row["FullName"]?.ToString()?.Trim() ?? "" : "";
                    string firstName = string.Empty;
                    string lastName = string.Empty;

                    if (!string.IsNullOrWhiteSpace(fullName))
                    {
                        var parts = fullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                        firstName = parts[0];
                        if (parts.Length > 1) lastName = parts[1];
                    }

                    string roleStr = row.Table.Columns.Contains("Role") ? row["Role"]?.ToString()?.Trim() ?? "Student" : "Student";
                    if (!Enum.TryParse<UserRole>(roleStr, true, out var role))
                    {
                        role = UserRole.STUDENT;
                    }

                    string rawPassword = row.Table.Columns.Contains("Password") ? row["Password"]?.ToString()?.Trim() ?? "" : "";
                    string passwordToUse = string.IsNullOrWhiteSpace(rawPassword) ? $"{username}@123" : rawPassword;

                    usersToCreate.Add(new User
                    {
                        Username = username,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordToUse),
                        Role = role,
                        Email = string.IsNullOrWhiteSpace(email) ? null : email,
                        FirstName = string.IsNullOrWhiteSpace(firstName) ? null : firstName,
                        LastName = string.IsNullOrWhiteSpace(lastName) ? null : lastName,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        if (usersToCreate.Any())
        {
            _context.Users.AddRange(usersToCreate);
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            message = $"{usersToCreate.Count} user(s) imported successfully.",
            createdCount = usersToCreate.Count,
            errors
        });
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
    [Authorize(Roles = "ADMIN,Admin")]
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
}