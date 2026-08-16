using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeeklyReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly string _uploadFolder;

        public WeeklyReportsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _uploadFolder = Path.Combine(env.ContentRootPath, "Uploads", "WeeklyReports");
            if (!Directory.Exists(_uploadFolder))
            {
                Directory.CreateDirectory(_uploadFolder);
            }
        }

        // GET: api/WeeklyReports/supervisor/groups
        [HttpGet("supervisor/groups")]
        public async Task<IActionResult> GetSupervisorGroups([FromQuery] int? supervisorId)
        {
            if (!supervisorId.HasValue)
            {
                var claimVal = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("id")?.Value
                            ?? User.FindFirst("UserId")?.Value;

                if (int.TryParse(claimVal, out int parsedId))
                {
                    supervisorId = parsedId;
                }
            }

            if (!supervisorId.HasValue)
            {
                return BadRequest("Supervisor ID could not be identified.");
            }

            var supervisorGroupMemberships = await _context.GroupMembers
                .Include(gm => gm.ThesisGroup)
                .Where(gm => gm.SupervisorId == supervisorId.Value)
                .ToListAsync();

            if (!supervisorGroupMemberships.Any())
            {
                return Ok(new List<object>()); 
            }

            var supervisorGroupIds = supervisorGroupMemberships.Select(gm => gm.GroupId).ToList();

            var reports = await _context.WeeklyReports
                .Where(r => supervisorGroupIds.Contains(r.GroupId))
                .ToListAsync();

            var reportStats = reports
                .GroupBy(r => r.GroupId)
                .ToDictionary(
                    g => g.Key,
                    g => new
                    {
                        PendingCount = g.Count(r => r.Status == WeeklyReport.ReportStatus.PendingSupervisor || (int)r.Status == 0),
                        SubmittedCount = g.Count(),
                        LastSubmittedAt = (DateTimeOffset?)g.Max(r => r.CreatedAt)
                    }
                );

            var result = supervisorGroupMemberships.Select(gm => 
            {
                var gId = gm.GroupId;
                var groupName = gm.ThesisGroup?.GroupName; 

                return new
                {
                    groupId = gId,
                    groupName = string.IsNullOrEmpty(groupName) ? $"Group #{gId}" : groupName,
                    pendingCount = reportStats.ContainsKey(gId) ? reportStats[gId].PendingCount : 0,
                    submittedCount = reportStats.ContainsKey(gId) ? reportStats[gId].SubmittedCount : 0,
                    lastSubmittedAt = reportStats.ContainsKey(gId) ? reportStats[gId].LastSubmittedAt : null
                };
            })
            .OrderByDescending(x => x.pendingCount)
            .ThenByDescending(x => x.lastSubmittedAt)
            .ToList();

            return Ok(result);
        }

        // GET: api/WeeklyReports/coordinator/groups
        [HttpGet("coordinator/groups")]
        public async Task<IActionResult> GetCoordinatorGroups()
        {
            // Fetch all thesis groups
            var groups = await _context.ThesisGroups.ToListAsync();

            // Fetch all weekly reports to calculate coordinator stats
            var reports = await _context.WeeklyReports.ToListAsync();

            var reportStats = reports
                .GroupBy(r => r.GroupId)
                .ToDictionary(
                    g => g.Key,
                    g => new
                    {
                        // Pending coordinator review if Status is PendingCoordinator or 1
                        PendingCount = g.Count(r => r.Status == WeeklyReport.ReportStatus.PendingCoordinator || (int)r.Status == 1),
                        SubmittedCount = g.Count(),
                        LastSubmittedAt = (DateTimeOffset?)g.Max(r => r.CreatedAt)
                    }
                );

            var result = groups.Select(g =>
            {
                var gId = g.GroupId;
                var groupName = g.GroupName;

                return new
                {
                    groupId = gId,
                    groupName = string.IsNullOrEmpty(groupName) ? $"Group #{gId}" : groupName,
                    pendingCount = reportStats.ContainsKey(gId) ? reportStats[gId].PendingCount : 0,
                    submittedCount = reportStats.ContainsKey(gId) ? reportStats[gId].SubmittedCount : 0,
                    lastSubmittedAt = reportStats.ContainsKey(gId) ? reportStats[gId].LastSubmittedAt : null
                };
            })
            // Removed .Where(x => x.submittedCount > 0) to ensure ALL groups are displayed
            .OrderByDescending(x => x.pendingCount)
            .ThenByDescending(x => x.lastSubmittedAt)
            .ToList();

            return Ok(result);
        }

        // GET: api/WeeklyReports/group/101
        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetReportsByGroup(int groupId)
        {
            var reports = await _context.WeeklyReports
                .Where(r => r.GroupId == groupId)
                .OrderBy(r => r.WeekNumber)
                .ToListAsync();

            var reportIds = reports.Select(r => r.ReportId).ToList();

            var files = await _context.SubmissionFiles
                .Where(f => f.ModuleType == AttachmentModule.WeeklyReport && reportIds.Contains(f.EntityId))
                .ToListAsync();

            foreach (var report in reports)
            {
                report.Files = files.Where(f => f.EntityId == report.ReportId).ToList();
            }

            return Ok(reports);
        }

        // POST: api/WeeklyReports/submit
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitReport([FromForm] int groupId, [FromForm] int studentId, [FromForm] int weekNumber, [FromForm] string summaryText, [FromForm] IFormFileCollection? files)
        {
            var existingReport = await _context.WeeklyReports
                .FirstOrDefaultAsync(r => r.GroupId == groupId && r.WeekNumber == weekNumber);

            WeeklyReport report;

            if (existingReport != null)
            {
                bool isEditable = existingReport.Status == WeeklyReport.ReportStatus.Rejected
                    || (int)existingReport.Status == 3
                    || existingReport.Status.ToString().Equals("RevisionRequested", StringComparison.OrdinalIgnoreCase)
                    || (int)existingReport.Status == 4;

                if (!isEditable)
                {
                    return BadRequest(new { message = $"A report for Week {weekNumber} has already been submitted and cannot be edited." });
                }

                existingReport.SubmittedByStudentId = studentId;
                existingReport.SummaryText = summaryText;
                existingReport.Status = WeeklyReport.ReportStatus.PendingSupervisor;
                existingReport.SupervisorStatus = WeeklyReport.ApprovalStatus.Pending;
                existingReport.CoordinatorStatus = WeeklyReport.ApprovalStatus.Pending;
                existingReport.UpdatedAt = DateTimeOffset.UtcNow;

                report = existingReport;
            }
            else
            {
                report = new WeeklyReport
                {
                    GroupId = groupId,
                    SubmittedByStudentId = studentId,
                    WeekNumber = weekNumber,
                    SummaryText = summaryText,
                    Status = WeeklyReport.ReportStatus.PendingSupervisor,
                    SupervisorStatus = WeeklyReport.ApprovalStatus.Pending,
                    CoordinatorStatus = WeeklyReport.ApprovalStatus.Pending,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                _context.WeeklyReports.Add(report);
            }

            await _context.SaveChangesAsync();

            if (files != null && files.Count > 0)
            {
                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                        var filePath = Path.Combine(_uploadFolder, uniqueFileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        var submissionFile = new SubmissionFile
                        {
                            ModuleType = AttachmentModule.WeeklyReport,
                            EntityId = report.ReportId,
                            FileName = file.FileName,
                            FilePath = filePath,
                            ContentType = file.ContentType,
                            FileSize = file.Length,
                            UploadedAt = DateTimeOffset.UtcNow
                        };

                        _context.SubmissionFiles.Add(submissionFile);
                    }
                }
                await _context.SaveChangesAsync();
            }

            report.Files = await _context.SubmissionFiles
                .Where(f => f.ModuleType == AttachmentModule.WeeklyReport && f.EntityId == report.ReportId)
                .ToListAsync();

            return Ok(report);
        }

        // DELETE: api/WeeklyReports/delete-file/5
        [HttpDelete("delete-file/{fileId}")]
        public async Task<IActionResult> DeleteFile(int fileId)
        {
            var fileRecord = await _context.SubmissionFiles.FindAsync(fileId);
            if (fileRecord == null)
            {
                return NotFound(new { message = "Attachment record not found." });
            }

            if (!string.IsNullOrEmpty(fileRecord.FilePath) && System.IO.File.Exists(fileRecord.FilePath))
            {
                try
                {
                    System.IO.File.Delete(fileRecord.FilePath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to delete file on disk: {ex.Message}");
                }
            }

            _context.SubmissionFiles.Remove(fileRecord);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Attachment deleted successfully." });
        }

        // POST: api/WeeklyReports/supervisor/review/5
        [HttpPost("supervisor/review/{reportId}")]
        public async Task<IActionResult> SupervisorReviewByPath(int reportId, [FromBody] SupervisorReviewRequestDto dto)
        {
            return await ProcessSupervisorReview(reportId, dto);
        }

        // POST: api/WeeklyReports/supervisor-review
        [HttpPost("supervisor-review")]
        public async Task<IActionResult> SupervisorReview([FromBody] SupervisorReviewRequestDto dto)
        {
            int reportId = dto.ReportId ?? 0;
            if (reportId == 0) return BadRequest(new { message = "ReportId is required in request body." });
            return await ProcessSupervisorReview(reportId, dto);
        }

        private async Task<IActionResult> ProcessSupervisorReview(int reportId, SupervisorReviewRequestDto dto)
        {
            var report = await _context.WeeklyReports.FindAsync(reportId);
            if (report == null) return NotFound(new { message = "Weekly report not found." });

            report.SupervisorFeedback = dto.Feedback;
            report.SupervisorReviewedAt = DateTimeOffset.UtcNow;
            report.UpdatedAt = DateTimeOffset.UtcNow;

            bool isApproved = dto.IsApproved ?? (dto.Status == 1);
            bool isRejected = dto.Status == 3 || (dto.IsApproved.HasValue && !dto.IsApproved.Value && dto.Status != 4);
            bool isRevision = dto.Status == 4;

            if (isApproved)
            {
                report.SupervisorStatus = WeeklyReport.ApprovalStatus.Approved;
                report.Status = WeeklyReport.ReportStatus.PendingCoordinator;
            }
            else if (isRevision)
            {
                if (Enum.TryParse<WeeklyReport.ReportStatus>("RevisionRequested", true, out var revReportStatus))
                {
                    report.Status = revReportStatus;
                }
                else
                {
                    report.Status = WeeklyReport.ReportStatus.PendingSupervisor;
                }

                if (Enum.TryParse<WeeklyReport.ApprovalStatus>("RevisionRequested", true, out var revApprovalStatus))
                {
                    report.SupervisorStatus = revApprovalStatus;
                }
                else
                {
                    report.SupervisorStatus = WeeklyReport.ApprovalStatus.Pending;
                }
            }
            else if (isRejected)
            {
                report.SupervisorStatus = WeeklyReport.ApprovalStatus.Rejected;
                report.Status = WeeklyReport.ReportStatus.Rejected;
            }

            await _context.SaveChangesAsync();
            return Ok(report);
        }

        // POST: api/WeeklyReports/coordinator/review/5
        [HttpPost("coordinator/review/{reportId}")]
        public async Task<IActionResult> CoordinatorReviewByPath(int reportId, [FromBody] CoordinatorReviewRequestDto dto)
        {
            return await ProcessCoordinatorReview(reportId, dto);
        }

        // POST: api/WeeklyReports/coordinator-review
        [HttpPost("coordinator-review")]
        public async Task<IActionResult> CoordinatorReview([FromBody] CoordinatorReviewRequestDto dto)
        {
            int reportId = dto.ReportId ?? 0;
            if (reportId == 0) return BadRequest(new { message = "ReportId is required in request body." });
            return await ProcessCoordinatorReview(reportId, dto);
        }

        private async Task<IActionResult> ProcessCoordinatorReview(int reportId, CoordinatorReviewRequestDto dto)
        {
            var report = await _context.WeeklyReports.FindAsync(reportId);
            if (report == null) return NotFound(new { message = "Weekly report not found." });

            if (report.SupervisorStatus != WeeklyReport.ApprovalStatus.Approved)
            {
                return BadRequest(new { message = "Coordinator cannot review before Supervisor approval." });
            }

            report.CoordinatorId = dto.CoordinatorId;
            report.CoordinatorFeedback = dto.Feedback;
            report.CoordinatorReviewedAt = DateTimeOffset.UtcNow;
            report.UpdatedAt = DateTimeOffset.UtcNow;

            bool isApproved = dto.IsApproved ?? (dto.Status == 2);
            bool isRevision = dto.Status == 4;
            bool isRejected = dto.Status == 3 || (dto.IsApproved.HasValue && !dto.IsApproved.Value && !isRevision);

            if (isApproved)
            {
                report.CoordinatorStatus = WeeklyReport.ApprovalStatus.Approved;
                report.Status = WeeklyReport.ReportStatus.Accepted;
            }
            else if (isRevision)
            {
                if (Enum.TryParse<WeeklyReport.ReportStatus>("RevisionRequested", true, out var revReportStatus))
                {
                    report.Status = revReportStatus;
                }
                else
                {
                    report.Status = WeeklyReport.ReportStatus.PendingSupervisor;
                }

                if (Enum.TryParse<WeeklyReport.ApprovalStatus>("RevisionRequested", true, out var revApprovalStatus))
                {
                    report.CoordinatorStatus = revApprovalStatus;
                }
                else
                {
                    report.CoordinatorStatus = WeeklyReport.ApprovalStatus.Pending;
                }
            }
            else if (isRejected)
            {
                report.CoordinatorStatus = WeeklyReport.ApprovalStatus.Rejected;
                report.Status = WeeklyReport.ReportStatus.Rejected;
            }

            await _context.SaveChangesAsync();
            return Ok(report);
        }

        // GET: api/WeeklyReports/download-file/5
        [HttpGet("download-file/{fileId}")]
        public async Task<IActionResult> DownloadFile(int fileId)
        {
            var fileRecord = await _context.SubmissionFiles.FindAsync(fileId);
            if (fileRecord == null || !System.IO.File.Exists(fileRecord.FilePath))
            {
                return NotFound("File not found on server.");
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(fileRecord.FilePath);
            return File(fileBytes, fileRecord.ContentType ?? "application/octet-stream", fileRecord.FileName);
        }
    }

    public class SupervisorReviewRequestDto
    {
        public int? ReportId { get; set; }
        public int? Status { get; set; }
        public bool? IsApproved { get; set; }
        public string? Feedback { get; set; }
    }

    public class CoordinatorReviewRequestDto
    {
        public int? ReportId { get; set; }
        public int CoordinatorId { get; set; }
        public int? Status { get; set; }
        public bool? IsApproved { get; set; }
        public string? Feedback { get; set; }
    }
}