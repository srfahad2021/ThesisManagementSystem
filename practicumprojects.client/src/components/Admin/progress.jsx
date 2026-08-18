import React, { useState, useEffect, useMemo } from 'react';
import '../style.css';

export default function GroupProgressView() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal & Selected Group State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [reportsMap, setReportsMap] = useState({});
  const [isReportLoading, setIsReportLoading] = useState(false);

  // Fetch all groups on mount
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch weekly reports whenever a group is selected for viewing
  useEffect(() => {
    if (selectedGroup) {
      fetchWeeklyReports(selectedGroup.groupId);
    }
  }, [selectedGroup]);

  // Reset pagination to page 1 whenever the search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/Group", { headers });
      if (!response.ok) throw new Error("Failed to fetch groups");

      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeeklyReports = async (groupId) => {
    try {
      setIsReportLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`/api/WeeklyReports/group/${groupId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        const map = {};
        data.forEach((rep) => {
          map[rep.weekNumber] = rep;
        });
        setReportsMap(map);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsReportLoading(false);
    }
  };

  // Filter groups based on search query (Group Name, Student Names, Supervisor Name)
  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return groups;

    return groups.filter((g) => {
      const groupName = (g.groupName || `Group #${g.groupId}`).toLowerCase();
      const student1Name = (g.student1?.fullName || '').toLowerCase();
      const student2Name = (g.student2?.fullName || '').toLowerCase();
      const supervisorName = (g.supervisor?.fullName || '').toLowerCase();

      return (
        groupName.includes(query) ||
        student1Name.includes(query) ||
        student2Name.includes(query) ||
        supervisorName.includes(query)
      );
    });
  }, [groups, searchQuery]);

  // Pagination calculations
  const totalEntries = filteredGroups.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);

  const paginatedGroups = useMemo(() => {
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroups, startIndex, itemsPerPage]);

  const handleOpenViewModal = (group) => {
    setSelectedGroup(group);
    setSelectedWeek(1);
    setReportsMap({});
  };

  const handleCloseModal = () => {
    setSelectedGroup(null);
    setReportsMap({});
  };

  // Status Badge Logic
  const getStatusBadge = (status) => {
    if (status === 2 || status === 'Accepted') return <span className="badge badge-success">Accepted (Coordinator)</span>;
    if (status === 1 || status === 'PendingCoordinator') return <span className="badge badge-info">Awaiting Coordinator</span>;
    if (status === 0 || status === 'PendingSupervisor') return <span className="badge badge-warning">Awaiting Supervisor</span>;
    if (status === 3 || status === 'Rejected') return <span className="badge badge-danger">Rejected</span>;
    if (status === 4 || status === 'RevisionRequested') return <span className="badge badge-warning" style={{ background: '#F59E0B', color: '#FFF' }}>Revision Requested</span>;
    return <span className="badge">Draft</span>;
  };

  // Week Dot Indicator State
  const getDotState = (weekNum) => {
    const rep = reportsMap[weekNum];
    if (!rep) return 'future';
    if (rep.status === 2 || rep.status === 'Accepted') return 'done';
    if (rep.status === 0 || rep.status === 1 || rep.status === 'PendingSupervisor' || rep.status === 'PendingCoordinator') return 'pending';
    if (rep.status === 3 || rep.status === 'Rejected' || rep.status === 4 || rep.status === 'RevisionRequested') return 'rejected';
    return 'active';
  };

  const getDotColor = (state) => {
    switch (state) {
      case 'done': return 'var(--success)';
      case 'pending': return 'var(--warning)';
      case 'rejected': return '#EF4444';
      case 'active': return '#3B82F6';
      default: return 'var(--border)';
    }
  };

  const activeReport = reportsMap[selectedWeek];

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          {/* Header & Search Bar */}
          <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div className="section-title" style={{ fontSize: '18px', fontWeight: 600 }}>
              Thesis Groups Overview
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <input
                type="text"
                placeholder="Search by group, student, or supervisor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* Groups List Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Loading groups...</div>
            ) : filteredGroups.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }} className="text-muted">
                {searchQuery ? 'No groups match your search criteria.' : 'No groups found.'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F8F9FA', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px' }}>Group ID</th>
                    <th style={{ padding: '12px 16px' }}>Group Name</th>
                    <th style={{ padding: '12px 16px' }}>Students</th>
                    <th style={{ padding: '12px 16px' }}>Supervisor</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGroups.map((group) => {
                    const studentNames = [group.student1?.fullName, group.student2?.fullName]
                      .filter(Boolean)
                      .join(' & ') || 'N/A';

                    return (
                      <tr key={group.groupId} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>#{group.groupId}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          {group.groupName || `Group #${group.groupId}`}
                        </td>
                        <td style={{ padding: '12px 16px' }}>{studentNames}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {group.supervisor?.fullName || <span className="text-muted">Unassigned</span>}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => handleOpenViewModal(group)}
                            style={{ cursor: 'pointer', padding: '6px 14px' }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && filteredGroups.length > 0 && (
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
          )}

          {/* Read-Only Weekly Progress Modal */}
          {selectedGroup && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}
            >
              <div
                className="card"
                style={{
                  width: '100%',
                  maxWidth: '850px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  padding: '24px'
                }}
              >
                {/* Modal Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '12px',
                    marginBottom: '20px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>
                      Weekly Progress Details — {selectedGroup.groupName || `Group #${selectedGroup.groupId}`}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Students: {[selectedGroup.student1?.fullName, selectedGroup.student2?.fullName].filter(Boolean).join(', ') || 'N/A'}
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>

                {/* 36 Weeks Selector Grid */}
                <div className="card" style={{ marginBottom: '16px', backgroundColor: '#F9FAFB' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Select Week (1 - 36)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: '8px' }}>
                    {Array.from({ length: 36 }, (_, i) => {
                      const weekNum = i + 1;
                      const state = getDotState(weekNum);
                      const isSelected = selectedWeek === weekNum;
                      return (
                        <button
                          key={weekNum}
                          onClick={() => setSelectedWeek(weekNum)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: getDotColor(state),
                            color: state === 'future' && !isSelected ? '#6B7280' : '#FFF',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {weekNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Dot State Legend */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px' }}>
                    {[
                      { label: 'Accepted', color: 'var(--success)' },
                      { label: 'Pending Approval', color: 'var(--warning)' },
                      { label: 'Rejected / Revision', color: '#EF4444' },
                      { label: 'Unsubmitted', color: 'var(--border)' }
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></div>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Content View */}
                {isReportLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>Loading week details...</div>
                ) : activeReport ? (
                  <div className="card">
                    <div className="section-head" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="section-title">Week {activeReport.weekNumber} Report</div>
                      {getStatusBadge(activeReport.status)}
                    </div>

                    <div className="grid-2">
                      <div>
                        <div className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Summary & Work Completed</div>
                        <div style={{ background: '#F9FAFB', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
                          {activeReport.summaryText}
                        </div>

                        <div className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Submitted Files</div>
                        {activeReport.files && activeReport.files.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {activeReport.files.map((file) => (
                              <div key={file.fileId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                                <span>📄 {file.fileName} <span className="text-muted" style={{ fontSize: '11px' }}>({(file.fileSize / 1024).toFixed(1)} KB)</span></span>
                                <a href={`/api/WeeklyReports/download-file/${file.fileId}`} download style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                                  Download
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted" style={{ fontSize: '13px' }}>No attachments uploaded.</div>
                        )}
                      </div>

                      <div>
                        <div className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Stage 1: Supervisor Feedback</div>
                        <div className="comment-box" style={{ marginBottom: '16px', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                            <span style={{ fontWeight: 600 }}>Supervisor</span>
                            <span className="text-muted">{activeReport.supervisorReviewedAt ? new Date(activeReport.supervisorReviewedAt).toLocaleDateString() : 'Pending'}</span>
                          </div>
                          <div style={{ fontSize: '13px' }}>{activeReport.supervisorFeedback || 'Awaiting supervisor approval.'}</div>
                        </div>

                        <div className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Stage 2: Coordinator Feedback</div>
                        <div className="comment-box" style={{ border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                            <span style={{ fontWeight: 600 }}>Coordinator</span>
                            <span className="text-muted">{activeReport.coordinatorReviewedAt ? new Date(activeReport.coordinatorReviewedAt).toLocaleDateString() : 'Pending'}</span>
                          </div>
                          <div style={{ fontSize: '13px' }}>{activeReport.coordinatorFeedback || 'Pending supervisor approval stage.'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div className="section-title" style={{ marginBottom: '8px' }}>No Submission for Week {selectedWeek}</div>
                    <p className="text-muted" style={{ fontSize: '13px' }}>The group has not submitted a progress report for this week.</p>
                  </div>
                )}

                {/* Modal Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}