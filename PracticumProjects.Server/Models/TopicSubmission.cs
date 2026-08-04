using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models
{
    [Table("topic_submissions")]
    public class TopicSubmission
    {
        [Key]
        [Column("topic_id")]
        public int TopicId { get; set; }

        [Required]
        [Column("group_id")]
        public int GroupId { get; set; }

        [Required]
        [MaxLength(500)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("abstract")]
        public string Abstract { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("keywords")]
        public string? Keywords { get; set; }

        [Required]
        [Column("problem_statement")]
        public string ProblemStatement { get; set; } = string.Empty;

        [Required]
        [Column("objectives")]
        public string Objectives { get; set; } = string.Empty;

        [Column("status")]
        public TopicStatus Status { get; set; } = TopicStatus.DRAFT;

        [Column("supervisor_feedback")]
        public string? SupervisorFeedback { get; set; }

        [Column("coordinator_feedback")]
        public string? CoordinatorFeedback { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        [NotMapped]
        public List<SubmissionFile> Attachments { get; set; } = new();
    }
}