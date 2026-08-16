// ==========================================
// File: PracticumProjects.Server\Controllers\AssignmentController.cs
// ==========================================
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public AssignmentController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    /// <summary>
    /// GET: api/Assignment/supervisor-assignments
    /// Retrieves all assignments created by or for groups supervised by the logged-in supervisor.
    /// </summary>
    [HttpGet("supervisor-assignments")]
    public async Task<IActionResult> GetSupervisorAssignments()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var supervisedGroupIds = await _context.GroupMembers
            .Where(m => m.SupervisorId == userId.Value)
            .Select(m => m.GroupId)
            .ToListAsync();

        var assignments = await _context.Assignments
            .Include(a => a.ThesisGroup)
            .Include(a => a.Submissions)
            .Where(a => supervisedGroupIds.Contains(a.GroupId))
            .OrderByDescending(a => a.AssignmentId)
            .Select(a => new
            {
                a.AssignmentId,
                a.Title,
                a.Description,
                a.Deadline,
                a.CreatedAt,
                GroupId = a.GroupId,
                GroupName = a.ThesisGroup != null ? a.ThesisGroup.GroupName : "Unknown Group",
                TotalSubmissions = a.Submissions.Count,
                HasSubmitted = a.Submissions.Any(s => s.SubmissionStatus == "Submitted" || s.SubmissionStatus == "Graded"),
                Status = a.Deadline < DateTimeOffset.UtcNow ? "Closed" : "Active"
            })
            .ToListAsync();

        return Ok(assignments);
    }

    /// <summary>
    /// GET: api/Assignment/{id}/files
    /// Retrieves all submission files attached to a specific assignment.
    /// </summary>
    [HttpGet("{id}/files")]
    public async Task<IActionResult> GetAssignmentFiles(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
        {
            return NotFound(new { message = "Assignment not found." });
        }

        var files = await _context.SubmissionFiles
            .Where(f => f.ModuleType == AttachmentModule.Assignment && f.EntityId == id)
            .Select(f => new
            {
                f.FileId,
                f.FileName,
                f.FilePath,
                f.FileSize,
                f.UploadedAt
            })
            .ToListAsync();

        return Ok(files);
    }

    /// <summary>
    /// DELETE: api/Assignment/file/{fileId}
    /// Deletes a specific file attached to an assignment.
    /// </summary>
    [HttpDelete("file/{fileId}")]
    public async Task<IActionResult> DeleteAssignmentFile(int fileId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var fileRecord = await _context.SubmissionFiles
            .FirstOrDefaultAsync(f => f.FileId == fileId && f.ModuleType == AttachmentModule.Assignment);

        if (fileRecord == null)
        {
            return NotFound(new { message = "File not found." });
        }

        // Verify supervisor permission via assignment & group
        var assignment = await _context.Assignments.FindAsync(fileRecord.EntityId);
        if (assignment != null)
        {
            var isSupervisor = await _context.GroupMembers
                .AnyAsync(m => m.GroupId == assignment.GroupId && m.SupervisorId == userId.Value);
            if (!isSupervisor) return Forbid();
        }

        // Remove from physical disk
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var fullPath = Path.Combine(webRoot, fileRecord.FilePath);
        if (System.IO.File.Exists(fullPath))
        {
            System.IO.File.Delete(fullPath);
        }

        _context.SubmissionFiles.Remove(fileRecord);
        await _context.SaveChangesAsync();

        return Ok(new { message = "File deleted successfully." });
    }

    /// <summary>
    /// GET: api/Assignment/supervised-groups
    /// Retrieves groups where the logged-in user is the supervisor.
    /// </summary>
    [HttpGet("supervised-groups")]
    public async Task<IActionResult> GetSupervisedGroups()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var groups = await _context.GroupMembers
            .Where(m => m.SupervisorId == userId.Value && m.ThesisGroup != null)
            .Include(m => m.ThesisGroup)
            .Select(m => new
            {
                groupId = m.ThesisGroup.GroupId,
                groupName = m.ThesisGroup.GroupName
            })
            .ToListAsync();

        return Ok(groups);
    }

    /// <summary>
    /// POST: api/Assignment
    /// Creates a new assignment with multiple optional file attachments.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateAssignment(
        [FromForm] int groupId,
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] DateTimeOffset deadline,
        [FromForm] List<IFormFile>? files)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var isSupervisor = await _context.GroupMembers
            .AnyAsync(m => m.GroupId == groupId && m.SupervisorId == userId.Value);

        if (!isSupervisor)
        {
            return Forbid();
        }

        var assignment = new Assignment
        {
            GroupId = groupId,
            Title = title,
            Description = description,
            Deadline = deadline,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        if (files != null && files.Count > 0)
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var folderRelativePath = Path.Combine("uploads", AttachmentModule.Assignment.ToString(), assignment.AssignmentId.ToString());
            var uploadsFolder = Path.Combine(webRoot, folderRelativePath);

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var safeFileName = Path.GetFileName(file.FileName);
                    var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var submissionFile = new SubmissionFile
                    {
                        ModuleType = AttachmentModule.Assignment,
                        EntityId = assignment.AssignmentId,
                        FileName = safeFileName,
                        FilePath = Path.Combine(folderRelativePath, uniqueFileName).Replace('\\', '/'),
                        ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                        FileSize = file.Length,
                        UploadedAt = DateTimeOffset.UtcNow,
                        Status = "Active"
                    };

                    _context.SubmissionFiles.Add(submissionFile);
                }
            }
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Assignment created successfully.", assignmentId = assignment.AssignmentId });
    }

    /// <summary>
    /// PUT: api/Assignment/{id}
    /// Updates an existing assignment and appends newly uploaded files.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAssignment(
        int id,
        [FromForm] int groupId,
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] DateTimeOffset deadline,
        [FromForm] List<IFormFile>? files)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
        {
            return NotFound(new { message = "Assignment not found." });
        }

        var isSupervisor = await _context.GroupMembers
            .AnyAsync(m => m.GroupId == groupId && m.SupervisorId == userId.Value);

        if (!isSupervisor)
        {
            return Forbid();
        }

        assignment.GroupId = groupId;
        assignment.Title = title;
        assignment.Description = description;
        assignment.Deadline = deadline;
        assignment.UpdatedAt = DateTimeOffset.UtcNow;

        _context.Assignments.Update(assignment);

        if (files != null && files.Count > 0)
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var folderRelativePath = Path.Combine("uploads", AttachmentModule.Assignment.ToString(), assignment.AssignmentId.ToString());
            var uploadsFolder = Path.Combine(webRoot, folderRelativePath);

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var safeFileName = Path.GetFileName(file.FileName);
                    var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var submissionFile = new SubmissionFile
                    {
                        ModuleType = AttachmentModule.Assignment,
                        EntityId = assignment.AssignmentId,
                        FileName = safeFileName,
                        FilePath = Path.Combine(folderRelativePath, uniqueFileName).Replace('\\', '/'),
                        ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                        FileSize = file.Length,
                        UploadedAt = DateTimeOffset.UtcNow,
                        Status = "Active"
                    };

                    _context.SubmissionFiles.Add(submissionFile);
                }
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Assignment updated successfully." });
    }

    /// <summary>
    /// GET: api/Assignment/group/{groupId}/assignments
    /// Retrieves assignments for a specific group along with group-level student submission status and supervisor files.
    /// </summary>
    [HttpGet("group/{groupId}/assignments")]
    public async Task<IActionResult> GetAssignmentsForGroup(int groupId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        // Verify that the user is either a group member or the supervisor of this group
        var groupAssociation = await _context.GroupMembers
            .FirstOrDefaultAsync(m => m.GroupId == groupId);

        if (groupAssociation == null)
        {
            return NotFound(new { message = "Group not found." });
        }

        bool isMember = (groupAssociation.StudentId1 == userId.Value || groupAssociation.StudentId2 == userId.Value);
        bool isSupervisor = (groupAssociation.SupervisorId == userId.Value);

        if (!isMember && !isSupervisor)
        {
            return Forbid();
        }

        var assignments = await _context.Assignments
            .Where(a => a.GroupId == groupId)
            .OrderByDescending(a => a.AssignmentId)
            .Include(a => a.Submissions)
            .ToListAsync();

        var assignmentIds = assignments.Select(a => a.AssignmentId).ToList();

        // Fetch all supervisor attachment files for these assignments
        var supervisorFiles = await _context.SubmissionFiles
            .Where(f => f.ModuleType == AttachmentModule.Assignment && assignmentIds.Contains(f.EntityId))
            .ToListAsync();

        var result = assignments.Select(a => new
        {
            a.AssignmentId,
            a.Title,
            a.Description,
            a.Deadline,
            a.CreatedAt,
            Status = a.Deadline < DateTimeOffset.UtcNow ? "Closed" : "Active",
            SubmissionStatus = a.Submissions.FirstOrDefault()?.SubmissionStatus ?? "Not Submitted",
            Files = supervisorFiles
                .Where(f => f.EntityId == a.AssignmentId)
                .Select(f => new
                {
                    f.FileId,
                    f.FileName,
                    f.FilePath,
                    f.FileSize
                })
                .ToList()
        });

        return Ok(result);
    }

    /// <summary>
    /// GET: api/Assignment/submission/{assignmentId}
    /// Fetches the existing submission details and files for a given assignment.
    /// </summary>
    [HttpGet("submission/{assignmentId}")]
    public async Task<IActionResult> GetAssignmentSubmission(int assignmentId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var assignment = await _context.Assignments.FindAsync(assignmentId);
        if (assignment == null)
        {
            return NotFound(new { message = "Assignment not found." });
        }

        var submission = await _context.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId);

        if (submission == null)
        {
            return Ok(new { hasSubmitted = false });
        }

        var files = await _context.SubmissionFiles
            .Where(f => f.ModuleType == AttachmentModule.AssignmentSubmission && f.EntityId == submission.AssignmentSubmissionId && f.Status == "Active")
            .Select(f => new {
                fileId = f.FileId,
                fileName = f.FileName,
                fileSize = f.FileSize,
                uploadedAt = f.UploadedAt
            })
            .ToListAsync();

        return Ok(new {
            hasSubmitted = true,
            assignmentSubmissionId = submission.AssignmentSubmissionId,
            comment = submission.AssignmentFeedback,
            submissionStatus = submission.SubmissionStatus,
            submittedAt = submission.SubmittedAt,
            files = files
        });
    }

    /// <summary>
    /// DELETE: api/SubmissionFile/{fileId}
    /// Deletes an existing file associated with a submission.
    /// </summary>
    [HttpDelete("file/{fileId}")]
    public async Task<IActionResult> DeleteSubmissionFile(int fileId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var fileRecord = await _context.SubmissionFiles
            .FirstOrDefaultAsync(f => f.FileId == fileId && f.ModuleType == AttachmentModule.AssignmentSubmission);

        if (fileRecord == null)
        {
            return NotFound(new { message = "File not found." });
        }

        // Optional: Verify that the user belongs to the group that owns this submission
        var submission = await _context.AssignmentSubmissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.AssignmentSubmissionId == fileRecord.EntityId);

        if (submission != null)
        {
            var isMember = await _context.GroupMembers
                .AnyAsync(m => m.GroupId == submission.Assignment.GroupId && (m.StudentId1 == userId.Value || m.StudentId2 == userId.Value));

            if (!isMember)
            {
                return Forbid();
            }
        }

        // Delete physical file from disk
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var fullPath = Path.Combine(webRoot, fileRecord.FilePath);
        if (System.IO.File.Exists(fullPath))
        {
            try { System.IO.File.Delete(fullPath); } catch { /* ignore if locked */ }
        }

        // Remove from DB
        _context.SubmissionFiles.Remove(fileRecord);
        await _context.SaveChangesAsync();

        return Ok(new { message = "File removed successfully." });
    }
    /// <summary>
    /// POST: api/Assignment/submit
    /// Allows submitting an assignment for the group (mapped via AssignmentId per database schema).
    /// </summary>
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitAssignment(
        [FromForm] int assignmentId,
        [FromForm] string? comment,
        [FromForm] List<IFormFile>? files)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var assignment = await _context.Assignments.FindAsync(assignmentId);
        if (assignment == null)
        {
            return NotFound(new { message = "Assignment not found." });
        }

        // Verify student is in the group assigned to this assignment
        var isMember = await _context.GroupMembers
            .AnyAsync(m => m.GroupId == assignment.GroupId && (m.StudentId1 == userId.Value || m.StudentId2 == userId.Value));

        if (!isMember)
        {
            return Forbid();
        }

        // AssignmentSubmission maps uniquely to AssignmentId per schema definition provided
        var submission = await _context.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId);

        if (submission == null)
        {
            submission = new AssignmentSubmission
            {
                AssignmentId = assignmentId,
                SubmissionStatus = "Submitted",
                SubmittedAt = DateTimeOffset.UtcNow,
                AssignmentFeedback = comment
            };
            _context.AssignmentSubmissions.Add(submission);
            await _context.SaveChangesAsync();
        }
        else
        {
            submission.SubmissionStatus = "Submitted";
            submission.SubmittedAt = DateTimeOffset.UtcNow;
            submission.AssignmentFeedback = comment;
            _context.AssignmentSubmissions.Update(submission);
            await _context.SaveChangesAsync();
        }

        // Handle student submission file uploads
        if (files != null && files.Count > 0)
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var folderRelativePath = Path.Combine("uploads", AttachmentModule.AssignmentSubmission.ToString(), submission.AssignmentSubmissionId.ToString());
            var uploadsFolder = Path.Combine(webRoot, folderRelativePath);

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var safeFileName = Path.GetFileName(file.FileName);
                    var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var submissionFile = new SubmissionFile
                    {
                        ModuleType = AttachmentModule.AssignmentSubmission,
                        EntityId = submission.AssignmentSubmissionId,
                        FileName = safeFileName,
                        FilePath = Path.Combine(folderRelativePath, uniqueFileName).Replace('\\', '/'),
                        ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                        FileSize = file.Length,
                        UploadedAt = DateTimeOffset.UtcNow,
                        Status = "Active"
                    };

                    _context.SubmissionFiles.Add(submissionFile);
                }
            }
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Assignment submitted successfully." });
    }

    /// <summary>
    /// DELETE: api/Assignment/{id}
    /// Deletes an assignment and all its attached submission files.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var assignment = await _context.Assignments
            .Include(a => a.Submissions)
            .FirstOrDefaultAsync(a => a.AssignmentId == id);

        if (assignment == null)
        {
            return NotFound(new { message = "Assignment not found." });
        }

        var isSupervisor = await _context.GroupMembers
            .AnyAsync(m => m.GroupId == assignment.GroupId && m.SupervisorId == userId.Value);

        if (!isSupervisor)
        {
            return Forbid();
        }

        var files = await _context.SubmissionFiles
            .Where(f => f.ModuleType == AttachmentModule.Assignment && f.EntityId == id)
            .ToListAsync();

        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        foreach (var file in files)
        {
            var fullPath = Path.Combine(webRoot, file.FilePath);
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
            _context.SubmissionFiles.Remove(file);
        }

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Assignment deleted successfully." });
    }

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
}