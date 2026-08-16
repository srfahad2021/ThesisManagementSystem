using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PracticumProjects.Models;

namespace PracticumProjects.Server.Models;

[Table("meetings")]
public class Meeting
{
    [Key]
    [Column("meeting_id")]
    public int MeetingId { get; set; }

    [Required]
    [Column("group_id")]
    public int GroupId { get; set; }

    [ForeignKey(nameof(GroupId))]
    public virtual ThesisGroup ThesisGroup { get; set; } = null!;

    /// <summary>
    /// The Faculty / Supervisor hosting or responding to the meeting request.
    /// </summary>
    [Required]
    [Column("host_id")]
    public int HostId { get; set; }

    [ForeignKey(nameof(HostId))]
    public virtual User Host { get; set; } = null!;

    /// <summary>
    /// The specific student user who submitted this meeting request on behalf of the group.
    /// </summary>
    [Required]
    [Column("requested_by_user_id")]
    public int RequestedByUserId { get; set; }

    [ForeignKey(nameof(RequestedByUserId))]
    public virtual User RequestedByUser { get; set; } = null!;

    /// <summary>
    /// Optional reference to the host's selected recurring availability time slot.
    /// </summary>
    [Column("availability_id")]
    public int? AvailabilityId { get; set; }

    [ForeignKey(nameof(AvailabilityId))]
    public virtual AvailableTime? AvailableTime { get; set; }

    [Required]
    [Column("meeting_date")]
    public DateTime MeetingDate { get; set; }

    [Required]
    [Column("start_time")]
    public TimeSpan StartTime { get; set; }

    [Required]
    [Column("end_time")]
    public TimeSpan EndTime { get; set; }

    [Required]
    [Column("medium")]
    public MeetingMedium Medium { get; set; } = MeetingMedium.Offline;

    [MaxLength(500)]
    [Column("location_or_link")]
    public string? LocationOrLink { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("agenda")]
    public string? Agenda { get; set; }

    [Required]
    [Column("status")]
    public MeetingStatus Status { get; set; } = MeetingStatus.PENDING;

    [Column("rejection_reason")]
    public string? RejectionReason { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property for 1-to-1 post-meeting summary
    public virtual MeetingSummary? Summary { get; set; }
}