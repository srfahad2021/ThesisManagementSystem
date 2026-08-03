using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models;

[Table("group_members")]
public class GroupMember
{
    [Key]
    [Column("group_id")]
    public int GroupId { get; set; }

    [Column("student_id1")]
    public int? StudentId1 { get; set; }

    [Column("student_id2")]
    public int? StudentId2 { get; set; }

    [Column("supervisor_id")]
    public int? SupervisorId { get; set; }

    // --- Navigation Properties ---

    [ForeignKey("GroupId")]
    public virtual ThesisGroup ThesisGroup { get; set; } = null!;

    [ForeignKey("StudentId1")]
    public virtual User? Student1 { get; set; }

    [ForeignKey("StudentId2")]
    public virtual User? Student2 { get; set; }

    [ForeignKey("SupervisorId")]
    public virtual User? Supervisor { get; set; }
}