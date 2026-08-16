using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data; // Ensure this matches your DbContext namespace
using PracticumProjects.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PracticumProjects.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeetingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MeetingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        #region DTOs

        public class CreateMeetingRequestDto
        {
            public int GroupId { get; set; }
            public int HostId { get; set; }
            public int RequestedByUserId { get; set; }
            public int? AvailabilityId { get; set; }
            public string MeetingDate { get; set; } = string.Empty; // Format: YYYY-MM-DD
            public string StartTime { get; set; } = string.Empty;   // Format: HH:mm or HH:mm:ss
            public string EndTime { get; set; } = string.Empty;     // Format: HH:mm or HH:mm:ss
            public string Medium { get; set; } = "Offline";
            public string? LocationOrLink { get; set; }
            public string Title { get; set; } = string.Empty;
            public string? Agenda { get; set; }
        }

        public class MeetingResponseDto
        {
            public int MeetingId { get; set; }
            public int GroupId { get; set; }
            public string GroupName { get; set; } = string.Empty;
            public int HostId { get; set; }
            public string SupervisorName { get; set; } = string.Empty;
            public int RequestedByUserId { get; set; }
            public string RequestedBy { get; set; } = string.Empty;
            public int? AvailabilityId { get; set; }
            public string MeetingDate { get; set; } = string.Empty;
            public string StartTime { get; set; } = string.Empty;
            public string EndTime { get; set; } = string.Empty;
            public string Medium { get; set; } = string.Empty;
            public string? LocationOrLink { get; set; }
            public string Title { get; set; } = string.Empty;
            public string? Agenda { get; set; }
            public string Status { get; set; } = string.Empty;
            public string? RejectionReason { get; set; }
            public MeetingSummaryDto? Summary { get; set; }
        }

        public class MeetingSummaryDto
        {
            public int SubmittedBy { get; set; }
            public string SummaryText { get; set; } = string.Empty;
            public string ActionItems { get; set; } = string.Empty;
        }

        public class StatusUpdateDto
        {
            public string Status { get; set; } = string.Empty;
            public string? RejectionReason { get; set; }
        }

        #endregion

        // GET: api/Meetings/host/{hostId}
        [HttpGet("host/{hostId}")]
        public async Task<IActionResult> GetMeetingsByHost(int hostId)
        {
            var meetings = await _context.Meetings
                .Include(m => m.ThesisGroup)
                .Include(m => m.Host)
                .Include(m => m.RequestedByUser)
                .Include(m => m.Summary)
                .Where(m => m.HostId == hostId)
                .OrderByDescending(m => m.MeetingDate)
                .ThenBy(m => m.StartTime)
                .ToListAsync();

            var result = meetings.Select(MapToResponseDto).ToList();
            return Ok(result);
        }

        // GET: api/Meetings/group/{groupId}
        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetMeetingsByGroup(int groupId)
        {
            var meetings = await _context.Meetings
                .Include(m => m.ThesisGroup)
                .Include(m => m.Host)
                .Include(m => m.RequestedByUser)
                .Include(m => m.Summary)
                .Where(m => m.GroupId == groupId)
                .OrderByDescending(m => m.MeetingDate)
                .ThenBy(m => m.StartTime)
                .ToListAsync();

            var result = meetings.Select(MapToResponseDto).ToList();
            return Ok(result);
        }

        // POST: api/Meetings/request
        [HttpPost("request")]
        public async Task<IActionResult> RequestMeeting([FromBody] CreateMeetingRequestDto request)
        {
            if (request == null)
            {
                return BadRequest("Invalid meeting request data.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate Group existence in ThesisGroup table
            var groupExists = await _context.ThesisGroups.AnyAsync(g => g.GroupId == request.GroupId);
            if (!groupExists)
            {
                return BadRequest($"Thesis Group with ID {request.GroupId} does not exist.");
            }

            // Validate Host user existence
            var hostExists = await _context.Users.AnyAsync(u => u.UserId == request.HostId);
            if (!hostExists)
            {
                return BadRequest($"Host/Supervisor with ID {request.HostId} does not exist.");
            }

            // Validate RequestedByUser existence
            var userExists = await _context.Users.AnyAsync(u => u.UserId == request.RequestedByUserId);
            if (!userExists)
            {
                return BadRequest($"User with ID {request.RequestedByUserId} does not exist.");
            }

            // Parse Date and Time
            if (!DateTime.TryParse(request.MeetingDate, out var parsedDate))
            {
                return BadRequest("Invalid MeetingDate format. Expected format: YYYY-MM-DD.");
            }

            if (!TimeSpan.TryParse(request.StartTime, out var parsedStartTime) ||
                !TimeSpan.TryParse(request.EndTime, out var parsedEndTime))
            {
                return BadRequest("Invalid StartTime or EndTime format. Expected format: HH:mm or HH:mm:ss.");
            }

            // Parse Enum Medium
            if (!Enum.TryParse<MeetingMedium>(request.Medium, true, out var parsedMedium))
            {
                parsedMedium = MeetingMedium.Offline;
            }

            // Construct entity (MeetingId is left unassigned for auto-increment)
            var meetingEntity = new Meeting
            {
                GroupId = request.GroupId,
                HostId = request.HostId,
                RequestedByUserId = request.RequestedByUserId,
                AvailabilityId = request.AvailabilityId,
                MeetingDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc),
                StartTime = parsedStartTime,
                EndTime = parsedEndTime,
                Medium = parsedMedium,
                LocationOrLink = request.LocationOrLink,
                Title = request.Title?.Trim() ?? string.Empty,
                Agenda = request.Agenda?.Trim(),
                Status = MeetingStatus.PENDING,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Meetings.Add(meetingEntity);
            await _context.SaveChangesAsync(); // Auto-generates MeetingId in database

            // Re-fetch created entity with navigation props for response mapping
            var createdMeeting = await _context.Meetings
                .Include(m => m.ThesisGroup)
                .Include(m => m.Host)
                .Include(m => m.RequestedByUser)
                .FirstOrDefaultAsync(m => m.MeetingId == meetingEntity.MeetingId);

            return CreatedAtAction(
                nameof(GetMeetingsByGroup),
                new { groupId = meetingEntity.GroupId },
                MapToResponseDto(createdMeeting ?? meetingEntity)
            );
        }

        // PUT: api/Meetings/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateMeetingStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null)
            {
                return NotFound($"Meeting with ID {id} not found.");
            }

            if (!Enum.TryParse<MeetingStatus>(dto.Status, true, out var parsedStatus))
            {
                return BadRequest($"Invalid status value: {dto.Status}");
            }

            meeting.Status = parsedStatus;
            meeting.RejectionReason = parsedStatus == MeetingStatus.REJECTED ? dto.RejectionReason : null;
            meeting.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Meeting status updated successfully.", MeetingId = meeting.MeetingId, Status = meeting.Status.ToString() });
        }

        // POST: api/Meetings/{id}/summary
        [HttpPost("{id}/summary")]
        public async Task<IActionResult> SaveMeetingSummary(int id, [FromBody] MeetingSummaryDto summaryDto)
        {
            var meeting = await _context.Meetings
                .Include(m => m.Summary)
                .FirstOrDefaultAsync(m => m.MeetingId == id);

            if (meeting == null)
            {
                return NotFound($"Meeting with ID {id} not found.");
            }

            var submitterExists = await _context.Users.AnyAsync(u => u.UserId == summaryDto.SubmittedBy);
            if (!submitterExists)
            {
                return BadRequest($"Submitter user with ID {summaryDto.SubmittedBy} does not exist.");
            }

            if (meeting.Summary == null)
            {
                var summary = new MeetingSummary
                {
                    MeetingId = id,
                    SubmittedBy = summaryDto.SubmittedBy,
                    SummaryText = summaryDto.SummaryText,
                    ActionItems = summaryDto.ActionItems,
                    SubmittedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.MeetingSummaries.Add(summary);
            }
            else
            {
                meeting.Summary.SubmittedBy = summaryDto.SubmittedBy;
                meeting.Summary.SummaryText = summaryDto.SummaryText;
                meeting.Summary.ActionItems = summaryDto.ActionItems;
                meeting.Summary.UpdatedAt = DateTime.UtcNow;
            }

            meeting.Status = MeetingStatus.COMPLETED;
            meeting.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Summary saved and meeting marked as COMPLETED." });
        }

        #region Helper Methods

        private static MeetingResponseDto MapToResponseDto(Meeting m)
        {
            string hostFullName = GetUserFullName(m.Host, "Supervisor");
            string requestedByFullName = GetUserFullName(m.RequestedByUser, "Student");

            return new MeetingResponseDto
            {
                MeetingId = m.MeetingId,
                GroupId = m.GroupId,
                GroupName = m.ThesisGroup?.GroupName ?? $"Group {m.GroupId}",
                HostId = m.HostId,
                SupervisorName = hostFullName,
                RequestedByUserId = m.RequestedByUserId,
                RequestedBy = requestedByFullName,
                AvailabilityId = m.AvailabilityId,
                MeetingDate = m.MeetingDate.ToString("yyyy-MM-dd"),
                StartTime = m.StartTime.ToString(@"hh\:mm"),
                EndTime = m.EndTime.ToString(@"hh\:mm"),
                Medium = m.Medium.ToString(),
                LocationOrLink = m.LocationOrLink,
                Title = m.Title,
                Agenda = m.Agenda,
                Status = m.Status.ToString(),
                RejectionReason = m.RejectionReason,
                Summary = m.Summary == null ? null : new MeetingSummaryDto
                {
                    SubmittedBy = m.Summary.SubmittedBy,
                    SummaryText = m.Summary.SummaryText,
                    ActionItems = m.Summary.ActionItems ?? string.Empty
                }
            };
        }

        private static string GetUserFullName(User? user, string fallback)
        {
            if (user == null) return fallback;

            string fullName = $"{user.FirstName} {user.LastName}".Trim();
            if (!string.IsNullOrWhiteSpace(fullName))
            {
                return fullName;
            }

            return !string.IsNullOrWhiteSpace(user.Username) ? user.Username : fallback;
        }

        #endregion
    }
}