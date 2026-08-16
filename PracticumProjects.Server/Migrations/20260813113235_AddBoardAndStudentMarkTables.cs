using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PracticumProjects.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddBoardAndStudentMarkTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "boards",
                columns: table => new
                {
                    board_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    semester_id = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_boards", x => x.board_id);
                    table.ForeignKey(
                        name: "FK_boards_semesters_semester_id",
                        column: x => x.semester_id,
                        principalTable: "semesters",
                        principalColumn: "semester_id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "student_marks",
                columns: table => new
                {
                    mark_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    group_id = table.Column<int>(type: "int", nullable: false),
                    evaluator_id = table.Column<int>(type: "int", nullable: true),
                    research_topic_and_objectives = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    literature_review = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    methodology = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    development_and_implementation = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    testing_and_results = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    documentation_quality = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    presentation = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student_marks", x => x.mark_id);
                    table.ForeignKey(
                        name: "FK_student_marks_Users_evaluator_id",
                        column: x => x.evaluator_id,
                        principalTable: "Users",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_student_marks_Users_student_id",
                        column: x => x.student_id,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_student_marks_thesis_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "thesis_groups",
                        principalColumn: "group_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "board_groups",
                columns: table => new
                {
                    board_group_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    board_id = table.Column<int>(type: "int", nullable: false),
                    group_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_board_groups", x => x.board_group_id);
                    table.ForeignKey(
                        name: "FK_board_groups_boards_board_id",
                        column: x => x.board_id,
                        principalTable: "boards",
                        principalColumn: "board_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_board_groups_thesis_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "thesis_groups",
                        principalColumn: "group_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "board_members",
                columns: table => new
                {
                    board_member_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    board_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_board_members", x => x.board_member_id);
                    table.ForeignKey(
                        name: "FK_board_members_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_board_members_boards_board_id",
                        column: x => x.board_id,
                        principalTable: "boards",
                        principalColumn: "board_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_board_groups_board_id",
                table: "board_groups",
                column: "board_id");

            migrationBuilder.CreateIndex(
                name: "IX_board_groups_group_id",
                table: "board_groups",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "IX_board_members_board_id",
                table: "board_members",
                column: "board_id");

            migrationBuilder.CreateIndex(
                name: "IX_board_members_user_id",
                table: "board_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_boards_semester_id",
                table: "boards",
                column: "semester_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_marks_evaluator_id",
                table: "student_marks",
                column: "evaluator_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_marks_group_id",
                table: "student_marks",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_marks_student_id",
                table: "student_marks",
                column: "student_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "board_groups");

            migrationBuilder.DropTable(
                name: "board_members");

            migrationBuilder.DropTable(
                name: "student_marks");

            migrationBuilder.DropTable(
                name: "boards");
        }
    }
}
