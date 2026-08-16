using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PracticumProjects.Models;

namespace PracticumProjects.Server.Models;

[Table("boards")]
public class Board
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("board_id")]
    public int BoardId { get; set; }

    [Column("name")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Column("semester_id")]
    public int? SemesterId { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // --- Navigation Properties ---
    [ForeignKey("SemesterId")]
    public virtual Semester? Semester { get; set; }

    public virtual ICollection<BoardMember> BoardMembers { get; set; } = new List<BoardMember>();
    public virtual ICollection<BoardGroup> BoardGroups { get; set; } = new List<BoardGroup>();
}