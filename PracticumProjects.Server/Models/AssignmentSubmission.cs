using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models
{
    [Table("assignment_submissions")]
    public class AssignmentSubmission
    {
        [Key]
        [Column("assignment_submission_id")]
        public int AssignmentSubmissionId { get; set; }

        [Required]
        [Column("assignment_id")]
        public int AssignmentId { get; set; }

        [ForeignKey("AssignmentId")]
        public Assignment? Assignment { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("submission_status")]
        public string SubmissionStatus { get; set; } = "Submitted"; // e.g., Submitted, Graded

        [Column("submission_text")]
        public string? SubmissionText { get; set; }

        [Column("assignment_feedback")]
        public string? AssignmentFeedback { get; set; }

        [Column("grade")]
        public decimal? Grade { get; set; }

        [Column("submitted_at")]
        public DateTimeOffset SubmittedAt { get; set; } = DateTimeOffset.UtcNow;

        [Column("graded_at")]
        public DateTimeOffset? GradedAt { get; set; }

        [MaxLength(150)]
        [Column("grader_name")]
        public string? GraderName { get; set; }

        // Files uploaded by the student for this submission (EntityId = AssignmentSubmissionId, ModuleType = AssignmentSubmission)
        [NotMapped]
        public ICollection<SubmissionFile> Files { get; set; } = new List<SubmissionFile>();
    }
}