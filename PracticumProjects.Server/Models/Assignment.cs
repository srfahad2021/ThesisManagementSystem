using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models
{
    [Table("assignments")]
    public class Assignment
    {
        [Key]
        [Column("assignment_id")]
        public int AssignmentId { get; set; }

        // ADDED: Foreign key and navigation property to link to ThesisGroup
        [Required]
        [Column("group_id")]
        public int GroupId { get; set; }

        [ForeignKey(nameof(GroupId))]
        public virtual ThesisGroup ThesisGroup { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("deadline")]
        public DateTimeOffset Deadline { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        [Column("updated_at")]
        public DateTimeOffset? UpdatedAt { get; set; }

        // Files uploaded by the teacher for this assignment (EntityId = AssignmentId, ModuleType = Assignment)
        [NotMapped]
        public ICollection<SubmissionFile> Files { get; set; } = new List<SubmissionFile>();

        // Navigation property for student submissions
        public ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
    }
}