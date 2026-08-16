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
    public class ExaminerEvaluationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExaminerEvaluationController(ApplicationDbContext context)
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

        #region --- STUDENT ENDPOINTS ---

        // GET: api/ExaminerEvaluation/my-student-groups
        [HttpGet("my-student-groups")]
        public async Task<IActionResult> GetMyStudentGroups()
        {
            int studentId = GetCurrentUserId();

            // Find all group member records where the current user is Student1 or Student2
            var myGroups = await _context.GroupMembers
                .Include(gm => gm.ThesisGroup)
                    .ThenInclude(tg => tg.Semester)
                .Where(gm => gm.StudentId1 == studentId || gm.StudentId2 == studentId)
                .Select(gm => new
                {
                    groupId = gm.ThesisGroup.GroupId,
                    groupName = gm.ThesisGroup.GroupName,
                    status = gm.ThesisGroup.Status.ToString(),
                    semesterName = gm.ThesisGroup.Semester != null 
                        ? $"{gm.ThesisGroup.Semester.SemesterType} {gm.ThesisGroup.Semester.Year}" 
                        : "N/A"
                })
                .Distinct()
                .ToListAsync();

            return Ok(myGroups);
        }

        // GET: api/ExaminerEvaluation/student-evaluation/{groupId}
        [HttpGet("student-evaluation/{groupId}")]
        public async Task<IActionResult> GetStudentEvaluation(int groupId)
        {
            int studentId = GetCurrentUserId();

            // Verify student actually belongs to this group
            bool isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == groupId && (gm.StudentId1 == studentId || gm.StudentId2 == studentId));

            if (!isMember)
            {
                return Forbid("You are not a member of this thesis group.");
            }

            var group = await _context.ThesisGroups
                .Include(g => g.Semester)
                .FirstOrDefaultAsync(g => g.GroupId == groupId);

            if (group == null)
            {
                return NotFound("Thesis group not found.");
            }

            // Fetch marks entries for this specific student and group
            var evaluations = await _context.StudentMarks
                .Include(sm => sm.Evaluator)
                .Where(sm => sm.GroupId == groupId && sm.StudentId == studentId)
                .Select(sm => new
                {
                    markId = sm.MarkId,
                    evaluatorId = sm.EvaluatorId,
                    evaluatorName = sm.Evaluator != null 
                        ? $"{sm.Evaluator.FirstName} {sm.Evaluator.LastName}".Trim() 
                        : "Examiner",
                    researchTopicAndObjectives = sm.ResearchTopicAndObjectives,
                    literatureReview = sm.LiteratureReview,
                    methodology = sm.Methodology,
                    developmentAndImplementation = sm.DevelopmentAndImplementation,
                    testingAndResults = sm.TestingAndResults,
                    documentationQuality = sm.DocumentationQuality,
                    presentation = sm.Presentation,
                    totalMarks = sm.TotalMarks,
                    createdAt = sm.CreatedAt
                })
                .ToListAsync();

            string semesterString = group.Semester != null 
                ? $"{group.Semester.SemesterType} {group.Semester.Year}" 
                : "N/A";

            return Ok(new
            {
                groupId = group.GroupId,
                groupName = group.GroupName,
                semesterName = semesterString,
                evaluations = evaluations
            });
        }

        #endregion

        #region --- EXAMINER / EVALUATOR ENDPOINTS ---

        // GET: api/ExaminerEvaluation/unevaluated-groups
        [HttpGet("unevaluated-groups")]
        public async Task<IActionResult> GetUnevaluatedGroups()
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

            var evaluatedGroupIds = await _context.StudentMarks
                .Where(sm => sm.EvaluatorId == evaluatorId)
                .Select(sm => sm.GroupId)
                .Distinct()
                .ToListAsync();

            var groups = await _context.BoardGroups
                .Where(bg => assignedBoardIds.Contains(bg.BoardId) && !evaluatedGroupIds.Contains(bg.GroupId))
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

        // GET: api/ExaminerEvaluation/group-details/{groupId}
        [HttpGet("group-details/{groupId}")]
        public async Task<IActionResult> GetGroupDetails(int groupId)
        {
            int evaluatorId = GetCurrentUserId();

            var assignedBoardIds = _context.BoardMembers
                .Where(bm => bm.UserId == evaluatorId)
                .Select(bm => bm.BoardId);

            bool isAuthorized = await _context.BoardGroups
                .AnyAsync(bg => bg.GroupId == groupId && assignedBoardIds.Contains(bg.BoardId));

            if (!isAuthorized)
            {
                return Forbid("You are not authorized to evaluate this group.");
            }

            var group = await _context.ThesisGroups
                .Include(g => g.Semester)
                .FirstOrDefaultAsync(g => g.GroupId == groupId);

            if (group == null)
            {
                return NotFound("Thesis group not found.");
            }

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
                    membersList.Add(new
                    {
                        studentId = groupMember.Student1.UserId,
                        fullName = $"{groupMember.Student1.FirstName} {groupMember.Student1.LastName}".Trim(),
                        email = groupMember.Student1.Email
                    });
                }

                if (groupMember.Student2 != null)
                {
                    membersList.Add(new
                    {
                        studentId = groupMember.Student2.UserId,
                        fullName = $"{groupMember.Student2.FirstName} {groupMember.Student2.LastName}".Trim(),
                        email = groupMember.Student2.Email
                    });
                }
            }

            string supervisorName = groupMember?.Supervisor != null
                ? $"{groupMember.Supervisor.FirstName} {groupMember.Supervisor.LastName}".Trim()
                : "Not Assigned";

            string semesterString = group.Semester != null
                ? $"{group.Semester.SemesterType} {group.Semester.Year}"
                : "N/A";

            return Ok(new
            {
                groupId = group.GroupId,
                groupName = group.GroupName,
                status = group.Status.ToString(),
                semesterName = semesterString,
                title = topic?.Title ?? "No Topic Title Submitted",
                topicAbstract = topic?.Abstract ?? "",
                problemStatement = topic?.ProblemStatement ?? "",
                objectives = topic?.Objectives ?? "",
                supervisorName = supervisorName,
                members = membersList
            });
        }

        // POST: api/ExaminerEvaluation/submit
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitEvaluation([FromBody] EvaluationSubmitDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            int evaluatorId = GetCurrentUserId();

            bool alreadyEvaluated = await _context.StudentMarks
                .AnyAsync(sm => sm.GroupId == dto.GroupId && sm.EvaluatorId == evaluatorId);

            if (alreadyEvaluated)
            {
                return BadRequest("You have already submitted an evaluation for this group.");
            }

            var groupMember = await _context.GroupMembers
                .FirstOrDefaultAsync(gm => gm.GroupId == dto.GroupId);

            if (groupMember == null)
            {
                return BadRequest("Group members not found for this group.");
            }

            List<int> targetStudentIds = dto.StudentIds;

            if (targetStudentIds == null || !targetStudentIds.Any())
            {
                targetStudentIds = new List<int>();
                if (groupMember.StudentId1.HasValue) targetStudentIds.Add(groupMember.StudentId1.Value);
                if (groupMember.StudentId2.HasValue) targetStudentIds.Add(groupMember.StudentId2.Value);
            }

            if (!targetStudentIds.Any())
            {
                return BadRequest("No students associated with this group to evaluate.");
            }

            var marksList = new List<StudentMark>();

            foreach (var studentId in targetStudentIds)
            {
                var mark = new StudentMark
                {
                    StudentId = studentId,
                    GroupId = dto.GroupId,
                    EvaluatorId = evaluatorId,
                    ResearchTopicAndObjectives = dto.ResearchTopicAndObjectives,
                    LiteratureReview = dto.LiteratureReview,
                    Methodology = dto.Methodology,
                    DevelopmentAndImplementation = dto.DevelopmentAndImplementation,
                    TestingAndResults = dto.TestingAndResults,
                    DocumentationQuality = dto.DocumentationQuality,
                    Presentation = dto.Presentation,
                    CreatedAt = DateTime.UtcNow
                };
                marksList.Add(mark);
            }

            _context.StudentMarks.AddRange(marksList);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Evaluation submitted successfully." });
        }

        #endregion
    }

    public class EvaluationSubmitDto
    {
        public int GroupId { get; set; }
        public List<int> StudentIds { get; set; } = new();

        public decimal ResearchTopicAndObjectives { get; set; }
        public decimal LiteratureReview { get; set; }
        public decimal Methodology { get; set; }
        public decimal DevelopmentAndImplementation { get; set; }
        public decimal TestingAndResults { get; set; }
        public decimal DocumentationQuality { get; set; }
        public decimal Presentation { get; set; }
        public string? Remarks { get; set; }
    }
}