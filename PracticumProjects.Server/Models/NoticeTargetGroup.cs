using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models;

[Table("notice_target_groups")]
public class NoticeTargetGroup
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("notice_id")]
    public int NoticeId { get; set; }

    [Column("group_id")]
    public int GroupId { get; set; }

    [ForeignKey("NoticeId")]
    public virtual Notice Notice { get; set; } = null!;

    [ForeignKey("GroupId")]
    public virtual ThesisGroup ThesisGroup { get; set; } = null!;
}