using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models
{
    [Table("submission_files")]
    public class SubmissionFile
    {
        [Key]
        [Column("file_id")]
        public int FileId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("entity_type")]
        public string EntityType { get; set; } = string.Empty; // e.g., "WEEKLY_REPORT", "TOPIC_SUBMISSION"

        [Column("entity_id")]
        public int EntityId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("file_name")]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(512)]
        [Column("file_path")]
        public string FilePath { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("file_type")]
        public string FileType { get; set; } = string.Empty;

        [Column("file_size_bytes")]
        public long FileSizeBytes { get; set; }

        [Column("uploaded_at")]
        public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}