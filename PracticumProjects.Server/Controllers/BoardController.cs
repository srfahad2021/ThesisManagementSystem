using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data; // Adjust to your DbContext namespace
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BoardController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/board
    [HttpGet]
    public async Task<IActionResult> GetBoards()
    {
        var boards = await _context.Boards
            .Include(b => b.Semester)
            .Select(b => new
            {
                id = b.BoardId,
                name = b.Name,
                semesterId = b.SemesterId,
                semesterName = b.Semester != null ? $"{b.Semester.SemesterType} {b.Semester.Year}" : null,
                isActive = b.IsActive,
                createdAt = b.CreatedAt,
                membersCount = b.BoardMembers.Count,
                groupsCount = b.BoardGroups.Count
            })
            .ToListAsync();

        return Ok(boards);
    }

    // GET: api/board/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBoard(int id)
    {
        var board = await _context.Boards
            .Include(b => b.Semester)
            .FirstOrDefaultAsync(b => b.BoardId == id);

        if (board == null) return NotFound(new { message = "Board not found." });

        return Ok(new
        {
            id = board.BoardId,
            name = board.Name,
            semesterId = board.SemesterId,
            semesterName = board.Semester != null ? $"{board.Semester.SemesterType} {board.Semester.Year}" : null,
            isActive = board.IsActive,
            createdAt = board.CreatedAt
        });
    }

    // DELETE: api/board/4
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(int id)
    {
        if (!IsAdmin())
        {
            return Forbid();
        }

        var board = await _context.Boards.FindAsync(id);
        if (board == null)
        {
            return NotFound(new { message = "Board not found." });
        }

        _context.Boards.Remove(board);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Board deleted successfully." });
    }

    // PUT: api/board/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBoard(int id, [FromBody] UpdateBoardDto dto)
    {
        var board = await _context.Boards.FindAsync(id);
        if (board == null) return NotFound(new { message = "Board not found." });

        if (!string.IsNullOrWhiteSpace(dto.Name))
            board.Name = dto.Name;

        board.SemesterId = dto.SemesterId;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Board updated successfully." });
    }

    // PUT: api/board/5/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var board = await _context.Boards.FindAsync(id);
        if (board == null) return NotFound(new { message = "Board not found." });

        board.IsActive = dto.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Board status updated." });
    }

    // POST: api/board/bulk
    [HttpPost("bulk")]
    public async Task<IActionResult> BulkCreateBoards([FromBody] List<CreateBoardDto> dtos)
    {
        if (dtos == null || !dtos.Any())
            return BadRequest(new { message = "No boards provided." });

        var boards = dtos.Select(d => new Board
        {
            Name = d.Name,
            SemesterId = d.SemesterId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _context.Boards.AddRange(boards);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"{boards.Count} boards created successfully." });
    }

    // GET: api/board/active
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveBoards()
    {
        var activeBoards = await _context.Boards
            .Where(b => b.IsActive)
            .Include(b => b.Semester)
            .Include(b => b.BoardMembers)
                .ThenInclude(bm => bm.Member)
            .Select(b => new
            {
                id = b.BoardId,
                name = b.Name,
                semesterName = b.Semester != null ? $"{b.Semester.SemesterType} {b.Semester.Year}" : "N/A",
                members = b.BoardMembers.Select(bm => new
                {
                    boardMemberId = bm.BoardMemberId,
                    userId = bm.UserId,
                    username = bm.Member.Username,
                    fullName = $"{bm.Member.FirstName} {bm.Member.LastName}".Trim()
                }).ToList()
            })
            .ToListAsync();

        return Ok(activeBoards);
    }

    // GET: api/board/eligible-examiners
    [HttpGet("eligible-examiners")]
    public async Task<IActionResult> GetEligibleExaminers()
    {
        // Fetch users who are active and hold Supervisor or Coordinator roles
        var examiners = await _context.Users
            .Where(u => u.IsActive && 
                        (u.Role == UserRole.SUPERVISOR || u.Role == UserRole.COORDINATOR))
            .Select(u => new
            {
                userId = u.UserId,
                username = u.Username,
                fullName = $"{u.FirstName} {u.LastName}".Trim(),
                role = u.Role.ToString()
            })
            .ToListAsync();

        return Ok(examiners);
    }

    // POST: api/board/{boardId}/members
    [HttpPost("{boardId}/members")]
    public async Task<IActionResult> AddBoardMember(int boardId, [FromBody] AddBoardMemberDto dto)
    {
        var board = await _context.Boards.FindAsync(boardId);
        if (board == null || !board.IsActive)
        {
            return NotFound(new { message = "Active board not found." });
        }

        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Check if user is already a member of this board
        bool exists = await _context.BoardMembers
            .AnyAsync(bm => bm.BoardId == boardId && bm.UserId == dto.UserId);

        if (exists)
        {
            return BadRequest(new { message = "This examiner is already assigned to this board." });
        }

        var newMember = new BoardMember
        {
            BoardId = boardId,
            UserId = dto.UserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.BoardMembers.Add(newMember);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Examiner assigned successfully.",
            boardMemberId = newMember.BoardMemberId,
            userId = user.UserId,
            username = user.Username,
            fullName = $"{user.FirstName} {user.LastName}".Trim()
        });
    }

    // DELETE: api/board/members/{boardMemberId}
    [HttpDelete("members/{boardMemberId}")]
    public async Task<IActionResult> RemoveBoardMember(int boardMemberId)
    {
        var member = await _context.BoardMembers.FindAsync(boardMemberId);
        if (member == null)
        {
            return NotFound(new { message = "Board member record not found." });
        }

        _context.BoardMembers.Remove(member);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Examiner removed from board successfully." });
    }
    
    [HttpGet("active-groups-summary")]
    public async Task<IActionResult> GetActiveBoardsForGroups()
    {
        var activeBoards = await _context.Boards
            .Where(b => b.IsActive)
            .Include(b => b.Semester)
            .Select(b => new
            {
                id = b.BoardId,
                name = b.Name,
                semesterName = b.Semester != null ? $"{b.Semester.SemesterType} {b.Semester.Year}" : "N/A"
            })
            .ToListAsync();

        return Ok(activeBoards);
    }

    // GET: api/board/{boardId}/groups
    // Fetch assigned groups for a specific board popup modal
    [HttpGet("{boardId}/groups")]
    public async Task<IActionResult> GetBoardGroups(int boardId)
    {
        var boardGroups = await _context.BoardGroups
            .Where(bg => bg.BoardId == boardId)
            .Include(bg => bg.ThesisGroup)
            .Select(bg => new
            {
                boardGroupId = bg.BoardGroupId,
                groupId = bg.GroupId,
                groupName = bg.ThesisGroup.GroupName
            })
            .ToListAsync();

        return Ok(boardGroups);
    }

    // GET: api/board/unassigned-groups
    // Fetch groups that are NOT assigned to ANY board yet (1 group = max 1 board)
    [HttpGet("unassigned-groups")]
    public async Task<IActionResult> GetUnassignedGroups()
    {
        // Get all GroupIds already assigned across ALL boards
        var assignedGroupIds = await _context.BoardGroups
            .Select(bg => bg.GroupId)
            .Distinct()
            .ToListAsync();

        // Retrieve groups that are not in the assigned list
        var unassignedGroups = await _context.ThesisGroups
            .Where(tg => !assignedGroupIds.Contains(tg.GroupId))
            .Select(tg => new
            {
                groupId = tg.GroupId,
                groupName = tg.GroupName
            })
            .ToListAsync();

        return Ok(unassignedGroups);
    }

    // POST: api/board/{boardId}/groups
    [HttpPost("{boardId}/groups")]
    public async Task<IActionResult> AddBoardGroup(int boardId, [FromBody] AddBoardGroupDto dto)
    {
        var board = await _context.Boards.FindAsync(boardId);
        if (board == null || !board.IsActive)
        {
            return NotFound(new { message = "Active board not found." });
        }

        var group = await _context.ThesisGroups.FindAsync(dto.GroupId);
        if (group == null)
        {
            return NotFound(new { message = "Thesis group not found." });
        }

        // STRICT CHECK: A group can only be assigned to ONE board
        bool alreadyAssignedAnywhere = await _context.BoardGroups
            .AnyAsync(bg => bg.GroupId == dto.GroupId);

        if (alreadyAssignedAnywhere)
        {
            return BadRequest(new { message = "This group is already assigned to a board." });
        }

        var newBoardGroup = new BoardGroup
        {
            BoardId = boardId,
            GroupId = dto.GroupId,
            CreatedAt = DateTime.UtcNow
        };

        _context.BoardGroups.Add(newBoardGroup);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Group assigned to board successfully.",
            boardGroupId = newBoardGroup.BoardGroupId,
            groupId = group.GroupId,
            groupName = group.GroupName
        });
    }

    // DELETE: api/board/groups/{boardGroupId}
    [HttpDelete("groups/{boardGroupId}")]
    public async Task<IActionResult> RemoveBoardGroup(int boardGroupId)
    {
        var boardGroup = await _context.BoardGroups.FindAsync(boardGroupId);
        if (boardGroup == null)
        {
            return NotFound(new { message = "Board group assignment record not found." });
        }

        _context.BoardGroups.Remove(boardGroup);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Group unassigned from board successfully." });
    }

    private bool IsAdmin()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
        return string.Equals(roleClaim, "ADMIN", StringComparison.OrdinalIgnoreCase) ||
               string.Equals(roleClaim, "Admin", StringComparison.OrdinalIgnoreCase);
    }
}

// DTO Classes
public class CreateBoardDto
{
    public string Name { get; set; } = string.Empty;
    public int? SemesterId { get; set; }
}

public class UpdateBoardDto
{
    public string Name { get; set; } = string.Empty;
    public int? SemesterId { get; set; }
}

public class UpdateStatusDto
{
    public bool IsActive { get; set; }
}
public class AddBoardMemberDto
{
    public int UserId { get; set; }
}

public class AddBoardGroupDto
{
    public int GroupId { get; set; }
}