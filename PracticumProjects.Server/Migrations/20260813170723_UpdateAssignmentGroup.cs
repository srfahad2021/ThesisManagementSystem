using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PracticumProjects.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAssignmentGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "group_id",
                table: "assignments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_assignments_group_id",
                table: "assignments",
                column: "group_id");

            migrationBuilder.AddForeignKey(
                name: "FK_assignments_thesis_groups_group_id",
                table: "assignments",
                column: "group_id",
                principalTable: "thesis_groups",
                principalColumn: "group_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_assignments_thesis_groups_group_id",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_assignments_group_id",
                table: "assignments");

            migrationBuilder.DropColumn(
                name: "group_id",
                table: "assignments");
        }
    }
}
