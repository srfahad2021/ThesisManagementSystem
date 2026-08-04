using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models
{
    public enum AttachmentModule
    {
        TopicSubmission,
        Assignment,
        WeeklyReport,
        Exam
    }

    [Table("submission_files")]
    public class SubmissionFile
    {
        [Key]
        [Column("file_id")]
        public int FileId { get; set; }

        /// <summary>
        /// Identifies the parent module: TopicSubmission, Assignment, WeeklyReport, Exam, etc.
        /// </summary>

        [Required]
        [Column("module_type")]
        public AttachmentModule ModuleType { get; set; }

        /// <summary>
        /// The primary key ID of the parent record (e.g., TopicId, AssignmentId, WeeklyReportId, ExamId).
        /// </summary>
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
    }
}