using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PracticumProjects.Server.Data;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args
});

// ---------------------------------------------------------
// Configuration
// ---------------------------------------------------------
// Disable appsettings file watching (reloadOnChange)
// because Render's environment has a low inotify limit.
// ---------------------------------------------------------

builder.Configuration.Sources.Clear();

builder.Configuration
    .AddJsonFile(
        "appsettings.json",
        optional: true,
        reloadOnChange: false)
    .AddJsonFile(
        $"appsettings.{builder.Environment.EnvironmentName}.json",
        optional: true,
        reloadOnChange: false)
    .AddEnvironmentVariables();

// ---------------------------------------------------------
// Database configuration
// ---------------------------------------------------------

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "DefaultConnection connection string is not configured.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    ));

// ---------------------------------------------------------
// JWT Authentication
// ---------------------------------------------------------

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtIssuer))
{
    throw new InvalidOperationException(
        "Jwt:Issuer is not configured.");
}

if (string.IsNullOrWhiteSpace(jwtAudience))
{
    throw new InvalidOperationException(
        "Jwt:Audience is not configured.");
}

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "Jwt:Key is not configured.");
}

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                RoleClaimType =
                    System.Security.Claims.ClaimTypes.Role
            };
    });

builder.Services.AddAuthorization();

// ---------------------------------------------------------
// Controllers / JSON
// ---------------------------------------------------------

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

// ---------------------------------------------------------
// OpenAPI / Swagger
// ---------------------------------------------------------

builder.Services.AddOpenApi();

// ---------------------------------------------------------
// CORS
// ---------------------------------------------------------

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "https://thesis-management-system-one.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ---------------------------------------------------------
// Build application
// ---------------------------------------------------------

var app = builder.Build();

// ---------------------------------------------------------
// Development-only configuration
// ---------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // Keep local SPA integration working
    app.UseDefaultFiles();
    app.MapStaticAssets();
}

// ---------------------------------------------------------
// Middleware
// ---------------------------------------------------------

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// ---------------------------------------------------------
// Development SPA fallback
// ---------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("/index.html");
}

// ---------------------------------------------------------
// Database migration
// ---------------------------------------------------------

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<ApplicationDbContext>();

    db.Database.Migrate();
}

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

app.MapControllers();

// ---------------------------------------------------------
// Run
// ---------------------------------------------------------

app.Run();
