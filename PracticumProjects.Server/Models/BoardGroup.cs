using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PracticumProjects.Server.Models;

[Table("board_groups")]
public class BoardGroup
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("board_group_id")]
    public int BoardGroupId { get; set; }

    [Required]
    [Column("board_id")]
    public int BoardId { get; set; }

    [Required]
    [Column("group_id")]
    public int GroupId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // --- Navigation Properties ---
    [ForeignKey("BoardId")]
    public virtual Board Board { get; set; } = null!;

    [ForeignKey("GroupId")]
    public virtual ThesisGroup ThesisGroup { get; set; } = null!;
}