import React, { useEffect, useState } from "react";

const API_BASE_URL = "/api/student-progress-report";

const StudentProgressReport = () => {
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");

    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [error, setError] = useState("");

    // ============================================================
    // Load groups when page loads
    // ============================================================
    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setLoadingGroups(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/groups`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load groups."
                );
            }

            const data = await response.json();

            setGroups(data);
        } catch (error) {
            console.error(error);

            setError(
                "Unable to load groups."
            );
        } finally {
            setLoadingGroups(false);
        }
    };

    // ============================================================
    // When group changes
    // ============================================================
    const handleGroupChange = async (event) => {
        const groupId = event.target.value;

        setSelectedGroupId(groupId);

        // Reset student selection.
        setSelectedStudentId("");

        // Clear previous students.
        setStudents([]);

        setError("");

        if (!groupId) {
            return;
        }

        await loadStudents(groupId);
    };

    // ============================================================
    // Load students for selected group
    // ============================================================
    const loadStudents = async (groupId) => {
        try {
            setLoadingStudents(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/groups/${groupId}/students`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load students."
                );
            }

            const data = await response.json();

            setStudents(data);
        } catch (error) {
            console.error(error);

            setError(
                "Unable to load students for this group."
            );
        } finally {
            setLoadingStudents(false);
        }
    };

    // ============================================================
    // Generate PDF
    // ============================================================
    const handleGenerateReport = async () => {
        if (!selectedGroupId) {
            setError(
                "Please select a group."
            );

            return;
        }

        if (!selectedStudentId) {
            setError(
                "Please select a student."
            );

            return;
        }

        try {
            setGenerating(true);
            setError("");

            const url =
                `${API_BASE_URL}/generate` +
                `?groupId=${encodeURIComponent(
                    selectedGroupId
                )}` +
                `&studentId=${encodeURIComponent(
                    selectedStudentId
                )}`;

            const response = await fetch(url);

            if (!response.ok) {
                let message =
                    "Failed to generate student progress report.";

                try {
                    const data =
                        await response.json();

                    if (data?.message) {
                        message = data.message;
                    }
                } catch {
                    // Response was not JSON.
                }

                throw new Error(message);
            }

            // Get PDF as Blob.
            const blob =
                await response.blob();

            // Default file name.
            let fileName =
                "Student_Progress_Report.pdf";

            // Try to read filename from server.
            const contentDisposition =
                response.headers.get(
                    "Content-Disposition"
                );

            if (contentDisposition) {
                const utf8Match =
                    contentDisposition.match(
                        /filename\*=UTF-8''([^;]+)/i
                    );

                const normalMatch =
                    contentDisposition.match(
                        /filename="?([^"]+)"?/i
                    );

                if (utf8Match?.[1]) {
                    fileName =
                        decodeURIComponent(
                            utf8Match[1]
                        );
                } else if (normalMatch?.[1]) {
                    fileName =
                        normalMatch[1];
                }
            }

            // Create temporary URL.
            const blobUrl =
                window.URL.createObjectURL(
                    blob
                );

            // Create download link.
            const link =
                document.createElement("a");

            link.href = blobUrl;

            link.download = fileName;

            document.body.appendChild(link);

            link.click();

            link.remove();

            // Clean up.
            window.URL.revokeObjectURL(
                blobUrl
            );
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Unable to generate the student progress report."
            );
        } finally {
            setGenerating(false);
        }
    };

    // ============================================================
    // Get currently selected student
    // ============================================================
    const selectedStudent = students.find(
        (student) =>
            String(student.userId) ===
            String(selectedStudentId)
    );

    return (
        <div
            className="student-progress-report-page"
            style={{
                minHeight: "100vh",
                padding: "30px",
                backgroundColor: "#f5f7fb"
            }}
        >
            <div
                style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    backgroundColor: "#ffffff",
                    padding: "30px",
                    borderRadius: "10px",
                    boxShadow:
                        "0 2px 12px rgba(0, 0, 0, 0.08)"
                }}
            >
                {/* =================================================
                    Header
                ================================================== */}
                <div
                    style={{
                        marginBottom: "30px"
                    }}
                >
                    <h1
                        style={{
                            margin: "0 0 8px",
                            color: "#1f2937"
                        }}
                    >
                        Student Progress Report
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: "#6b7280"
                        }}
                    >
                        Select a group and student
                        to generate the student's
                        thesis progress report.
                    </p>
                </div>

                {/* =================================================
                    Error
                ================================================== */}
                {error && (
                    <div
                        style={{
                            padding: "12px 15px",
                            marginBottom: "20px",
                            borderRadius: "6px",
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            border:
                                "1px solid #fecaca"
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* =================================================
                    Group
                ================================================== */}
                <div
                    style={{
                        marginBottom: "22px"
                    }}
                >
                    <label
                        htmlFor="group"
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#374151"
                        }}
                    >
                        Select Group
                    </label>

                    <select
                        id="group"
                        value={selectedGroupId}
                        onChange={handleGroupChange}
                        disabled={
                            loadingGroups ||
                            generating
                        }
                        style={{
                            width: "100%",
                            padding: "12px",
                            border:
                                "1px solid #d1d5db",
                            borderRadius: "6px",
                            backgroundColor:
                                "#ffffff",
                            fontSize: "15px"
                        }}
                    >
                        <option value="">
                            {loadingGroups
                                ? "Loading groups..."
                                : "-- Select Group --"}
                        </option>

                        {groups.map((group) => (
                            <option
                                key={group.groupId}
                                value={group.groupId}
                            >
                                {group.groupName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* =================================================
                    Student
                ================================================== */}
                <div
                    style={{
                        marginBottom: "22px"
                    }}
                >
                    <label
                        htmlFor="student"
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#374151"
                        }}
                    >
                        Select Student
                    </label>

                    <select
                        id="student"
                        value={selectedStudentId}
                        onChange={(event) =>
                            setSelectedStudentId(
                                event.target.value
                            )
                        }
                        disabled={
                            !selectedGroupId ||
                            loadingStudents ||
                            generating
                        }
                        style={{
                            width: "100%",
                            padding: "12px",
                            border:
                                "1px solid #d1d5db",
                            borderRadius: "6px",
                            backgroundColor:
                                "#ffffff",
                            fontSize: "15px"
                        }}
                    >
                        <option value="">
                            {!selectedGroupId
                                ? "-- Select a group first --"
                                : loadingStudents
                                    ? "Loading students..."
                                    : "-- Select Student --"}
                        </option>

                        {students.map((student) => (
                            <option
                                key={student.userId}
                                value={student.userId}
                            >
                                {student.username}

                                {(
                                    student.firstName ||
                                    student.lastName
                                )
                                    ? ` - ${[
                                        student.firstName,
                                        student.lastName
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}`
                                    : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* =================================================
                    Selected Student
                ================================================== */}
                {selectedStudent && (
                    <div
                        style={{
                            padding: "14px",
                            marginBottom: "20px",
                            backgroundColor:
                                "#fff5f5",
                            border:
                                "1px solid rgb(255, 200, 200)",
                            borderRadius: "6px",
                            color: "var(--primary)"
                        }}
                    >
                        <strong>
                            Selected Student:
                        </strong>{" "}
                        {selectedStudent.username}
                    </div>
                )}

                {/* =================================================
                    Generate Button
                ================================================== */}
                <div
                    style={{
                        marginTop: "30px"
                    }}
                >
                    <button
                        type="button"
                        onClick={
                            handleGenerateReport
                        }
                        disabled={
                            !selectedGroupId ||
                            !selectedStudentId ||
                            generating
                        }
                        style={{
                            width: "100%",
                            padding:
                                "13px 20px",
                            border: "none",
                            borderRadius: "6px",
                            backgroundColor:
                                (
                                    !selectedGroupId ||
                                    !selectedStudentId ||
                                    generating
                                )
                                    ? "#9ca3af"
                                    : "#ff6b6b",
                            color: "#ffffff",
                            fontSize: "15px",
                            fontWeight: "600",
                            cursor:
                                (
                                    !selectedGroupId ||
                                    !selectedStudentId ||
                                    generating
                                )
                                    ? "not-allowed"
                                    : "pointer"
                        }}
                    >
                        {generating
                            ? "Generating Report..."
                            : "Generate Report"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentProgressReport;