using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Models;
using PracticumProjects.Server.Data;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PracticumProjects.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires valid JWT token from sessionStorage Header
    public class SemesterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SemesterController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/semester
        [HttpGet]
        public async Task<IActionResult> GetSemesters()
        {
            var semesters = await _context.Semesters
                .OrderByDescending(s => s.Year)
                .ThenByDescending(s => s.SemesterType)
                .Select(s => new
                {
                    semesterId = s.SemesterId,
                    semesterType = s.SemesterType.ToString(),
                    year = s.Year,
                    startDate = s.StartDate,
                    endDate = s.EndDate,
                    status = s.Status.ToString(),
                    createdAt = s.CreatedAt,
                    // Dynamically counts groups registered in this semester
                    groupCount = _context.ThesisGroups.Count(g => g.SemesterId == s.SemesterId)
                })
                .ToListAsync();

            return Ok(semesters);
        }

        // GET: api/semester/active
        // Used by frontend dropdowns (e.g., Board creation/editing)
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveSemesters()
        {
            var semesters = await _context.Semesters
                .Where(s => s.Status == SemesterStatus.Active)
                .OrderByDescending(s => s.Year)
                .ThenByDescending(s => s.SemesterType)
                .Select(s => new
                {
                    id = s.SemesterId,
                    displayName = $"{s.SemesterType} {s.Year}"
                })
                .ToListAsync();

            return Ok(semesters);
        }

        // GET: api/semester/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSemester(int id)
        {
            var semester = await _context.Semesters
                .Where(s => s.SemesterId == id)
                .Select(s => new
                {
                    semesterId = s.SemesterId,
                    semesterType = s.SemesterType.ToString(),
                    year = s.Year,
                    startDate = s.StartDate,
                    endDate = s.EndDate,
                    status = s.Status.ToString(),
                    createdAt = s.CreatedAt,
                    groupCount = _context.ThesisGroups.Count(g => g.SemesterId == s.SemesterId)
                })
                .FirstOrDefaultAsync();

            if (semester == null)
            {
                return NotFound(new { message = "Semester not found." });
            }

            return Ok(semester);
        }

        // POST: api/semester
        [HttpPost]
        public async Task<IActionResult> CreateSemester([FromBody] CreateSemesterDto dto)
        {
            if (!IsAdmin())
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!Enum.TryParse<SemesterType>(dto.SemesterType, true, out var semType))
            {
                return BadRequest(new { message = "Invalid semester type. Must be Fall, Spring, or Summer." });
            }

            if (!Enum.TryParse<SemesterStatus>(dto.Status, true, out var semStatus))
            {
                semStatus = SemesterStatus.Active;
            }

            var semester = new Semester
            {
                SemesterType = semType,
                Year = dto.Year,
                StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc),
                Status = semStatus,
                CreatedAt = DateTime.UtcNow
            };

            _context.Semesters.Add(semester);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSemester), new { id = semester.SemesterId }, new
            {
                semesterId = semester.SemesterId,
                semesterType = semester.SemesterType.ToString(),
                year = semester.Year,
                startDate = semester.StartDate,
                endDate = semester.EndDate,
                status = semester.Status.ToString(),
                createdAt = semester.CreatedAt,
                groupCount = 0
            });
        }

        // PUT: api/semester/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSemester(int id, [FromBody] UpdateSemesterDto dto)
        {
            if (!IsAdmin())
            {
                return Forbid();
            }

            var semester = await _context.Semesters.FindAsync(id);
            if (semester == null)
            {
                return NotFound(new { message = "Semester not found." });
            }

            if (!Enum.TryParse<SemesterType>(dto.SemesterType, true, out var semType))
            {
                return BadRequest(new { message = "Invalid semester type. Must be Fall, Spring, or Summer." });
            }

            if (!Enum.TryParse<SemesterStatus>(dto.Status, true, out var semStatus))
            {
                return BadRequest(new { message = "Invalid status value." });
            }

            semester.SemesterType = semType;
            semester.Year = dto.Year;
            semester.StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
            semester.EndDate = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc);
            semester.Status = semStatus;

            await _context.SaveChangesAsync();

            var groupCount = await _context.ThesisGroups.CountAsync(g => g.SemesterId == id);

            return Ok(new
            {
                semesterId = semester.SemesterId,
                semesterType = semester.SemesterType.ToString(),
                year = semester.Year,
                startDate = semester.StartDate,
                endDate = semester.EndDate,
                status = semester.Status.ToString(),
                createdAt = semester.CreatedAt,
                groupCount
            });
        }

        // Helper method to verify if the requesting user is an Admin via JWT claims
        private bool IsAdmin()
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            return string.Equals(roleClaim, "ADMIN", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(roleClaim, "Admin", StringComparison.OrdinalIgnoreCase);
        }
    }

    // Data Transfer Objects (DTOs)
    public class CreateSemesterDto
    {
        public string SemesterType { get; set; } = string.Empty;
        public int Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Active";
    }

    public class UpdateSemesterDto
    {
        public string SemesterType { get; set; } = string.Empty;
        public int Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Active";
    }
}