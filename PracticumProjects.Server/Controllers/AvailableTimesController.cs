using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PracticumProjects.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvailableTimesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AvailableTimesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/AvailableTimes/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserAvailability(int userId)
        {
            var slots = await _context.AvailableTimes
                .Where(a => a.UserId == userId && a.IsActive)
                .OrderBy(a => a.DayOfWeek)
                .ThenBy(a => a.StartTime)
                .Select(a => new
                {
                    a.AvailabilityId,
                    a.UserId,
                    DayOfWeek = a.DayOfWeek.ToString(),
                    StartTime = a.StartTime.ToString(@"hh\:mm"),
                    EndTime = a.EndTime.ToString(@"hh\:mm"),
                    a.IsActive
                })
                .ToListAsync();

            return Ok(slots);
        }

        // GET: api/AvailableTimes/supervisor/{supervisorId}?date=2026-08-12
        [HttpGet("supervisor/{supervisorId}")]
        public async Task<IActionResult> GetSupervisorAvailability(int supervisorId, [FromQuery] DateTime? date)
        {
            var query = _context.AvailableTimes
                .Where(a => a.UserId == supervisorId && a.IsActive);

            // Filter by day of week if a specific date is passed
            if (date.HasValue)
            {
                var dayOfWeekEnum = (DayOfWeekEnum)Enum.Parse(typeof(DayOfWeekEnum), date.Value.DayOfWeek.ToString(), true);
                query = query.Where(a => a.DayOfWeek == dayOfWeekEnum);
            }

            var slots = await query
                .OrderBy(a => a.DayOfWeek)
                .ThenBy(a => a.StartTime)
                .Select(a => new
                {
                    a.AvailabilityId,
                    a.UserId,
                    DayOfWeek = a.DayOfWeek.ToString(),
                    StartTime = a.StartTime.ToString(@"hh\:mm"),
                    EndTime = a.EndTime.ToString(@"hh\:mm"),
                    a.IsActive
                })
                .ToListAsync();

            return Ok(slots);
        }

        // POST: api/AvailableTimes
        [HttpPost]
        public async Task<IActionResult> AddAvailability([FromBody] CreateAvailabilityDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Enum.TryParse<DayOfWeekEnum>(dto.DayOfWeek, true, out var dayOfWeek))
                return BadRequest("Invalid day of week value.");

            if (!TimeSpan.TryParse(dto.StartTime, out var parsedStartTime) || !TimeSpan.TryParse(dto.EndTime, out var parsedEndTime))
                return BadRequest("Invalid time format. Use HH:mm.");

            if (parsedStartTime >= parsedEndTime)
                return BadRequest("End time must be strictly after start time.");

            var slot = new AvailableTime
            {
                UserId = dto.UserId,
                DayOfWeek = dayOfWeek,
                StartTime = parsedStartTime,
                EndTime = parsedEndTime,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.AvailableTimes.Add(slot);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                slot.AvailabilityId,
                slot.UserId,
                DayOfWeek = slot.DayOfWeek.ToString(),
                StartTime = slot.StartTime.ToString(@"hh\:mm"),
                EndTime = slot.EndTime.ToString(@"hh\:mm"),
                slot.IsActive
            });
        }

        // DELETE: api/AvailableTimes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAvailability(int id)
        {
            var slot = await _context.AvailableTimes.FindAsync(id);
            if (slot == null)
                return NotFound("Availability slot not found.");

            _context.AvailableTimes.Remove(slot);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Slot removed successfully." });
        }
    }

    public class CreateAvailabilityDto
    {
        public int UserId { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
    }
}