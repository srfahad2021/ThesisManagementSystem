import React, { useState, useEffect } from 'react';
import '../style.css';

export default function StudentProgress() {
  const currentStudentId = 12;

  const [studentGroups, setStudentGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [reportsMap, setReportsMap] = useState({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [summaryText, setSummaryText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]); // Track existing files in modal

  const fetchStudentGroups = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("token"); 

      const response = await fetch("/api/Group/my-groups", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch assigned groups");

      const groups = await response.json();
      setStudentGroups(groups);

      if (groups && groups.length > 0) {
        setSelectedGroupId(groups[0].groupId);
      }
    } catch (err) {
      console.error("Error fetching group progress:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeeklyReports = async (groupId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/WeeklyReports/group/${groupId}`);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchWeeklyReports(selectedGroupId);
    }
  }, [selectedGroupId]);

  const activeReport = reportsMap[selectedWeek];

  const isReportEditable = (report) => {
    if (!report) return true;
    const status = report.status;
    return (
      status === 3 ||
      status === 'Rejected' ||
      status === 4 ||
      status === 'RevisionRequested'
    );
  };

  // Check if all weeks before targetWeek have been submitted
  const arePreviousWeeksSubmitted = (targetWeek) => {
    if (targetWeek <= 1) return true;
    for (let w = 1; w < targetWeek; w++) {
      if (!reportsMap[w]) {
        return false;
      }
    }
    return true;
  };

  const hasPreviousUnsubmitted = !activeReport && !arePreviousWeeksSubmitted(selectedWeek);

  const handleOpenModal = () => {
    if (!activeReport && !arePreviousWeeksSubmitted(selectedWeek)) {
      alert(`You must submit progress reports for all previous weeks (Weeks 1 to ${selectedWeek - 1}) before submitting Week ${selectedWeek}.`);
      return;
    }

    if (activeReport && isReportEditable(activeReport)) {
      setSummaryText(activeReport.summaryText || '');
      setExistingFiles(activeReport.files || []);
    } else {
      setSummaryText('');
      setExistingFiles([]);
    }
    setSelectedFiles([]);
    setIsSubmitModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Delete an existing file record from DB & file system
  const handleDeleteExistingFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;

    try {
      const response = await fetch(`/api/WeeklyReports/delete-file/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExistingFiles((prev) => prev.filter((f) => f.fileId !== fileId));

        setReportsMap((prev) => {
          const updatedRep = { ...prev[selectedWeek] };
          if (updatedRep.files) {
            updatedRep.files = updatedRep.files.filter((f) => f.fileId !== fileId);
          }
          return { ...prev, [selectedWeek]: updatedRep };
        });
      } else {
        alert("Failed to delete attachment.");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Error deleting file.");
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!summaryText.trim()) return;

    if (!activeReport && !arePreviousWeeksSubmitted(selectedWeek)) {
      alert(`You must submit reports for all previous weeks prior to submitting Week ${selectedWeek}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('groupId', selectedGroupId);
      formData.append('studentId', currentStudentId);
      formData.append('weekNumber', selectedWeek);
      formData.append('summaryText', summaryText);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/WeeklyReports/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newReport = await response.json();
        setReportsMap((prev) => ({ ...prev, [selectedWeek]: newReport }));
        setSummaryText('');
        setSelectedFiles([]);
        setExistingFiles([]);
        setIsSubmitModalOpen(false);
      } else {
        const errData = await response.json();
        alert(errData.message || "Failed to submit report.");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 2 || status === 'Accepted') return <span className="badge badge-success">Accepted (Coordinator)</span>;
    if (status === 1 || status === 'PendingCoordinator') return <span className="badge badge-info">Awaiting Coordinator</span>;
    if (status === 0 || status === 'PendingSupervisor') return <span className="badge badge-warning">Awaiting Supervisor</span>;
    if (status === 3 || status === 'Rejected') return <span className="badge badge-danger">Rejected</span>;
    if (status === 4 || status === 'RevisionRequested') return <span className="badge badge-warning" style={{ background: '#F59E0B', color: '#FFF' }}>Revision Requested</span>;
    return <span className="badge">Draft</span>;
  };

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

  if (isLoading && studentGroups.length === 0) {
    return <div style={{ padding: '20px' }}>Loading progress details...</div>;
  }

  if (!studentGroups || studentGroups.length === 0) {
    return (
      <div className="layout">
        <div className="main">
          <div className="content">
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
              <div style={{ color: 'var(--warning)', fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Not Assigned to Any Group</h3>
              <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto', fontSize: '14px' }}>
                You are currently not assigned to a project group. Contact your coordinator to gain access to weekly submissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canEditActiveReport = activeReport && isReportEditable(activeReport);
  const isButtonDisabled = (activeReport && !canEditActiveReport) || hasPreviousUnsubmitted;

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          {/* Header & Group Selector */}
          <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px', fontWeight: 600 }}>Weekly Progress Reports</div>
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500 }}>Group:</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                  style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px' }}
                >
                  {studentGroups.map((g) => (
                    <option key={g.groupId} value={g.groupId}>{g.groupName || `Group #${g.groupId}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn-primary"
              disabled={isButtonDisabled}
              onClick={handleOpenModal}
              style={{ opacity: isButtonDisabled ? 0.6 : 1, cursor: isButtonDisabled ? 'not-allowed' : 'pointer' }}
            >
              {!activeReport
                ? `+ Submit Week ${selectedWeek}`
                : canEditActiveReport
                ? `Resubmit Week ${selectedWeek}`
                : `Week ${selectedWeek} Submitted`}
            </button>
          </div>

          {/* 36 Weeks Grid */}
          <div className="card" style={{ marginBottom: '16px' }}>
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

          {/* Report Display */}
          {activeReport ? (
            <div className="card">
              <div className="section-head" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="section-title">Week {activeReport.weekNumber} Report</div>
                {getStatusBadge(activeReport.status)}
              </div>

              {canEditActiveReport && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', color: '#991B1B' }}>
                    <strong>Action Required:</strong> This report was marked for revision or rejected. Review the feedback below and resubmit when ready.
                  </div>
                  <button className="btn-primary" onClick={handleOpenModal} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    Edit & Resubmit
                  </button>
                </div>
              )}

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
                          <span>{file.fileName} <span className="text-muted" style={{ fontSize: '11px' }}>({(file.fileSize / 1024).toFixed(1)} KB)</span></span>
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
              {hasPreviousUnsubmitted ? (
                <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)', padding: '12px 16px', maxWidth: '500px', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: '13px', color: '#92400E' }}>
                    You must submit report(s) for all previous weeks prior to Week {selectedWeek}.
                  </span>
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>You have not submitted a progress report for this week.</p>
              )}
              <button
                className="btn-primary"
                disabled={hasPreviousUnsubmitted}
                onClick={handleOpenModal}
                style={{ opacity: hasPreviousUnsubmitted ? 0.6 : 1, cursor: hasPreviousUnsubmitted ? 'not-allowed' : 'pointer' }}
              >
                Submit Week {selectedWeek} Report
              </button>
            </div>
          )}

          {/* Submission / Edit Modal */}
          {isSubmitModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>
                    {canEditActiveReport ? `Resubmit Week ${selectedWeek} Report` : `Submit Week ${selectedWeek} Report`}
                  </div>
                  <button onClick={() => setIsSubmitModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>

                <form onSubmit={handleSubmitReport}>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                      Summary of Work Done <span style={{ color: 'red' }}>*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      placeholder="Detail tasks completed, roadblocks, and updates..."
                      style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px' }}
                    />
                  </div>

                  {/* Existing Uploaded Files in Modal */}
                  {existingFiles.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                        Current Attachments
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {existingFiles.map((f) => (
                          <div key={f.fileId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F3F4F6', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                            <span>{f.fileName}</span>
                            <button
                              type="button"
                              className='btn-primary btn-sm'
                              onClick={() => handleDeleteExistingFile(f.fileId)}
                              // style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New File Upload Field */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                      {existingFiles.length > 0 ? 'Add More Attachments' : 'Attachments'}
                    </label>
                    <input type="file" multiple onChange={handleFileChange} style={{ fontSize: '13px', width: '100%' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => setIsSubmitModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: '#FFF' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Uploading...' : canEditActiveReport ? 'Resubmit Report' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}