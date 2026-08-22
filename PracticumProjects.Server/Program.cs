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

// =========================================================
// CONFIGURATION
// =========================================================
// Disable configuration file watching.
// Render has a limited inotify instance limit.
// =========================================================

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

// =========================================================
// DATABASE
// =========================================================

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "DefaultConnection connection string is not configured.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    );
});

// =========================================================
// JWT AUTHENTICATION
// =========================================================

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

// =========================================================
// CONTROLLERS / JSON
// =========================================================

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

// =========================================================
// OPENAPI
// =========================================================

builder.Services.AddOpenApi();

// =========================================================
// CORS
// =========================================================
// Frontend:
// https://thesis-management-system-one.vercel.app
//
// Backend:
// https://thesismanagementsystem-6opj.onrender.com
// =========================================================

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

// =========================================================
// BUILD APPLICATION
// =========================================================

var app = builder.Build();

// =========================================================
// DEVELOPMENT
// =========================================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseDefaultFiles();
    app.MapStaticAssets();
}

// =========================================================
// MIDDLEWARE
// =========================================================

// IMPORTANT:
// CORS must run before Authentication/Authorization.

app.UseCors("AllowFrontend");

// =========================================================
// HTTPS
// =========================================================

// Render already provides HTTPS at the public URL.
// Keep this enabled if your Render ASP.NET setup correctly
// handles forwarded HTTPS headers.
//
// If you continue getting redirect-related CORS errors,
// temporarily disable this middleware.

app.UseHttpsRedirection();

// =========================================================
// AUTHENTICATION / AUTHORIZATION
// =========================================================

app.UseAuthentication();
app.UseAuthorization();

// =========================================================
// DEVELOPMENT SPA FALLBACK
// =========================================================

if (app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("/index.html");
}

// =========================================================
// DATABASE MIGRATION
// =========================================================

using (var scope = app.Services.CreateScope())
{
    var db =
        scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

    db.Database.Migrate();
}

// =========================================================
// CONTROLLERS
// =========================================================

app.MapControllers();

// =========================================================
// RUN
// =========================================================

app.Run();
