using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models
{
    public enum EditRequestStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
        Completed = 3
    }

    public class EvaluationEditRequest
    {
        [Key]
        public int RequestId { get; set; }

        public int GroupId { get; set; }

        [ForeignKey("GroupId")]
        public virtual ThesisGroup? ThesisGroup { get; set; }

        public int EvaluatorId { get; set; }

        [ForeignKey("EvaluatorId")]
        public virtual User? Evaluator { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;

        public EditRequestStatus Status { get; set; } = EditRequestStatus.Pending;

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ProcessedAt { get; set; }

        public int? ProcessedByUserId { get; set; }

        [ForeignKey("ProcessedByUserId")]
        public virtual User? ProcessedBy { get; set; }

        public string? AdminRemarks { get; set; }
    }
}