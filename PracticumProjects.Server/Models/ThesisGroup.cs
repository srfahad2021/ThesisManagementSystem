using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PracticumProjects.Models;

namespace PracticumProjects.Server.Models;

public enum GroupLifecycle
{
    INITIALIZED,
    IN_PROGRESS,
    COMPLETED,
    ARCHIVED
}

[Table("thesis_groups")]
public class ThesisGroup
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("group_id")]
    public int GroupId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("group_name")]
    public string GroupName { get; set; } = string.Empty;

    [Column("semester_id")]
    public int? SemesterId { get; set; }

    [Column("status")]
    public GroupLifecycle Status { get; set; } = GroupLifecycle.INITIALIZED;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // --- Navigation Properties ---
    [ForeignKey("SemesterId")]
    public virtual Semester? Semester { get; set; }

    public virtual GroupMember? GroupMember { get; set; }
}