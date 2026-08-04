using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Models;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TopicSubmissionController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TopicSubmissionController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/TopicSubmission/my-topic
    // Fetches the topic submission for the group assigned to the authenticated student
    [HttpGet("my-topic")]
    public async Task<ActionResult<TopicSubmissionDto>> GetMyTopic()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        // Find group where current user is a student member
        var groupMember = await _context.GroupMembers
            .FirstOrDefaultAsync(m => m.StudentId1 == userId.Value || m.StudentId2 == userId.Value);

        if (groupMember == null)
        {
            return NotFound(new { message = "User is not assigned to any thesis group." });
        }

        var submission = await _context.TopicSubmissions
            .FirstOrDefaultAsync(t => t.GroupId == groupMember.GroupId);

        // If no topic record exists yet for this group, initialize a default record
        if (submission == null)
        {
            submission = new TopicSubmission
            {
                GroupId = groupMember.GroupId,
                Title = string.Empty,
                Abstract = string.Empty,
                Keywords = string.Empty,
                ProblemStatement = string.Empty,
                Objectives = string.Empty,
                Status = TopicStatus.INITIAL,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.TopicSubmissions.Add(submission);
            await _context.SaveChangesAsync();
        }

        return Ok(MapToDto(submission));
    }



    [AllowAnonymous] // Remove or keep depending on whether authentication middleware is enforced
    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<TopicSubmissionDto>> GetTopicByUserId(int userId)
    {
        // Find group where specified user is student 1 or student 2
        var groupMember = await _context.GroupMembers
            .FirstOrDefaultAsync(m => m.StudentId1 == userId || m.StudentId2 == userId);

        if (groupMember == null)
        {
            return NotFound(new { message = "User is not assigned to any thesis group." });
        }

        var submission = await _context.TopicSubmissions
            .FirstOrDefaultAsync(t => t.GroupId == groupMember.GroupId);

        // If no topic record exists yet for this group, initialize a default record
        if (submission == null)
        {
            submission = new TopicSubmission
            {
                GroupId = groupMember.GroupId,
                Title = string.Empty,
                Abstract = string.Empty,
                Keywords = string.Empty,
                ProblemStatement = string.Empty,
                Objectives = string.Empty,
                Status = TopicStatus.INITIAL,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.TopicSubmissions.Add(submission);
            await _context.SaveChangesAsync();
        }

        return Ok(MapToDto(submission));
    }


    // GET: api/TopicSubmission/supervisor
    // Retrieves submitted topics for groups assigned to the authenticated supervisor
    [HttpGet("supervisor")]
    public async Task<ActionResult<IEnumerable<TopicSubmissionDto>>> GetSupervisorSubmissions()
    {
        var supervisorId = GetCurrentUserId();
        if (supervisorId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        // Get group IDs supervised by the current user
        var supervisedGroupIds = await _context.GroupMembers
            .Where(m => m.SupervisorId == supervisorId.Value)
            .Select(m => m.GroupId)
            .ToListAsync();

        if (!supervisedGroupIds.Any())
        {
            return Ok(Enumerable.Empty<TopicSubmissionDto>());
        }

        // Query submissions matching those groups that have SUBMITTED status (or under review)
        var submissions = await _context.TopicSubmissions
            .Where(t => supervisedGroupIds.Contains(t.GroupId) && 
                    (t.Status == TopicStatus.SUBMITTED || t.Status == TopicStatus.SUPERVISOR_REVIEW))
            .ToListAsync();

        var result = submissions.Select(MapToDto);
        return Ok(result);
    }


    // GET: api/TopicSubmission/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TopicSubmissionDto>> GetSubmissionById(int id)
    {
        var submission = await _context.TopicSubmissions.FindAsync(id);

        if (submission == null)
        {
            return NotFound(new { message = $"Topic submission with ID {id} not found." });
        }

        return Ok(MapToDto(submission));
    }

    // GET: api/TopicSubmission/group/5
    [HttpGet("group/{groupId:int}")]
    public async Task<ActionResult<TopicSubmissionDto>> GetSubmissionByGroup(int groupId)
    {
        var submission = await _context.TopicSubmissions
            .FirstOrDefaultAsync(t => t.GroupId == groupId);

        if (submission == null)
        {
            return NotFound(new { message = $"No topic submission found for group ID {groupId}." });
        }

        return Ok(MapToDto(submission));
    }

    // PUT: api/TopicSubmission/5
    // Called by student_topic.jsx when saving as Draft or Submitting Proposal
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSubmission(int id, [FromBody] SaveTopicSubmissionRequest request)
    {
        var submission = await _context.TopicSubmissions.FindAsync(id);

        // Fallback: If id is 0, attempt lookup by GroupId
        if (submission == null && request.GroupId > 0)
        {
            submission = await _context.TopicSubmissions
                .FirstOrDefaultAsync(t => t.GroupId == request.GroupId);
        }

        if (submission == null)
        {
            return NotFound(new { message = "Topic submission not found." });
        }

        // Validate editable status workflow
        var isEditable = submission.Status == TopicStatus.INITIAL ||
                         submission.Status == TopicStatus.DRAFT ||
                         submission.Status == TopicStatus.NEEDS_REVISION;

        if (!isEditable)
        {
            return BadRequest(new { message = $"Topic submission cannot be modified when in '{submission.Status}' status." });
        }

        // Parse status string to TopicStatus enum
        if (Enum.TryParse<TopicStatus>(request.Status, true, out var targetStatus))
        {
            submission.Status = targetStatus;
        }
        else
        {
            return BadRequest(new { message = $"Invalid status '{request.Status}' provided." });
        }

        submission.Title = request.Title ?? string.Empty;
        submission.Abstract = request.Abstract ?? string.Empty;
        submission.Keywords = request.Keywords;
        submission.ProblemStatement = request.ProblemStatement ?? string.Empty;
        submission.Objectives = request.Objectives ?? string.Empty;
        submission.UpdatedAt = DateTimeOffset.UtcNow;

        _context.Entry(submission).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok(MapToDto(submission));
    }

    // PATCH: api/TopicSubmission/5/status
    // Allows Supervisors/Coordinators to update status and attach review feedback
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTopicStatusRequest request)
    {
        var submission = await _context.TopicSubmissions.FindAsync(id);
        if (submission == null)
        {
            return NotFound(new { message = $"Topic submission with ID {id} not found." });
        }

        if (Enum.TryParse<TopicStatus>(request.Status, true, out var newStatus))
        {
            submission.Status = newStatus;
        }
        else
        {
            return BadRequest(new { message = $"Invalid status '{request.Status}' provided." });
        }

        if (request.SupervisorFeedback != null)
        {
            submission.SupervisorFeedback = request.SupervisorFeedback;
        }

        if (request.CoordinatorFeedback != null)
        {
            submission.CoordinatorFeedback = request.CoordinatorFeedback;
        }

        submission.UpdatedAt = DateTimeOffset.UtcNow;

        _context.Entry(submission).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok(MapToDto(submission));
    }

    // Helper: Resolves authenticated User ID from JWT claims
    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                 ?? User.FindFirst("UserId")?.Value
                 ?? User.FindFirst("sub")?.Value;

        if (int.TryParse(claim, out var userId))
        {
            return userId;
        }
        return null;
    }

    // Helper: Maps TopicSubmission entity to TopicSubmissionDto
    private static TopicSubmissionDto MapToDto(TopicSubmission submission)
    {
        return new TopicSubmissionDto
        {
            TopicId = submission.TopicId,
            GroupId = submission.GroupId,
            Title = submission.Title ?? string.Empty,
            Abstract = submission.Abstract ?? string.Empty,
            Keywords = submission.Keywords,
            ProblemStatement = submission.ProblemStatement ?? string.Empty,
            Objectives = submission.Objectives ?? string.Empty,
            Status = submission.Status.ToString(),
            SupervisorFeedback = submission.SupervisorFeedback,
            CoordinatorFeedback = submission.CoordinatorFeedback,
            CreatedAt = submission.CreatedAt,
            UpdatedAt = submission.UpdatedAt
        };
    }
}

// --- DTOs ---

public class SaveTopicSubmissionRequest
{
    public int TopicId { get; set; }
    public int GroupId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Abstract { get; set; } = string.Empty;
    public string? Keywords { get; set; }
    public string ProblemStatement { get; set; } = string.Empty;
    public string Objectives { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class UpdateTopicStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? SupervisorFeedback { get; set; }
    public string? CoordinatorFeedback { get; set; }
}

public class TopicSubmissionDto
{
    public int TopicId { get; set; }
    public int GroupId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Abstract { get; set; } = string.Empty;
    public string? Keywords { get; set; }
    public string ProblemStatement { get; set; } = string.Empty;
    public string Objectives { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? SupervisorFeedback { get; set; }
    public string? CoordinatorFeedback { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}