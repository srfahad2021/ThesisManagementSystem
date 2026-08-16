using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models;

[Table("meeting_summaries")]
public class MeetingSummary
{
    [Key]
    [Column("summary_id")]
    public int SummaryId { get; set; }

    [Required]
    [Column("meeting_id")]
    public int MeetingId { get; set; }

    [ForeignKey(nameof(MeetingId))]
    public virtual Meeting Meeting { get; set; } = null!;

    [Required]
    [Column("submitted_by")]
    public int SubmittedBy { get; set; }

    [ForeignKey(nameof(SubmittedBy))]
    public virtual User Submitter { get; set; } = null!;

    [Required]
    [Column("summary_text")]
    public string SummaryText { get; set; } = string.Empty;

    [Column("action_items")]
    public string? ActionItems { get; set; }

    [Column("submitted_at")]
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}