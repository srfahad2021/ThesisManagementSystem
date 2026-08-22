using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PracticumProjects.Server.Data;
using PracticumProjects.Server.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace PracticumProjects.Server.Controllers;

[ApiController]
[Route("api/student-progress-report")]
public class StudentProgressReportController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StudentProgressReportController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // GET: api/student-progress-report/groups
    // ============================================================
    [HttpGet("groups")]
    public async Task<IActionResult> GetGroups()
    {
        var groups = await _context.ThesisGroups
            .AsNoTracking()
            .OrderBy(g => g.GroupName)
            .Select(g => new
            {
                groupId = g.GroupId,
                groupName = g.GroupName
            })
            .ToListAsync();

        return Ok(groups);
    }

    // ============================================================
    // GET:
    // api/student-progress-report/groups/{groupId}/students
    // ============================================================
    [HttpGet("groups/{groupId:int}/students")]
    public async Task<IActionResult> GetStudents(int groupId)
    {
        var groupMember = await _context.GroupMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(gm => gm.GroupId == groupId);

        if (groupMember == null)
        {
            return NotFound(new
            {
                message = "Group members were not found."
            });
        }

        var studentIds = new List<int>();

        if (groupMember.StudentId1.HasValue)
        {
            studentIds.Add(groupMember.StudentId1.Value);
        }

        if (groupMember.StudentId2.HasValue)
        {
            studentIds.Add(groupMember.StudentId2.Value);
        }

        if (studentIds.Count == 0)
        {
            return Ok(Array.Empty<object>());
        }

        var students = await _context.Users
            .AsNoTracking()
            .Where(u =>
                studentIds.Contains(u.UserId) &&
                u.Role == UserRole.STUDENT)
            .OrderBy(u => u.Username)
            .Select(u => new
            {
                userId = u.UserId,
                username = u.Username,
                firstName = u.FirstName,
                lastName = u.LastName
            })
            .ToListAsync();

        return Ok(students);
    }

    // ============================================================
    // GET:
    // api/student-progress-report/generate
    //
    // ?groupId=1&studentId=5
    // ============================================================
    [HttpGet("generate")]
    public async Task<IActionResult> GenerateReport(
        [FromQuery] int groupId,
        [FromQuery] int studentId)
    {
        // ========================================================
        // 1. Get group
        // ========================================================
        var group = await _context.ThesisGroups
            .AsNoTracking()
            .Include(g => g.GroupMember)
            .FirstOrDefaultAsync(g => g.GroupId == groupId);

        if (group == null)
        {
            return NotFound(new
            {
                message = "Group not found."
            });
        }

        var groupMember = group.GroupMember;

        if (groupMember == null)
        {
            return NotFound(new
            {
                message = "Group member information was not found."
            });
        }

        // ========================================================
        // 2. Verify student belongs to group
        // ========================================================
        if (groupMember.StudentId1 != studentId &&
            groupMember.StudentId2 != studentId)
        {
            return BadRequest(new
            {
                message = "The selected student does not belong to this group."
            });
        }

        // ========================================================
        // 3. Get student
        // ========================================================
        var student = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u =>
                u.UserId == studentId &&
                u.Role == UserRole.STUDENT);

        if (student == null)
        {
            return NotFound(new
            {
                message = "Student not found."
            });
        }

        // ========================================================
        // 4. Get supervisor
        // ========================================================
        User? supervisor = null;

        if (groupMember.SupervisorId.HasValue)
        {
            supervisor = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u =>
                    u.UserId == groupMember.SupervisorId.Value);
        }

        // ========================================================
        // 5. Get thesis topic using GROUP ID
        // ========================================================
        var topicSubmission = await _context.TopicSubmissions
            .AsNoTracking()
            .Where(t =>
                t.GroupId == groupId &&
                t.Status == TopicStatus.APPROVED)
            .FirstOrDefaultAsync();

        // If no approved topic exists, use any topic
        // belonging to this group.
        if (topicSubmission == null)
        {
            topicSubmission = await _context.TopicSubmissions
                .AsNoTracking()
                .Where(t => t.GroupId == groupId)
                .FirstOrDefaultAsync();
        }

        var thesisTopic =
            topicSubmission?.Title ?? "Not available";

        // ========================================================
        // 6. GET ACCEPTED WEEKLY REPORTS
        //
        // IMPORTANT:
        //
        // Only reports that:
        //   - belong to this group
        //   - were submitted by this student
        //   - have Status = Accepted
        //
        // are included.
        //
        // We DO NOT create empty Week 1-36 rows anymore.
        // ========================================================
        var weeklyReports = await _context.WeeklyReports
            .AsNoTracking()
            .Where(r =>
                r.GroupId == groupId &&
                r.Status == WeeklyReport.ReportStatus.Accepted)
            .OrderBy(r => r.WeekNumber)
            .ToListAsync();

        // ========================================================
        // 7. Convert accepted reports to PDF rows
        // ========================================================
        var weeklyData = weeklyReports
            .Select(report => new WeeklyReportPdfRow
            {
                WeekNumber = report.WeekNumber,

                // CreatedAt = actual report submission date
                SubmissionDate = report.CreatedAt,

                SupervisorReview =
                    report.SupervisorFeedback,

                SupervisorStatus =
                    report.SupervisorStatus.ToString(),

                CoordinatorReview =
                    report.CoordinatorFeedback,

                CoordinatorStatus =
                    report.CoordinatorStatus.ToString()
            })
            .ToList();

        // ========================================================
        // 8. Get APPROVED + COMPLETED meetings
        //
        // Only the COUNT is needed.
        // Meeting dates are NOT included.
        // ========================================================
        var totalMeetings = await _context.Meetings
            .AsNoTracking()
            .CountAsync(m =>
                m.GroupId == groupId &&
                (
                    m.Status == MeetingStatus.APPROVED ||
                    m.Status == MeetingStatus.COMPLETED
                ));

        // ========================================================
        // 9. Generate PDF
        // ========================================================
        QuestPDF.Settings.License =
            LicenseType.Community;

        var document = new StudentProgressReportDocument(
            student,
            group,
            supervisor,
            thesisTopic,
            totalMeetings,
            weeklyData
        );

        var pdfBytes = document.GeneratePdf();

        // ========================================================
        // 10. PDF filename
        // ========================================================
        var username =
            string.IsNullOrWhiteSpace(student.Username)
                ? $"student_{student.UserId}"
                : student.Username.Replace(" ", "_");

        var fileName =
            $"Student_Progress_Report_{username}_{student.UserId}.pdf";

        return File(
            pdfBytes,
            "application/pdf",
            fileName
        );
    }
}


// =================================================================
// PDF WEEKLY REPORT ROW
// =================================================================
public class WeeklyReportPdfRow
{
    public int WeekNumber { get; set; }

    public DateTimeOffset SubmissionDate { get; set; }

    public string? SupervisorReview { get; set; }

    public string? SupervisorStatus { get; set; }

    public string? CoordinatorReview { get; set; }

    public string? CoordinatorStatus { get; set; }
}


// =================================================================
// PDF DOCUMENT
// =================================================================
public class StudentProgressReportDocument : IDocument
{
    private readonly User _student;
    private readonly ThesisGroup _group;
    private readonly User? _supervisor;
    private readonly string _thesisTopic;
    private readonly int _totalMeetings;
    private readonly List<WeeklyReportPdfRow> _weeklyReports;

    public StudentProgressReportDocument(
        User student,
        ThesisGroup group,
        User? supervisor,
        string thesisTopic,
        int totalMeetings,
        List<WeeklyReportPdfRow> weeklyReports)
    {
        _student = student;
        _group = group;
        _supervisor = supervisor;
        _thesisTopic = thesisTopic;
        _totalMeetings = totalMeetings;
        _weeklyReports = weeklyReports;
    }

    public DocumentMetadata GetMetadata()
    {
        return new DocumentMetadata
        {
            Title = "Student Progress Report",
            Author = "Practicum Projects",
            Subject = "Student Thesis Progress Report"
        };
    }

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);

            page.Margin(30);

            page.DefaultTextStyle(
                x => x
                    .FontSize(8)
                    .FontFamily("Arial")
            );

            page.Header()
                .Element(ComposeHeader);

            page.Content()
                .Element(ComposeContent);

            page.Footer()
                .AlignCenter()
                .Text(text =>
                {
                    text.Span(
                        "Student Progress Report | Page "
                    );

                    text.CurrentPageNumber();

                    text.Span(" of ");

                    text.TotalPages();
                });
        });
    }

    // ============================================================
    // HEADER
    // ============================================================
    private void ComposeHeader(IContainer container)
    {
        container.Column(column =>
        {
            column.Item()
                .AlignCenter()
                .Text("STUDENT PROGRESS REPORT")
                .Bold()
                .FontSize(16);

            column.Item()
                .PaddingTop(4)
                .LineHorizontal(1);
        });
    }

    // ============================================================
    // CONTENT
    // ============================================================
    private void ComposeContent(IContainer container)
    {
        container.Column(column =>
        {
            // Student information
            column.Item()
                .PaddingTop(10)
                .Element(ComposeStudentInformation);

            // Meeting count
            column.Item()
                .PaddingTop(10)
                .Element(ComposeMeetingInformation);

            // Weekly progress
            column.Item()
                .PaddingTop(12)
                .Text("WEEKLY PROGRESS")
                .Bold()
                .FontSize(11);

            column.Item()
                .PaddingTop(5)
                .Element(ComposeWeeklyTable);

            // Signatures
            column.Item()
                .PaddingTop(30)
                .Element(ComposeSignatures);
        });
    }

    // ============================================================
    // STUDENT INFORMATION
    // ============================================================
    private void ComposeStudentInformation(
        IContainer container)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(90);
                columns.RelativeColumn();

                columns.ConstantColumn(90);
                columns.RelativeColumn();
            });

            AddInfoRow(
                table,
                "Student Name",
                GetStudentName(),
                "Username",
                _student.Username
            );

            AddInfoRow(
                table,
                "Student User ID",
                _student.UserId.ToString(),
                "Group",
                _group.GroupName
            );

            AddInfoRow(
                table,
                "Thesis Topic",
                _thesisTopic,
                "Supervisor",
                GetSupervisorName()
            );
        });
    }

    private string GetStudentName()
    {
        var fullName =
            $"{_student.FirstName} {_student.LastName}"
                .Trim();

        return string.IsNullOrWhiteSpace(fullName)
            ? _student.Username
            : fullName;
    }

    private string GetSupervisorName()
    {
        if (_supervisor == null)
        {
            return "Not assigned";
        }

        var fullName =
            $"{_supervisor.FirstName} {_supervisor.LastName}"
                .Trim();

        return string.IsNullOrWhiteSpace(fullName)
            ? _supervisor.Username
            : fullName;
    }

    private static void AddInfoRow(
        TableDescriptor table,
        string label1,
        string value1,
        string label2,
        string value2)
    {
        table.Cell()
            .Background(Colors.Grey.Lighten2)
            .Border(0.5f)
            .Padding(5)
            .Text(label1)
            .Bold();

        table.Cell()
            .Border(0.5f)
            .Padding(5)
            .Text(value1);

        table.Cell()
            .Background(Colors.Grey.Lighten2)
            .Border(0.5f)
            .Padding(5)
            .Text(label2)
            .Bold();

        table.Cell()
            .Border(0.5f)
            .Padding(5)
            .Text(value2);
    }

    // ============================================================
    // MEETING COUNT
    // ============================================================
    private void ComposeMeetingInformation(
        IContainer container)
    {
        container.Text(text =>
        {
            text.Span(
                "Total Approved/Completed Meetings: "
            ).Bold();

            text.Span(
                _totalMeetings.ToString()
            );
        });
    }

    // ============================================================
    // WEEKLY TABLE
    //
    // ONLY ACCEPTED REPORTS ARE DISPLAYED.
    //
    // If accepted reports exist for:
    // Week 2
    // Week 4
    // Week 7
    //
    // then the table has:
    //
    // Header
    // Week 2
    // Week 4
    // Week 7
    //
    // It will NOT contain empty rows for the other weeks.
    // ============================================================
    private void ComposeWeeklyTable(
        IContainer container)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(35);

                columns.ConstantColumn(65);

                columns.RelativeColumn(1.4f);

                columns.ConstantColumn(65);

                columns.RelativeColumn(1.4f);

                columns.ConstantColumn(65);
            });

            // ----------------------------------------------------
            // Header
            // ----------------------------------------------------
            table.Header(header =>
            {
                header.Cell()
                    .Element(cell =>
                        AddHeaderCell(
                            cell,
                            "Week No"
                        ));

                header.Cell()
                    .Element(cell =>
                        AddHeaderCell(
                            cell,
                            "Report\nSubmission Date"
                        ));

                header.Cell()
                    .Element(cell =>
                        AddHeaderCell(
                            cell,
                            "Supervisor Review"
                        ));

                header.Cell()
                    .Element(cell =>
                        AddHeaderCell(
                            cell,
                            "Supervisor Status"
                        ));

                header.Cell()
                    .Element(cell =>
                        AddHeaderCell(
                            cell,
                            "Coordinator Review"
                        ));

                header.Cell()
                    .Element(cell =>
                        AddHeaderCell(
                            cell,
                            "Coordinator Status"
                        ));
            });

            // ----------------------------------------------------
            // ONLY ACCEPTED REPORTS
            // ----------------------------------------------------
            foreach (var report in _weeklyReports)
            {
                AddBodyCell(
                    table,
                    report.WeekNumber.ToString()
                );

                AddBodyCell(
                    table,
                    report.SubmissionDate
                        .ToString("dd/MM/yyyy")
                );

                AddBodyCell(
                    table,
                    string.IsNullOrWhiteSpace(
                        report.SupervisorReview)
                        ? "-"
                        : report.SupervisorReview
                );

                AddStatusCell(
                    table,
                    FormatStatus(
                        report.SupervisorStatus
                    )
                );

                AddBodyCell(
                    table,
                    string.IsNullOrWhiteSpace(
                        report.CoordinatorReview)
                        ? "-"
                        : report.CoordinatorReview
                );

                AddStatusCell(
                    table,
                    FormatStatus(
                        report.CoordinatorStatus
                    )
                );
            }
        });
    }

    // ============================================================
    // HEADER CELL
    // ============================================================
    private static void AddHeaderCell(
        IContainer cell,
        string text)
    {
        cell
            .Background("#ff6b6b")
            .Border(0.5f)
            .Padding(4)
            .AlignCenter()
            .AlignMiddle()
            .Text(text)
            .Bold()
            .FontColor(Colors.White)
            .FontSize(7);
    }

    // ============================================================
    // BODY CELL
    // ============================================================
    private static void AddBodyCell(
        TableDescriptor table,
        string text)
    {
        table.Cell()
            .Border(0.5f)
            .Padding(3)
            .AlignMiddle()
            .Text(text)
            .FontSize(7);
    }

    // ============================================================
    // STATUS CELL
    // ============================================================
    private static void AddStatusCell(
        TableDescriptor table,
        string text)
    {
        var cell = table.Cell()
            .Border(0.5f)
            .Padding(3)
            .AlignCenter()
            .AlignMiddle();

        if (text == "Approved")
        {
            cell
                .Background(Colors.Green.Lighten4)
                .Text(text)
                .Bold()
                .FontSize(7);
        }
        else if (text == "Rejected")
        {
            cell
                .Background(Colors.Red.Lighten4)
                .Text(text)
                .Bold()
                .FontSize(7);
        }
        else
        {
            cell
                .Text(text)
                .FontSize(7);
        }
    }

    // ============================================================
    // FORMAT STATUS
    // ============================================================
    private static string FormatStatus(
        string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return "-";
        }

        return status switch
        {
            "Approved" => "Approved",

            "Rejected" => "Rejected",

            "RevisionRequested" =>
                "Revision Requested",

            "Pending" => "Pending",

            _ => status
        };
    }

    // ============================================================
    // SIGNATURES
    // ============================================================
    private void ComposeSignatures(
        IContainer container)
    {
        container.Row(row =>
        {
            // ----------------------------------------------------
            // Supervisor
            // ----------------------------------------------------
            row.RelativeItem()
                .PaddingRight(40)
                .Element(container =>
                {
                    container.Column(column =>
                    {
                        column.Item()
                            .Height(40);

                        column.Item()
                            .LineHorizontal(1);

                        column.Item()
                            .PaddingTop(5)
                            .AlignCenter()
                            .Text(
                                "Supervisor Signature"
                            )
                            .Bold();

                        column.Item()
                            .PaddingTop(3)
                            .AlignCenter()
                            .Text(
                                GetSupervisorName()
                            );

                        column.Item()
                            .PaddingTop(3)
                            .AlignCenter()
                            .Text(
                                "Date: __________________"
                            );
                    });
                });

            // ----------------------------------------------------
            // Coordinator
            // ----------------------------------------------------
            row.RelativeItem()
                .PaddingLeft(40)
                .Element(container =>
                {
                    container.Column(column =>
                    {
                        column.Item()
                            .Height(40);

                        column.Item()
                            .LineHorizontal(1);

                        column.Item()
                            .PaddingTop(5)
                            .AlignCenter()
                            .Text(
                                "Coordinator Signature"
                            )
                            .Bold();

                        column.Item()
                            .PaddingTop(3)
                            .AlignCenter()
                            .Text(
                                "____________________________"
                            );

                        column.Item()
                            .PaddingTop(3)
                            .AlignCenter()
                            .Text(
                                "Date: __________________"
                            );
                    });
                });
        });
    }
}