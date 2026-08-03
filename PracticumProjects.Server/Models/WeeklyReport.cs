using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models
{
    [Table("weekly_reports")]
    public class WeeklyReport
    {
        [Key]
        [Column("report_id")]
        public int ReportId { get; set; }

        [Column("group_id")]
        public int GroupId { get; set; }

        [Column("week_number")]
        [Range(1, 36, ErrorMessage = "Week number must be between 1 and 36.")]
        public int WeekNumber { get; set; }

        [Required]
        [Column("summary_text")]
        public string SummaryText { get; set; } = string.Empty;

        [Column("status")]
        public string Status { get; set; } = "PENDING_SUPERVISOR";

        [Column("supervisor_feedback")]
        public string? SupervisorFeedback { get; set; }

        [Column("coordinator_feedback")]
        public string? CoordinatorFeedback { get; set; }

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        [NotMapped]
        public List<SubmissionFile> Files { get; set; } = new();
    }
}