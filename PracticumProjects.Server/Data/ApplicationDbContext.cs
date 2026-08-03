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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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
    }
}