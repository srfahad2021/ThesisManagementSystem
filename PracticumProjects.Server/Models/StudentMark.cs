using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models;

[Table("student_marks")]
public class StudentMark
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("mark_id")]
    public int MarkId { get; set; }

    [Required]
    [Column("student_id")]
    public int StudentId { get; set; }

    [Required]
    [Column("group_id")]
    public int GroupId { get; set; }

    // Evaluator (e.g., Board Member or Examiner who assigned the mark)
    [Column("evaluator_id")]
    public int? EvaluatorId { get; set; }

    // --- Marks Breakdown ---

    [Range(0, 15)]
    [Column("research_topic_and_objectives")]
    public decimal ResearchTopicAndObjectives { get; set; } // Max 15

    [Range(0, 15)]
    [Column("literature_review")]
    public decimal LiteratureReview { get; set; } // Max 15

    [Range(0, 15)]
    [Column("methodology")]
    public decimal Methodology { get; set; } // Max 15

    [Range(0, 20)]
    [Column("development_and_implementation")]
    public decimal DevelopmentAndImplementation { get; set; } // Max 20

    [Range(0, 15)]
    [Column("testing_and_results")]
    public decimal TestingAndResults { get; set; } // Max 15

    [Range(0, 10)]
    [Column("documentation_quality")]
    public decimal DocumentationQuality { get; set; } // Max 10

    [Range(0, 10)]
    [Column("presentation")]
    public decimal Presentation { get; set; } // Max 10

    // Computed total (Max 100)
    [NotMapped]
    public decimal TotalMarks => ResearchTopicAndObjectives +
                                 LiteratureReview +
                                 Methodology +
                                 DevelopmentAndImplementation +
                                 TestingAndResults +
                                 DocumentationQuality +
                                 Presentation;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // --- Navigation Properties ---
    [ForeignKey("StudentId")]
    public virtual User Student { get; set; } = null!;

    [ForeignKey("GroupId")]
    public virtual ThesisGroup ThesisGroup { get; set; } = null!;

    [ForeignKey("EvaluatorId")]
    public virtual User? Evaluator { get; set; }
}