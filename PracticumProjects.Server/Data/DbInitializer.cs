using PracticumProjects.Server.Models;

namespace PracticumProjects.Server.Data;

public static class DbInitializer
{
    public static async Task SeedAdminAsync(ApplicationDbContext context)
    {
        // Ensure the database is created
        await context.Database.EnsureCreatedAsync();

        // Check if an admin exists
        if (!context.Users.Any(u => u.Role == UserRole.ADMIN))
        {
            var adminUser = new User
            {
                Username = "admin",
                // Hash default admin password using BCrypt
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456"),
                Role = UserRole.ADMIN,
                Email = "admin@portal.com",
                FirstName = "System",
                LastName = "Admin",
                IsProfileCompleted = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
        if (!context.Users.Any(u => u.Role == UserRole.STUDENT))
        {
            var studentUser = new User
            {
                Username = "student1",
                // Hash default admin password using BCrypt
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student@123456"),
                Role = UserRole.STUDENT,
                Email = "student@portal.com",
                FirstName = "first",
                LastName = "student",
                IsProfileCompleted = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(studentUser);
            await context.SaveChangesAsync();
        }

        if (!context.Users.Any(u => u.Role == UserRole.STUDENT))
        {
            var studentUser = new User
            {
                Username = "student1",
                // Hash default admin password using BCrypt
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student@123456"),
                Role = UserRole.STUDENT,
                Email = "student@portal.com",
                FirstName = "first",
                LastName = "student",
                IsProfileCompleted = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(studentUser);
            await context.SaveChangesAsync();
        }
    }
}