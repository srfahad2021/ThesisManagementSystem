using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models
{
    [Table("weekly_reports")]
    public class WeeklyReport
    {
        // --- Nested Enums ---
        public enum ApprovalStatus
        {
            Pending,
            Approved,
            Rejected,
            RevisionRequested
        }

        public enum ReportStatus
        {
            PendingSupervisor,
            PendingCoordinator,
            Accepted,
            Rejected,
            RevisionRequested
        }

        [Key]
        [Column("report_id")]
        public int ReportId { get; set; }

        [Column("group_id")]
        public int GroupId { get; set; }

        [Column("submitted_by_student_id")]
        public int SubmittedByStudentId { get; set; }

        [Column("week_number")]
        [Range(1, 36, ErrorMessage = "Week number must be between 1 and 36.")]
        public int WeekNumber { get; set; }

        [Required]
        [Column("summary_text")]
        public string SummaryText { get; set; } = string.Empty;

        // --- Overall Flow Status ---
        [Column("status")]
        public ReportStatus Status { get; set; } = ReportStatus.PendingSupervisor;

        // --- Stage 1: Supervisor Approval ---
        [Column("supervisor_status")]
        public ApprovalStatus SupervisorStatus { get; set; } = ApprovalStatus.Pending;

        [Column("supervisor_feedback")]
        public string? SupervisorFeedback { get; set; }

        [Column("supervisor_reviewed_at")]
        public DateTimeOffset? SupervisorReviewedAt { get; set; }

        // --- Stage 2: Coordinator Approval ---
        [Column("coordinator_status")]
        public ApprovalStatus CoordinatorStatus { get; set; } = ApprovalStatus.Pending;

        [Column("coordinator_id")]
        public int? CoordinatorId { get; set; }

        [Column("coordinator_feedback")]
        public string? CoordinatorFeedback { get; set; }

        [Column("coordinator_reviewed_at")]
        public DateTimeOffset? CoordinatorReviewedAt { get; set; }

        // --- Metadata ---
        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        [NotMapped]
        public List<SubmissionFile> Files { get; set; } = new();
    }
}