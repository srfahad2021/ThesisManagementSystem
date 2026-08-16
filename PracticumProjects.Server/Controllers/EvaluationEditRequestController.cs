using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EvaluationEditRequestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EvaluationEditRequestController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value 
                           ?? User.FindFirst("UserId")?.Value;

            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID claim not found or invalid.");
        }

        #region --- SUPERVISOR / EXAMINER ENDPOINTS ---

        // GET: api/EvaluationEditRequest/my-evaluated-groups
        // Returns all groups in the evaluator's assigned boards that they have already evaluated
        [HttpGet("my-evaluated-groups")]
        public async Task<IActionResult> GetMyEvaluatedGroups()
        {
            int evaluatorId = GetCurrentUserId();

            var assignedBoardIds = await _context.BoardMembers
                .Where(bm => bm.UserId == evaluatorId)
                .Select(bm => bm.BoardId)
                .ToListAsync();

            if (!assignedBoardIds.Any())
            {
                return Ok(new List<object>());
            }

            // Get groups evaluated by this user in their boards
            var evaluatedGroupIds = await _context.StudentMarks
                .Where(sm => sm.EvaluatorId == evaluatorId)
                .Select(sm => sm.GroupId)
                .Distinct()
                .ToListAsync();

            var groups = await _context.BoardGroups
                .Include(bg => bg.ThesisGroup)
                    .ThenInclude(tg => tg.Semester)
                .Where(bg => assignedBoardIds.Contains(bg.BoardId) && evaluatedGroupIds.Contains(bg.GroupId))
                .Select(bg => new
                {
                    groupId = bg.ThesisGroup.GroupId,
                    groupName = bg.ThesisGroup.GroupName,
                    status = bg.ThesisGroup.Status.ToString(),
                    semesterName = bg.ThesisGroup.Semester != null 
                        ? $"{bg.ThesisGroup.Semester.SemesterType} {bg.ThesisGroup.Semester.Year}" 
                        : "N/A"
                })
                .Distinct()
                .ToListAsync();

            return Ok(groups);
        }

        // POST: api/EvaluationEditRequest/request-edit
        [HttpPost("request-edit")]
        public async Task<IActionResult> CreateEditRequest([FromBody] CreateEditRequestDto dto)
        {
            int evaluatorId = GetCurrentUserId();

            // Verify supervisor has evaluated this group
            bool hasEvaluated = await _context.StudentMarks
                .AnyAsync(sm => sm.GroupId == dto.GroupId && sm.EvaluatorId == evaluatorId);

            if (!hasEvaluated)
            {
                return BadRequest("You have not submitted an evaluation for this group yet.");
            }

            // Check if there is already a pending request
            bool existingPending = await _context.EvaluationEditRequests
                .AnyAsync(r => r.GroupId == dto.GroupId && r.EvaluatorId == evaluatorId && r.Status == EditRequestStatus.Pending);

            if (existingPending)
            {
                return BadRequest("You already have a pending edit request for this group.");
            }

            var request = new EvaluationEditRequest
            {
                GroupId = dto.GroupId,
                EvaluatorId = evaluatorId,
                Reason = dto.Reason,
                Status = EditRequestStatus.Pending,
                RequestedAt = DateTime.UtcNow
            };

            _context.EvaluationEditRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Edit request submitted successfully." });
        }

        // GET: api/EvaluationEditRequest/my-approved-groups
        // Returns groups that have an approved edit request for the logged-in supervisor
        [HttpGet("my-approved-groups")]
        public async Task<IActionResult> GetMyApprovedGroups()
        {
            int evaluatorId = GetCurrentUserId();

            var approvedGroupIds = await _context.EvaluationEditRequests
                .Where(r => r.EvaluatorId == evaluatorId && r.Status == EditRequestStatus.Approved)
                .Select(r => r.GroupId)
                .Distinct()
                .ToListAsync();

            var groups = await _context.ThesisGroups
                .Include(tg => tg.Semester)
                .Where(tg => approvedGroupIds.Contains(tg.GroupId))
                .Select(tg => new
                {
                    groupId = tg.GroupId,
                    groupName = tg.GroupName,
                    status = tg.Status.ToString(),
                    semesterName = tg.Semester != null 
                        ? $"{tg.Semester.SemesterType} {tg.Semester.Year}" 
                        : "N/A"
                })
                .ToListAsync();

            return Ok(groups);
        }

        // GET: api/EvaluationEditRequest/group-edit-details/{groupId}
        // Returns existing student marks alongside group info for editing
        [HttpGet("group-edit-details/{groupId}")]
        public async Task<IActionResult> GetGroupEditDetails(int groupId)
        {
            int evaluatorId = GetCurrentUserId();

            bool isApproved = await _context.EvaluationEditRequests
                .AnyAsync(r => r.GroupId == groupId && r.EvaluatorId == evaluatorId && r.Status == EditRequestStatus.Approved);

            if (!isApproved)
            {
                return Forbid("You do not have an approved edit request for this group.");
            }

            var group = await _context.ThesisGroups
                .Include(g => g.Semester)
                .FirstOrDefaultAsync(g => g.GroupId == groupId);

            if (group == null) return NotFound("Thesis group not found.");

            var topic = await _context.TopicSubmissions
                .Where(t => t.GroupId == groupId)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();

            var groupMember = await _context.GroupMembers
                .Include(gm => gm.Student1)
                .Include(gm => gm.Student2)
                .Include(gm => gm.Supervisor)
                .FirstOrDefaultAsync(gm => gm.GroupId == groupId);

            var membersList = new List<object>();

            if (groupMember != null)
            {
                if (groupMember.Student1 != null)
                {
                    var mark1 = await _context.StudentMarks
                        .FirstOrDefaultAsync(m => m.GroupId == groupId && m.StudentId == groupMember.Student1.UserId && m.EvaluatorId == evaluatorId);

                    membersList.Add(new
                    {
                        studentId = groupMember.Student1.UserId,
                        fullName = $"{groupMember.Student1.FirstName} {groupMember.Student1.LastName}".Trim(),
                        email = groupMember.Student1.Email,
                        existingMarks = mark1 != null ? new
                        {
                            researchTopicAndObjectives = mark1.ResearchTopicAndObjectives,
                            literatureReview = mark1.LiteratureReview,
                            methodology = mark1.Methodology,
                            developmentAndImplementation = mark1.DevelopmentAndImplementation,
                            testingAndResults = mark1.TestingAndResults,
                            documentationQuality = mark1.DocumentationQuality,
                            presentation = mark1.Presentation
                        } : null
                    });
                }

                if (groupMember.Student2 != null)
                {
                    var mark2 = await _context.StudentMarks
                        .FirstOrDefaultAsync(m => m.GroupId == groupId && m.StudentId == groupMember.Student2.UserId && m.EvaluatorId == evaluatorId);

                    membersList.Add(new
                    {
                        studentId = groupMember.Student2.UserId,
                        fullName = $"{groupMember.Student2.FirstName} {groupMember.Student2.LastName}".Trim(),
                        email = groupMember.Student2.Email,
                        existingMarks = mark2 != null ? new
                        {
                            researchTopicAndObjectives = mark2.ResearchTopicAndObjectives,
                            literatureReview = mark2.LiteratureReview,
                            methodology = mark2.Methodology,
                            developmentAndImplementation = mark2.DevelopmentAndImplementation,
                            testingAndResults = mark2.TestingAndResults,
                            documentationQuality = mark2.DocumentationQuality,
                            presentation = mark2.Presentation
                        } : null
                    });
                }
            }

            string supervisorName = groupMember?.Supervisor != null
                ? $"{groupMember.Supervisor.FirstName} {groupMember.Supervisor.LastName}".Trim()
                : "Not Assigned";

            return Ok(new
            {
                groupId = group.GroupId,
                groupName = group.GroupName,
                status = group.Status.ToString(),
                semesterName = group.Semester != null ? $"{group.Semester.SemesterType} {group.Semester.Year}" : "N/A",
                title = topic?.Title ?? "No Topic Title Submitted",
                supervisorName = supervisorName,
                members = membersList
            });
        }

        // POST: api/EvaluationEditRequest/submit-edit
        [HttpPost("submit-edit")]
        public async Task<IActionResult> SubmitEditedEvaluation([FromBody] EvaluationSubmitDto dto)
        {
            int evaluatorId = GetCurrentUserId();

            var activeRequest = await _context.EvaluationEditRequests
                .FirstOrDefaultAsync(r => r.GroupId == dto.GroupId && r.EvaluatorId == evaluatorId && r.Status == EditRequestStatus.Approved);

            if (activeRequest == null)
            {
                return Forbid("You are not authorized to edit this evaluation.");
            }

            foreach (var eval in dto.StudentEvaluations)
            {
                var mark = await _context.StudentMarks
                    .FirstOrDefaultAsync(m => m.GroupId == dto.GroupId && m.StudentId == eval.StudentId && m.EvaluatorId == evaluatorId);

                if (mark != null)
                {
                    mark.ResearchTopicAndObjectives = eval.ResearchTopicAndObjectives;
                    mark.LiteratureReview = eval.LiteratureReview;
                    mark.Methodology = eval.Methodology;
                    mark.DevelopmentAndImplementation = eval.DevelopmentAndImplementation;
                    mark.TestingAndResults = eval.TestingAndResults;
                    mark.DocumentationQuality = eval.DocumentationQuality;
                    mark.Presentation = eval.Presentation;
                    mark.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.StudentMarks.Add(new StudentMark
                    {
                        StudentId = eval.StudentId,
                        GroupId = dto.GroupId,
                        EvaluatorId = evaluatorId,
                        ResearchTopicAndObjectives = eval.ResearchTopicAndObjectives,
                        LiteratureReview = eval.LiteratureReview,
                        Methodology = eval.Methodology,
                        DevelopmentAndImplementation = eval.DevelopmentAndImplementation,
                        TestingAndResults = eval.TestingAndResults,
                        DocumentationQuality = eval.DocumentationQuality,
                        Presentation = eval.Presentation,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            // Mark request as Completed once saved
            activeRequest.Status = EditRequestStatus.Completed;
            activeRequest.ProcessedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Evaluation updated successfully." });
        }

        #endregion

        #region --- ADMIN ENDPOINTS ---

        // GET: api/EvaluationEditRequest/all-requests
        [HttpGet("all-requests")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAllEditRequests()
        {
            var requests = await _context.EvaluationEditRequests
                .Include(r => r.ThesisGroup)
                .Include(r => r.Evaluator)
                .OrderByDescending(r => r.RequestedAt)
                .Select(r => new
                {
                    requestId = r.RequestId,
                    groupId = r.GroupId,
                    groupName = r.ThesisGroup != null ? r.ThesisGroup.GroupName : "N/A",
                    evaluatorId = r.EvaluatorId,
                    evaluatorName = r.Evaluator != null ? $"{r.Evaluator.FirstName} {r.Evaluator.LastName}".Trim() : "N/A",
                    reason = r.Reason,
                    status = r.Status.ToString(),
                    requestedAt = r.RequestedAt,
                    adminRemarks = r.AdminRemarks
                })
                .ToListAsync();

            return Ok(requests);
        }

        // POST: api/EvaluationEditRequest/process-request
        [HttpPost("process-request")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ProcessEditRequest([FromBody] ProcessRequestDto dto)
        {
            int adminId = GetCurrentUserId();

            var req = await _context.EvaluationEditRequests.FindAsync(dto.RequestId);
            if (req == null) return NotFound("Edit request not found.");

            if (dto.Approve)
            {
                req.Status = EditRequestStatus.Approved;
            }
            else
            {
                req.Status = EditRequestStatus.Rejected;
            }

            req.ProcessedAt = DateTime.UtcNow;
            req.ProcessedByUserId = adminId;
            req.AdminRemarks = dto.AdminRemarks;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Request has been {(dto.Approve ? "Approved" : "Rejected")}." });
        }

        #endregion
    }

    public class CreateEditRequestDto
    {
        public int GroupId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ProcessRequestDto
    {
        public int RequestId { get; set; }
        public bool Approve { get; set; }
        public string? AdminRemarks { get; set; }
    }
}