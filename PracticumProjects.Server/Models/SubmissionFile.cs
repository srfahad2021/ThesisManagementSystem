using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models
{
    public enum AttachmentModule
    {
        TopicSubmission,
        Assignment,
        AssignmentSubmission,
        WeeklyReport,
        Exam,
        DocumentSubmission
    }

    [Table("submission_files")]
    public class SubmissionFile
    {
        [Key]
        [Column("file_id")]
        public int FileId { get; set; }

        [Required]
        [Column("module_type")]
        public AttachmentModule ModuleType { get; set; }

        [Required]
        [Column("entity_id")]
        public int EntityId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("file_name")]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        [Column("file_path")]
        public string FilePath { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("content_type")]
        public string? ContentType { get; set; }

        [Column("file_size")]
        public long FileSize { get; set; }

        [Column("uploaded_at")]
        public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "Under Review";

        [Column("review_comments")]
        public string? ReviewComments { get; set; }

        [Column("reviewed_at")]
        public DateTimeOffset? ReviewedAt { get; set; }

        [MaxLength(150)]
        [Column("reviewer_name")]
        public string? ReviewerName { get; set; }
    }
}