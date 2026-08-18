import React, { useState, useEffect } from 'react';
import '../style.css';

export default function SupervisorReports() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupReports, setGroupReports] = useState([]); // Holds reports needing review
  const [selectedWeek, setSelectedWeek] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Helper check for pending supervisor status
  const isPendingStatus = (status) => status === 0 || status === 'PendingSupervisor';

  // 1. Fetch Supervisor's Assigned Groups & Their Reports
  const fetchSupervisorGroups = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");

      const response = await fetch("/api/WeeklyReports/supervisor/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        console.error("Failed to fetch supervisor groups");
      }
    } catch (err) {
      console.error("Error loading supervisor groups:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisorGroups();
  }, []);

  // Filter groups according to search input
  const filteredGroups = groups.filter((g) => {
    const name = (g.groupName || `Group #${g.groupId}`).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  // Calculate pagination parameters
  const totalEntries = filteredGroups.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalEntries);
  const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // 2. Open Modal for a Group
  const handleOpenGroupDetails = async (group) => {
    setSelectedGroup(group);
    setFeedback('');
    try {
      const response = await fetch(`/api/WeeklyReports/group/${group.groupId}`);
      if (response.ok) {
        const reports = await response.json();
        
        // Filter ONLY reports that are pending supervisor review
        const pendingReports = reports.filter(r => isPendingStatus(r.status));

        // Sort reports chronologically by week number
        pendingReports.sort((a, b) => a.weekNumber - b.weekNumber);

        setGroupReports(pendingReports);

        if (pendingReports.length > 0) {
          setSelectedWeek(pendingReports[0].weekNumber);
        } else {
          setSelectedWeek('');
        }
      }
    } catch (err) {
      console.error("Failed to fetch group reports:", err);
    }
  };

  const handleCloseModal = () => {
    setSelectedGroup(null);
    setGroupReports([]);
    setSelectedWeek('');
    setFeedback('');
  };

  // Get active report based on selected week
  const activeReport = groupReports.find(r => Number(r.weekNumber) === Number(selectedWeek));

  // Sync feedback input when switching between weeks in modal
  useEffect(() => {
    if (activeReport) {
      setFeedback(activeReport.supervisorFeedback || '');
    }
  }, [selectedWeek, activeReport]);

  // 3. Handle Review Action (Approve / Request Revision / Reject)
  const handleReviewAction = async (statusValue) => {
    if (!activeReport) return;

    try {
      setIsSubmittingAction(true);
      const token = sessionStorage.getItem("token");

      const response = await fetch(`/api/WeeklyReports/supervisor/review/${activeReport.reportId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusValue, // 1 = PendingCoordinator (Approved), 3 = Rejected, 4 = RevisionRequested
          feedback: feedback,
        }),
      });

      if (response.ok) {
        alert("Review submitted successfully!");
        handleCloseModal();
        fetchSupervisorGroups(); // Refresh group lists
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("An error occurred while submitting review.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    if (isPendingStatus(status)) {
      return <span className="badge badge-warning">Awaiting Your Review</span>;
    }
    if (status === 1 || status === 'PendingCoordinator') {
      return <span className="badge badge-info">Awaiting Coordinator</span>;
    }
    if (status === 2 || status === 'Accepted') {
      return <span className="badge badge-success">Accepted</span>;
    }
    if (status === 3 || status === 'Rejected') {
      return <span className="badge badge-danger">Rejected</span>;
    }
    if (status === 4 || status === 'RevisionRequested') {
      return <span className="badge badge-warning">Revision Requested</span>;
    }
    return <span className="badge">Unknown</span>;
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading group submission reports...</div>;
  }

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px', fontWeight: 600 }}>
                Weekly Report Reviews
              </div>
              <div className="text-muted text-sm" style={{ fontSize: '13px', marginTop: '4px' }}>
                Review and evaluate weekly progress submitted by your assigned groups.
              </div>
            </div>
          </div>

          {/* Search Controls */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
            <input
              type="text"
              placeholder="Search by group name..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                padding: '8px 12px',
                width: '100%',
                maxWidth: '320px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Groups Summary Table Card */}
          <div className="card">
            {filteredGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }} className="text-muted">
                {searchTerm ? "No matching groups found." : "No assigned groups or submitted reports found."}
              </div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Pending Reviews</th>
                      <th>Total Submitted Weeks</th>
                      <th>Last Submitted Date</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedGroups.map((g) => (
                      <tr key={g.groupId}>
                        <td style={{ fontWeight: 600 }}>{g.groupName || `Group #${g.groupId}`}</td>
                        <td>
                          {g.pendingCount > 0 ? (
                            <span className="badge badge-warning" style={{ padding: '4px 8px', borderRadius: '12px' }}>
                              {g.pendingCount} Pending
                            </span>
                          ) : (
                            <span className="badge badge-success" style={{ padding: '4px 8px', borderRadius: '12px' }}>
                              All Reviewed
                            </span>
                          )}
                        </td>
                        <td>{g.submittedCount || 0} Week(s)</td>
                        <td>{g.lastSubmittedAt ? new Date(g.lastSubmittedAt).toLocaleDateString() : 'N/A'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '13px' }}
                            onClick={() => handleOpenGroupDetails(g)}
                          >
                            View Reports
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Showing {totalEntries > 0 ? startIndex + 1 : 0}–{endIndex} of {totalEntries} entries
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      style={{ opacity: 1, cursor: 'pointer' }}
                    >
                      Previous
                    </button>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages || totalEntries === 0}
                      style={{ opacity: 1, cursor: 'pointer' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Group Review Modal */}
          {selectedGroup && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <div
                className="card"
                style={{
                  width: '100%',
                  maxWidth: '680px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '24px',
                }}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>
                      {selectedGroup.groupName || `Group #${selectedGroup.groupId}`} Reports
                    </div>
                    <div className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                      Inspect submission details and manage feedback.
                    </div>
                  </div>
                  <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>

                {/* Week Selector Dropdown */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Select Week:</label>
                  {groupReports.length > 0 ? (
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '13px',
                      }}
                    >
                      {groupReports.map((rep) => (
                        <option key={rep.weekNumber} value={rep.weekNumber}>
                          Week {rep.weekNumber}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '13px' }}>No reports pending review for this group.</span>
                  )}
                </div>

                {/* Selected Report Details */}
                {activeReport ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>Week {activeReport.weekNumber} Submission</div>
                      <div>{getStatusBadge(activeReport.status)}</div>
                    </div>

                    {/* Report Summary */}
                    <div style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                        Summary of Work Completed
                      </label>
                      <div style={{ background: '#F9FAFB', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', lineHeight: '1.6' }}>
                        {activeReport.summaryText}
                      </div>
                    </div>

                    {/* Attachments */}
                    <div style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                        Submitted Attachments
                      </label>
                      {activeReport.files && activeReport.files.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {activeReport.files.map((file) => (
                            <div key={file.fileId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                              <span>📄 {file.fileName} <span className="text-muted" style={{ fontSize: '11px' }}>({(file.fileSize / 1024).toFixed(1)} KB)</span></span>
                              <a
                                href={`/api/WeeklyReports/download-file/${file.fileId}`}
                                download
                                style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                              >
                                Download
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted" style={{ fontSize: '13px' }}>No files attached to this report.</div>
                      )}
                    </div>

                    {/* Supervisor Feedback Input */}
                    <div style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                        Supervisor Feedback / Remarks
                      </label>
                      <textarea
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Add your comments, suggestions, or reasons for revision/rejection..."
                        style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px' }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <button
                        type="button"
                        onClick={() => handleReviewAction(3)} // Status 3 = Rejected
                        disabled={isSubmittingAction}
                        style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewAction(4)} // Status 4 = RevisionRequested
                        disabled={isSubmittingAction}
                        style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: '#FEF3C7', color: '#92400E', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}
                      >
                        Request Revision
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewAction(1)} // Status 1 = PendingCoordinator (Approved)
                        disabled={isSubmittingAction}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        {isSubmittingAction ? 'Saving...' : 'Approve Report'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted" style={{ textAlign: 'center', padding: '20px 0' }}>
                    No reports pending review for this group.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}