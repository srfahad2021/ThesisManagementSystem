using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NoticeController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public NoticeController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                   ?? User.FindFirst("sub")?.Value 
                   ?? User.FindFirst("UserId")?.Value;

        if (int.TryParse(idClaim, out int userId)) return userId;
        throw new UnauthorizedAccessException("User ID claim missing or invalid.");
    }

    private string GetCurrentUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value 
            ?? User.FindFirst("role")?.Value 
            ?? string.Empty;
    }

    // GET: api/Notice?typeFilter=ALL|PUBLIC|PRIVATE&groupId=0
    [HttpGet]
    public async Task<IActionResult> GetNotices([FromQuery] string typeFilter = "ALL", [FromQuery] int groupId = 0)
    {
        int userId = GetCurrentUserId();
        string role = GetCurrentUserRole().ToUpper();

        IQueryable<Notice> query = _context.Notices
            .Include(n => n.Author)
            .Include(n => n.TargetGroups)
                .ThenInclude(tg => tg.ThesisGroup);

        // 1. User Specific Access Filtering
        if (role == "ADMIN" || role == "COORDINATOR")
        {
            // Admins & Coordinators see everything by default
            if (groupId > 0)
            {
                query = query.Where(n => n.NoticeType == NoticeType.Private && n.TargetGroups.Any(tg => tg.GroupId == groupId));
            }
        }
        else if (role == "SUPERVISOR")
        {
            // Supervisor sees Public notices OR Private notices assigned to their supervised groups OR notices created by them
            var supervisorGroupIds = await _context.GroupMembers
                .Where(gm => gm.SupervisorId == userId)
                .Select(gm => gm.GroupId)
                .ToListAsync();

            query = query.Where(n => n.NoticeType == NoticeType.Public 
                                  || n.AuthorId == userId 
                                  || (n.NoticeType == NoticeType.Private && n.TargetGroups.Any(tg => supervisorGroupIds.Contains(tg.GroupId))));
        }
        else if (role == "STUDENT")
        {
            // Student sees Public notices OR Private notices targeting their group
            var studentGroupIds = await _context.GroupMembers
                .Where(gm => gm.StudentId1 == userId || gm.StudentId2 == userId)
                .Select(gm => gm.GroupId)
                .ToListAsync();

            query = query.Where(n => n.NoticeType == NoticeType.Public 
                                  || (n.NoticeType == NoticeType.Private && n.TargetGroups.Any(tg => studentGroupIds.Contains(tg.GroupId))));
        }

        // 2. Public / Private Tab Filtering
        if (typeFilter.Equals("PUBLIC", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(n => n.NoticeType == NoticeType.Public);
        }
        else if (typeFilter.Equals("PRIVATE", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(n => n.NoticeType == NoticeType.Private);
        }

        var notices = await query.OrderByDescending(n => n.CreatedAt).ToListAsync();

        // Get file attachments for these notices
        var noticeIds = notices.Select(n => n.NoticeId).ToList();
        var filesMap = await _context.SubmissionFiles
            .Where(f => f.ModuleType == AttachmentModule.NoticeBoard && noticeIds.Contains(f.EntityId))
            .ToListAsync();

        var dtos = notices.Select(n => new
        {
            noticeId = n.NoticeId,
            title = n.Title,
            content = n.Content,
            noticeType = n.NoticeType.ToString(),
            authorId = n.AuthorId,
            authorName = n.Author != null ? $"{n.Author.FirstName} {n.Author.LastName}".Trim() : "System",
            createdAt = n.CreatedAt,
            updatedAt = n.UpdatedAt,
            targetGroupIds = n.TargetGroups.Select(tg => tg.GroupId).ToList(),
            targetGroupNames = n.TargetGroups.Select(tg => tg.ThesisGroup != null ? tg.ThesisGroup.GroupName : "").ToList(),
            attachments = filesMap.Where(f => f.EntityId == n.NoticeId).Select(f => new
            {
                fileId = f.FileId,
                fileName = f.FileName,
                fileSize = f.FileSize,
                contentType = f.ContentType
            })
        });

        return Ok(dtos);
    }

    // GET: api/Notice/assignable-groups
    [HttpGet("assignable-groups")]
    public async Task<IActionResult> GetAssignableGroups()
    {
        int userId = GetCurrentUserId();
        string role = GetCurrentUserRole().ToUpper();

        IQueryable<ThesisGroup> query = _context.ThesisGroups.Include(g => g.Semester);

        if (role == "SUPERVISOR")
        {
            var myGroupIds = await _context.GroupMembers
                .Where(gm => gm.SupervisorId == userId)
                .Select(gm => gm.GroupId)
                .ToListAsync();

            query = query.Where(g => myGroupIds.Contains(g.GroupId));
        }

        var groups = await query.Select(g => new
        {
            groupId = g.GroupId,
            groupName = g.GroupName,
            semesterName = g.Semester != null ? $"{g.Semester.SemesterType} {g.Semester.Year}" : ""
        }).ToListAsync();

        return Ok(groups);
    }

    // POST: api/Notice
    [HttpPost]
    public async Task<IActionResult> CreateNotice([FromForm] CreateNoticeDto dto)
    {
        int userId = GetCurrentUserId();
        string role = GetCurrentUserRole().ToUpper();

        NoticeType type = NoticeType.Public;
        if (Enum.TryParse<NoticeType>(dto.NoticeType, true, out var parsedType))
        {
            type = parsedType;
        }

        if (role == "SUPERVISOR")
        {
            type = NoticeType.Private; // Supervisor notice is always private
        }

        var notice = new Notice
        {
            Title = dto.Title,
            Content = dto.Content,
            NoticeType = type,
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        if (type == NoticeType.Private && dto.TargetGroupIds != null && dto.TargetGroupIds.Count > 0)
        {
            foreach (var gid in dto.TargetGroupIds.Distinct())
            {
                notice.TargetGroups.Add(new NoticeTargetGroup { GroupId = gid });
            }
        }

        _context.Notices.Add(notice);
        await _context.SaveChangesAsync();

        // Handle file uploads
        if (dto.Files != null && dto.Files.Count > 0)
        {
            await SaveFilesForNotice(notice.NoticeId, dto.Files);
        }

        return Ok(new { message = "Notice created successfully.", noticeId = notice.NoticeId });
    }

    // PUT: api/Notice/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateNotice(int id, [FromForm] UpdateNoticeDto dto)
    {
        int userId = GetCurrentUserId();
        string role = GetCurrentUserRole().ToUpper();

        var notice = await _context.Notices.Include(n => n.TargetGroups).FirstOrDefaultAsync(n => n.NoticeId == id);
        if (notice == null) return NotFound("Notice not found.");

        // Check ownership/permissions
        if (role != "ADMIN" && role != "COORDINATOR" && notice.AuthorId != userId)
        {
            return Forbid("You are not authorized to update this notice.");
        }

        notice.Title = dto.Title;
        notice.Content = dto.Content;
        notice.UpdatedAt = DateTime.UtcNow;

        if (role != "SUPERVISOR" && Enum.TryParse<NoticeType>(dto.NoticeType, true, out var parsedType))
        {
            notice.NoticeType = parsedType;
        }

        // Update target groups
        _context.NoticeTargetGroups.RemoveRange(notice.TargetGroups);
        if (notice.NoticeType == NoticeType.Private && dto.TargetGroupIds != null)
        {
            foreach (var gid in dto.TargetGroupIds.Distinct())
            {
                _context.NoticeTargetGroups.Add(new NoticeTargetGroup { NoticeId = id, GroupId = gid });
            }
        }

        await _context.SaveChangesAsync();

        // Append new files if provided
        if (dto.Files != null && dto.Files.Count > 0)
        {
            await SaveFilesForNotice(notice.NoticeId, dto.Files);
        }

        return Ok(new { message = "Notice updated successfully." });
    }

    // DELETE: api/Notice/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteNotice(int id)
    {
        int userId = GetCurrentUserId();
        string role = GetCurrentUserRole().ToUpper();

        var notice = await _context.Notices.FindAsync(id);
        if (notice == null) return NotFound("Notice not found.");

        // Admin & Coordinator can delete any notice. Supervisor can delete their own.
        if (role != "ADMIN" && role != "COORDINATOR" && notice.AuthorId != userId)
        {
            return Forbid("You are not authorized to delete this notice.");
        }

        // Delete associated files on disk & database
        var files = await _context.SubmissionFiles
            .Where(f => f.ModuleType == AttachmentModule.NoticeBoard && f.EntityId == id)
            .ToListAsync();

        var basePath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        foreach (var f in files)
        {
            var absolutePath = Path.Combine(basePath, f.FilePath);
            if (System.IO.File.Exists(absolutePath))
            {
                try { System.IO.File.Delete(absolutePath); } catch { }
            }
        }

        _context.SubmissionFiles.RemoveRange(files);
        _context.Notices.Remove(notice);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Notice deleted successfully." });
    }

    private async Task SaveFilesForNotice(int noticeId, List<IFormFile> files)
    {
        var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var folderRelativePath = Path.Combine("uploads", "NoticeBoard", noticeId.ToString());
        var uploadsFolder = Path.Combine(webRoot, folderRelativePath);

        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        foreach (var file in files)
        {
            if (file.Length == 0) continue;

            var safeFileName = Path.GetFileName(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
            var fullPath = Path.Combine(uploadsFolder, uniqueFileName);

            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var submissionFile = new SubmissionFile
            {
                ModuleType = AttachmentModule.NoticeBoard,
                EntityId = noticeId,
                FileName = safeFileName,
                FilePath = Path.Combine(folderRelativePath, uniqueFileName).Replace('\\', '/'),
                ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                FileSize = file.Length,
                UploadedAt = DateTimeOffset.UtcNow,
                Status = "Published"
            };

            _context.SubmissionFiles.Add(submissionFile);
        }

        await _context.SaveChangesAsync();
    }
}

public class CreateNoticeDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string NoticeType { get; set; } = "Public";
    public List<int>? TargetGroupIds { get; set; }
    public List<IFormFile>? Files { get; set; }
}

public class UpdateNoticeDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string NoticeType { get; set; } = "Public";
    public List<int>? TargetGroupIds { get; set; }
    public List<IFormFile>? Files { get; set; }
}