// File: PracticumProjects.Server\Controllers\UserController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                UserId = u.UserId,
                u.Username,
                FullName = string.IsNullOrEmpty(u.FirstName) && string.IsNullOrEmpty(u.LastName)
                    ? null
                    : $"{u.FirstName} {u.LastName}".Trim(),
                Role = u.Role.ToString(),
                u.Email,
                u.IsActive,
                u.IsProfileCompleted,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// PUT: api/user/{id}
    /// Updates user profile info (FullName, Email, Role).
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto model)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = $"User with ID {id} not found." });

        if (!string.IsNullOrWhiteSpace(model.FullName))
        {
            var parts = model.FullName.Trim().Split(' ', 2);
            user.FirstName = parts[0];
            user.LastName = parts.Length > 1 ? parts[1] : string.Empty;
        }

        user.Email = model.Email;

        if (Enum.TryParse<UserRole>(model.Role, true, out var parsedRole))
        {
            user.Role = parsedRole;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "User updated successfully." });
    }

    /// <summary>
    /// PUT: api/user/{id}/status
    /// Enables or disables a user account.
    /// </summary>
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> ToggleUserStatus(int id, [FromBody] ToggleStatusDto model)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = $"User with ID {id} not found." });

        user.IsActive = model.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User status updated to {(user.IsActive ? "Active" : "Disabled")}." });
    }
}

public class UpdateUserDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
}

public class ToggleStatusDto
{
    public bool IsActive { get; set; }
}