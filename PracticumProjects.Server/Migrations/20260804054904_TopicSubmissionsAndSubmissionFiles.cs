using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PracticumProjects.Server.Migrations
{
    /// <inheritdoc />
    public partial class TopicSubmissionsAndSubmissionFiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_submission_files_entity_type_entity_id",
                table: "submission_files");

            migrationBuilder.DropColumn(
                name: "entity_type",
                table: "submission_files");

            migrationBuilder.DropColumn(
                name: "file_type",
                table: "submission_files");

            migrationBuilder.RenameColumn(
                name: "file_size_bytes",
                table: "submission_files",
                newName: "file_size");

            migrationBuilder.AlterColumn<string>(
                name: "file_path",
                table: "submission_files",
                type: "varchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(512)",
                oldMaxLength: 512)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "content_type",
                table: "submission_files",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "module_type",
                table: "submission_files",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_submission_files_module_type_entity_id",
                table: "submission_files",
                columns: new[] { "module_type", "entity_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_submission_files_module_type_entity_id",
                table: "submission_files");

            migrationBuilder.DropColumn(
                name: "content_type",
                table: "submission_files");

            migrationBuilder.DropColumn(
                name: "module_type",
                table: "submission_files");

            migrationBuilder.RenameColumn(
                name: "file_size",
                table: "submission_files",
                newName: "file_size_bytes");

            migrationBuilder.AlterColumn<string>(
                name: "file_path",
                table: "submission_files",
                type: "varchar(512)",
                maxLength: 512,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(500)",
                oldMaxLength: 500)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "entity_type",
                table: "submission_files",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "file_type",
                table: "submission_files",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_submission_files_entity_type_entity_id",
                table: "submission_files",
                columns: new[] { "entity_type", "entity_id" });
        }
    }
}
