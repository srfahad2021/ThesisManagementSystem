using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PracticumProjects.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum SemesterType
    {
        Fall,
        Spring,
        Summer
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum SemesterStatus
    {
        Active,
        Archived,
        Completed
    }

    [Table("semesters")]
    public class Semester
    {
        [Key]
        [Column("semester_id")]
        public int SemesterId { get; set; }

        [Required]
        [Column("semester_type")]
        public SemesterType SemesterType { get; set; }

        [Required]
        [Column("year")]
        public int Year { get; set; }

        [Required]
        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Required]
        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Required]
        [Column("status")]
        public SemesterStatus Status { get; set; } = SemesterStatus.Active;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}