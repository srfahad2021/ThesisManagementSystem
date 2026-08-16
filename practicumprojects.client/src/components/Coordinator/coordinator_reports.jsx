import React, { useState, useEffect } from 'react';
import '../style.css';

export default function CoordinatorReports() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupReports, setGroupReports] = useState([]); // Holds reports needing coordinator review
  const [selectedWeek, setSelectedWeek] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Helper check for pending coordinator status
  const isPendingCoordinatorStatus = (status) => status === 1 || status === 'PendingCoordinator';

  // 1. Fetch All Groups & Their Weekly Report Statuses for Coordinator
  const fetchCoordinatorGroups = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");

      const response = await fetch("/api/WeeklyReports/coordinator/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        console.error("Failed to fetch coordinator groups");
      }
    } catch (err) {
      console.error("Error loading coordinator groups:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinatorGroups();
  }, []);

  // 2. Open Modal for a Group
  const handleOpenGroupDetails = async (group) => {
    setSelectedGroup(group);
    setFeedback('');
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`/api/WeeklyReports/group/${group.groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const reports = await response.json();
        
        // Filter ONLY reports that have been approved by the supervisor and await coordinator review
        const pendingReports = reports.filter(r => isPendingCoordinatorStatus(r.status));

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
      setFeedback(activeReport.coordinatorFeedback || '');
    }
  }, [selectedWeek, activeReport]);

  // 3. Handle Coordinator Review Action (Accept / Request Revision / Reject)
  const handleReviewAction = async (statusValue) => {
    if (!activeReport) return;

    try {
      setIsSubmittingAction(true);
      const token = sessionStorage.getItem("token");

      const response = await fetch(`/api/WeeklyReports/coordinator/review/${activeReport.reportId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusValue, // 2 = Accepted, 3 = Rejected, 4 = RevisionRequested
          feedback: feedback,
        }),
      });

      if (response.ok) {
        alert("Review submitted successfully!");
        handleCloseModal();
        fetchCoordinatorGroups(); // Refresh group list
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
    if (status === 0 || status === 'PendingSupervisor') {
      return <span className="badge badge-warning">Awaiting Supervisor</span>;
    }
    if (isPendingCoordinatorStatus(status)) {
      return <span className="badge badge-info">Awaiting Your Review</span>;
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
    return <div style={{ padding: '20px' }}>Loading group reports for coordinator...</div>;
  }

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px', fontWeight: 600 }}>
                Coordinator Report Reviews
              </div>
              <div className="text-muted text-sm" style={{ fontSize: '13px', marginTop: '4px' }}>
                Review, give final approvals, or request revisions for supervisor-accepted weekly reports across all groups.
              </div>
            </div>
          </div>

          {/* Groups Summary Table */}
          <div className="card">
            {groups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }} className="text-muted">
                No groups or submitted reports awaiting coordinator review.
              </div>
            ) : (
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
                  {groups.map((g) => (
                    <tr key={g.groupId}>
                      <td style={{ fontWeight: 600 }}>{g.groupName || `Group #${g.groupId}`}</td>
                      <td>
                        {g.pendingCount > 0 ? (
                          <span className="badge badge-warning" style={{ padding: '4px 8px', borderRadius: '12px' }}>
                            {g.pendingCount} Pending Approval
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
                      Review supervisor-approved reports and perform coordinator validation.
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
                    <span className="text-muted" style={{ fontSize: '13px' }}>No reports pending coordinator review for this group.</span>
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

                    {/* Supervisor Comments (If present) */}
                    {activeReport.supervisorFeedback && (
                      <div style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                          Supervisor Feedback / Notes
                        </label>
                        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', lineHeight: '1.6' }}>
                          {activeReport.supervisorFeedback}
                        </div>
                      </div>
                    )}

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

                    {/* Coordinator Feedback Input */}
                    <div style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                        Coordinator Remarks / Feedback
                      </label>
                      <textarea
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Add final comments, suggestions, or reasons for revision/rejection..."
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
                        onClick={() => handleReviewAction(2)} // Status 2 = Accepted
                        disabled={isSubmittingAction}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        {isSubmittingAction ? 'Saving...' : 'Accept & Finalize Report'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted" style={{ textAlign: 'center', padding: '20px 0' }}>
                    No reports pending coordinator review for this group.
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