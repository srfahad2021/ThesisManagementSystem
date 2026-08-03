using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GroupController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public GroupController(ApplicationDbContext context)
    {
        _context = context;
    }

    public class CreateGroupRequest
    {
        public int? StudentId1 { get; set; }
        public int? StudentId2 { get; set; }
        public int? SupervisorId { get; set; }
    }

    /// <summary>
    /// GET: api/group
    /// Retrieves all thesis groups with member and supervisor details.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllGroups()
    {
        var groups = await _context.ThesisGroups
            .Include(g => g.GroupMember)
                .ThenInclude(m => m!.Student1)
            .Include(g => g.GroupMember)
                .ThenInclude(m => m!.Student2)
            .Include(g => g.GroupMember)
                .ThenInclude(m => m!.Supervisor)
            .OrderByDescending(g => g.GroupId)
            .Select(g => new
            {
                g.GroupId,
                g.GroupName,
                Status = g.Status.ToString(),
                g.CreatedAt,
                Student1 = g.GroupMember != null && g.GroupMember.Student1 != null ? new
                {
                    g.GroupMember.Student1.UserId,
                    g.GroupMember.Student1.Username,
                    FullName = $"{g.GroupMember.Student1.FirstName} {g.GroupMember.Student1.LastName}".Trim()
                } : null,
                Student2 = g.GroupMember != null && g.GroupMember.Student2 != null ? new
                {
                    g.GroupMember.Student2.UserId,
                    g.GroupMember.Student2.Username,
                    FullName = $"{g.GroupMember.Student2.FirstName} {g.GroupMember.Student2.LastName}".Trim()
                } : null,
                Supervisor = g.GroupMember != null && g.GroupMember.Supervisor != null ? new
                {
                    g.GroupMember.Supervisor.UserId,
                    g.GroupMember.Supervisor.Username,
                    FullName = $"{g.GroupMember.Supervisor.FirstName} {g.GroupMember.Supervisor.LastName}".Trim()
                } : null
            })
            .ToListAsync();

        return Ok(groups);
    }

    /// <summary>
    /// GET: api/group/eligible-users
    /// Fetches students and supervisors to populate dropdowns.
    /// </summary>
    [HttpGet("eligible-users")]
    public async Task<IActionResult> GetEligibleUsers()
    {
        var students = await _context.Users
            .Where(u => u.Role == UserRole.STUDENT)
            .Select(u => new
            {
                u.UserId,
                u.Username,
                FullName = string.IsNullOrEmpty(u.FirstName) && string.IsNullOrEmpty(u.LastName)
                    ? u.Username
                    : $"{u.FirstName} {u.LastName}".Trim()
            })
            .ToListAsync();

        var supervisors = await _context.Users
            .Where(u => u.Role == UserRole.SUPERVISOR || u.Role == UserRole.CHAIRMAN || u.Role == UserRole.COORDINATOR)
            .Select(u => new
            {
                u.UserId,
                u.Username,
                FullName = string.IsNullOrEmpty(u.FirstName) && string.IsNullOrEmpty(u.LastName)
                    ? u.Username
                    : $"{u.FirstName} {u.LastName}".Trim()
            })
            .ToListAsync();

        return Ok(new { students, supervisors });
    }

    /// <summary>
    /// POST: api/group
    /// Creates a new thesis group with automatic naming ("G-01", "G-02", etc.).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN,COORDINATOR")]
    public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest dto)
    {
        if (dto.StudentId1 == null && dto.StudentId2 == null)
        {
            return BadRequest(new { message = "At least one student must be assigned to the group." });
        }

        if (dto.StudentId1.HasValue && dto.StudentId2.HasValue && dto.StudentId1 == dto.StudentId2)
        {
            return BadRequest(new { message = "Student 1 and Student 2 cannot be the same person." });
        }

        // Auto-generate next group name (G-01, G-02, G-10, etc.)
        int maxId = await _context.ThesisGroups.MaxAsync(g => (int?)g.GroupId) ?? 0;
        string autoGroupName = $"G-{(maxId + 1):D2}";

        var group = new ThesisGroup
        {
            GroupName = autoGroupName,
            Status = GroupLifecycle.INITIALIZED,
            CreatedAt = DateTime.UtcNow
        };

        _context.ThesisGroups.Add(group);
        await _context.SaveChangesAsync();

        var member = new GroupMember
        {
            GroupId = group.GroupId,
            StudentId1 = dto.StudentId1,
            StudentId2 = dto.StudentId2,
            SupervisorId = dto.SupervisorId
        };

        _context.GroupMembers.Add(member);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Group '{autoGroupName}' created successfully.",
            groupId = group.GroupId,
            groupName = group.GroupName
        });
    }

    /// <summary>
    /// DELETE: api/group/{id}
    /// Deletes a thesis group and its associated group members.
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN,COORDINATOR")]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        var group = await _context.ThesisGroups.FindAsync(id);
        if (group == null)
        {
            return NotFound(new { message = "Group not found." });
        }

        _context.ThesisGroups.Remove(group);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Group '{group.GroupName}' deleted successfully." });
    }
}