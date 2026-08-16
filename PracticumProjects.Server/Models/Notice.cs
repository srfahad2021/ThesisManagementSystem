using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models;

[Table("notices")]
public class Notice
{
    [Key]
    [Column("notice_id")]
    public int NoticeId { get; set; }

    [Required]
    [MaxLength(250)]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column("content")]
    public string Content { get; set; } = string.Empty;

    [Column("notice_type")]
    public NoticeType NoticeType { get; set; } = NoticeType.Public;

    [Column("author_id")]
    public int AuthorId { get; set; }

    [ForeignKey("AuthorId")]
    public virtual User Author { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<NoticeTargetGroup> TargetGroups { get; set; } = new List<NoticeTargetGroup>();
}