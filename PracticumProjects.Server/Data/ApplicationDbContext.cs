using Microsoft.EntityFrameworkCore;
using PracticumProjects.Models;
using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Data;

public class ApplicationDbContext : DbContext
{
      public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

      public DbSet<User> Users => Set<User>();
      public DbSet<ThesisGroup> ThesisGroups => Set<ThesisGroup>();
      public DbSet<GroupMember> GroupMembers => Set<GroupMember>();
      public DbSet<Semester> Semesters => Set<Semester>();
      public DbSet<TopicSubmission> TopicSubmissions => Set<TopicSubmission>();
      public DbSet<SubmissionFile> SubmissionFiles => Set<SubmissionFile>();
      public DbSet<WeeklyReport> WeeklyReports => Set<WeeklyReport>();

      // New Meeting & Availability DbSets
      public DbSet<AvailableTime> AvailableTimes => Set<AvailableTime>();
      public DbSet<Meeting> Meetings => Set<Meeting>();
      public DbSet<MeetingSummary> MeetingSummaries => Set<MeetingSummary>();

      // Exam DbSets
      public DbSet<Board> Boards { get; set; }
      public DbSet<BoardMember> BoardMembers { get; set; }
      public DbSet<BoardGroup> BoardGroups { get; set; }
      public DbSet<StudentMark> StudentMarks { get; set; }

      // --- Assignment DbSets ---
      public DbSet<Assignment> Assignments { get; set; }
      public DbSet<AssignmentSubmission> AssignmentSubmissions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- User Configuration ---
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();

            entity.Property(e => e.Role)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.Property(e => e.Username).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(100);
        });

        // --- Semester Configuration ---
        modelBuilder.Entity<Semester>(entity =>
        {
            entity.HasKey(e => e.SemesterId);

            entity.Property(e => e.SemesterType)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.Property(e => e.Status)
                  .HasConversion<string>()
                  .HasMaxLength(20);
        });

        // --- ThesisGroup Configuration ---
        modelBuilder.Entity<ThesisGroup>(entity =>
        {
            entity.HasKey(e => e.GroupId);

            entity.Property(e => e.Status)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.HasOne(g => g.Semester)
                  .WithMany()
                  .HasForeignKey(g => g.SemesterId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(g => g.GroupMember)
                  .WithOne(m => m.ThesisGroup)
                  .HasForeignKey<GroupMember>(m => m.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // --- GroupMember Configuration ---
        modelBuilder.Entity<GroupMember>(entity =>
        {
            entity.HasKey(m => m.GroupId);

            entity.HasOne(m => m.Student1)
                  .WithMany()
                  .HasForeignKey(m => m.StudentId1)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Student2)
                  .WithMany()
                  .HasForeignKey(m => m.StudentId2)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Supervisor)
                  .WithMany()
                  .HasForeignKey(m => m.SupervisorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // --- TopicSubmission Configuration ---
        modelBuilder.Entity<TopicSubmission>(entity =>
        {
            entity.HasKey(t => t.TopicId);

            entity.Property(t => t.Status)
                  .HasConversion<string>()
                  .HasMaxLength(30);

            entity.HasOne<ThesisGroup>()
                  .WithMany()
                  .HasForeignKey(t => t.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // --- SubmissionFile Configuration ---
        modelBuilder.Entity<SubmissionFile>(entity =>
        {
            entity.HasKey(f => f.FileId);

            entity.Property(f => f.ModuleType)
                  .HasConversion<string>()
                  .HasMaxLength(30);

            entity.HasIndex(f => new { f.ModuleType, f.EntityId });
        });

        // --- WeeklyReport Configuration ---
        modelBuilder.Entity<WeeklyReport>(entity =>
        {
            entity.HasKey(r => r.ReportId);

            entity.Property(r => r.Status)
                  .HasConversion<string>()
                  .HasMaxLength(30);

            entity.Property(r => r.SupervisorStatus)
                  .HasConversion<string>()
                  .HasMaxLength(30);

            entity.Property(r => r.CoordinatorStatus)
                  .HasConversion<string>()
                  .HasMaxLength(30);

            entity.HasIndex(r => new { r.GroupId, r.WeekNumber }).IsUnique();
        });

        // --- AvailableTime Configuration ---
        modelBuilder.Entity<AvailableTime>(entity =>
        {
            entity.HasKey(a => a.AvailabilityId);

            entity.Property(a => a.DayOfWeek)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.HasOne(a => a.User)
                  .WithMany()
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(a => new { a.UserId, a.DayOfWeek });
        });

        // --- Meeting Configuration ---
        modelBuilder.Entity<Meeting>(entity =>
        {
            entity.HasKey(m => m.MeetingId);

            entity.Property(m => m.Medium)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.Property(m => m.Status)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.HasOne(m => m.ThesisGroup)
                  .WithMany()
                  .HasForeignKey(m => m.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.Host)
                  .WithMany()
                  .HasForeignKey(m => m.HostId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.RequestedByUser)
                  .WithMany()
                  .HasForeignKey(m => m.RequestedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.AvailableTime)
                  .WithMany()
                  .HasForeignKey(m => m.AvailabilityId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(m => m.GroupId);
            entity.HasIndex(m => new { m.HostId, m.MeetingDate });
        });
        
        // --- MeetingSummary Configuration ---
        modelBuilder.Entity<MeetingSummary>(entity =>
        {
            entity.HasKey(s => s.SummaryId);

            entity.HasOne(s => s.Meeting)
                  .WithOne(m => m.Summary)
                  .HasForeignKey<MeetingSummary>(s => s.MeetingId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(s => s.Submitter)
                  .WithMany()
                  .HasForeignKey(s => s.SubmittedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // --- Assignment Configuration ---
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(a => a.AssignmentId);

            entity.Property(a => a.Title)
                  .HasMaxLength(200)
                  .IsRequired();

            entity.HasMany(a => a.Submissions)
                  .WithOne(s => s.Assignment)
                  .HasForeignKey(s => s.AssignmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // --- AssignmentSubmission Configuration ---
        modelBuilder.Entity<AssignmentSubmission>(entity =>
        {
            entity.HasKey(s => s.AssignmentSubmissionId);

            entity.Property(s => s.SubmissionStatus)
                  .HasMaxLength(50)
                  .IsRequired();
        });
    }
}