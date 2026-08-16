using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;
using System.Security.Claims;

namespace PracticumProjects.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubmissionFileController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public SubmissionFileController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // GET: api/SubmissionFile?moduleType=TopicSubmission&entityId=10
    // GET: api/SubmissionFile/module/TopicSubmission/10
    [HttpGet] 
    [HttpGet("module/{moduleType}/{entityId:int}")]
    public async Task<ActionResult<IEnumerable<SubmissionFileDto>>> GetFilesByEntity(
        [FromQuery] AttachmentModule? moduleType,
        [FromQuery] int? entityId,
        [FromRoute(Name = "moduleType")] AttachmentModule? routeModuleType = null,
        [FromRoute(Name = "entityId")] int? routeEntityId = null)
    {
        var finalModule = moduleType ?? routeModuleType;
        var finalEntityId = entityId ?? routeEntityId;

        if (finalModule == null || finalEntityId == null)
        {
            return BadRequest(new { message = "Both 'moduleType' and 'entityId' are required parameters." });
        }

        var files = await _context.SubmissionFiles
            .AsNoTracking()
            .Where(f => f.ModuleType == finalModule.Value && f.EntityId == finalEntityId.Value)
            .OrderByDescending(f => f.UploadedAt)
            .ToListAsync();

        var dtos = files.Select(MapToDto);

        return Ok(dtos);
    }

    // POST: api/SubmissionFile/upload
    [HttpPost("upload")]
    public async Task<ActionResult<SubmissionFileDto>> UploadFile(
        [FromForm] AttachmentModule moduleType, 
        [FromForm] int entityId, 
        IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file was uploaded." });
        }

        var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var folderRelativePath = Path.Combine("uploads", moduleType.ToString(), entityId.ToString());
        var uploadsFolder = Path.Combine(webRoot, folderRelativePath);

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var safeFileName = Path.GetFileName(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
        var fullPath = Path.Combine(uploadsFolder, uniqueFileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var submissionFile = new SubmissionFile
        {
            ModuleType = moduleType,
            EntityId = entityId,
            FileName = safeFileName,
            FilePath = Path.Combine(folderRelativePath, uniqueFileName).Replace('\\', '/'),
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            FileSize = file.Length,
            UploadedAt = DateTimeOffset.UtcNow,
            Status = "Under Review"
        };

        _context.SubmissionFiles.Add(submissionFile);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFileById), new { id = submissionFile.FileId }, MapToDto(submissionFile));
    }

    // --- NEW REVIEW ENDPOINTS (Accepts both PUT and POST) ---
    [HttpPut("review/{id:int}")]
    [HttpPost("review/{id:int}")]
    public async Task<IActionResult> ReviewFile(int id, [FromBody] ReviewSubmissionRequest request)
    {
        var fileRecord = await _context.SubmissionFiles.FindAsync(id);
        if (fileRecord == null)
        {
            return NotFound(new { message = $"File with ID {id} not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest(new { message = "Status is required." });
        }

        var reviewerName = User.FindFirst(ClaimTypes.Name)?.Value 
                        ?? User.FindFirst("name")?.Value 
                        ?? "Supervisor";

        fileRecord.Status = request.Status;
        fileRecord.ReviewComments = request.ReviewComments;
        fileRecord.ReviewedAt = DateTimeOffset.UtcNow;
        fileRecord.ReviewerName = reviewerName;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(fileRecord));
    }

    // GET: api/SubmissionFile/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SubmissionFileDto>> GetFileById(int id)
    {
        var file = await _context.SubmissionFiles.FindAsync(id);
        if (file == null)
        {
            return NotFound(new { message = $"File with ID {id} not found." });
        }

        return Ok(MapToDto(file));
    }

    // GET: api/SubmissionFile/download/5
    [HttpGet("download/{id:int}")]
    public async Task<IActionResult> DownloadFile(int id)
    {
        var fileRecord = await _context.SubmissionFiles.FindAsync(id);
        if (fileRecord == null)
        {
            return NotFound(new { message = "File metadata record not found." });
        }

        var basePath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var absolutePath = Path.Combine(basePath, fileRecord.FilePath);

        if (!System.IO.File.Exists(absolutePath))
        {
            var alternativePath = Path.Combine(Directory.GetCurrentDirectory(), fileRecord.FilePath);
            
            if (System.IO.File.Exists(alternativePath))
            {
                absolutePath = alternativePath; // Found it in the fallback location!
            }
        }

        // 3. Final check if it exists anywhere
        if (!System.IO.File.Exists(absolutePath))
        {
            return NotFound(new { message = "Physical file not found on disk." });
        }

        var contentType = fileRecord.ContentType ?? "application/octet-stream";
        var fileBytes = await System.IO.File.ReadAllBytesAsync(absolutePath);

        return File(fileBytes, contentType, fileRecord.FileName);
    }

    // DELETE: api/SubmissionFile/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteFile(int id)
    {
        var fileRecord = await _context.SubmissionFiles.FindAsync(id);
        if (fileRecord == null)
        {
            return NotFound(new { message = $"File with ID {id} not found." });
        }

        var basePath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var absolutePath = Path.Combine(basePath, fileRecord.FilePath);

        if (System.IO.File.Exists(absolutePath))
        {
            try
            {
                System.IO.File.Delete(absolutePath);
            }
            catch (Exception)
            {
            }
        }

        _context.SubmissionFiles.Remove(fileRecord);
        await _context.SaveChangesAsync();

        return Ok(new { message = "File deleted successfully." });
    }

    

    private static SubmissionFileDto MapToDto(SubmissionFile file)
    {
        return new SubmissionFileDto
        {
            FileId = file.FileId,
            ModuleType = file.ModuleType.ToString(),
            EntityId = file.EntityId,
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.FileSize,
            UploadedAt = file.UploadedAt,
            Status = file.Status,
            ReviewComments = file.ReviewComments,
            ReviewedAt = file.ReviewedAt,
            ReviewerName = file.ReviewerName
        };
    }
}

public class ReviewSubmissionRequest
{
    public string Status { get; set; } = string.Empty;
    public string? ReviewComments { get; set; }
}

public class SubmissionFileDto
{
    public int FileId { get; set; }
    public string ModuleType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public long FileSize { get; set; }
    public DateTimeOffset UploadedAt { get; set; }
    public string Status { get; set; } = "Under Review";
    public string? ReviewComments { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? ReviewerName { get; set; }
}