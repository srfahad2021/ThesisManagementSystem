import React, { useState, useEffect } from 'react';
import '../style.css';

// Reusable TopicCard function/component updated with action handlers
export function TopicCard({ topic, onApprove, onRequestRevision, onReject, onViewFull }) {
  const { title, student, keywords, status } = topic;

  // Determine status badge class base
  const sc = status === 'PENDING' || status === 'SUBMITTED' 
    ? 'badge-warning' 
    : status === 'SUPERVISOR_REVIEW' || status === 'NEEDS_REVISION' 
    ? 'badge-info' 
    : 'badge-success';

  const keywordList = keywords ? keywords.split(',') : [];

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{title || 'Untitled Topic'}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{student}</div>
        </div>
        <span className={`badge ${sc}`}>{status}</span>
      </div>

      <div className="tag-cloud" style={{ marginBottom: '12px' }}>
        {keywordList.map((k, i) => (
          <span key={i} className="tag">{k.trim()}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-primary btn-sm" onClick={() => onApprove(topic)}>Approve</button>
        <button className="btn-secondary btn-sm" onClick={() => onRequestRevision(topic)}>Request Revision</button>
        <button className="btn-secondary btn-sm" onClick={() => onReject(topic)}>Reject</button>
        <button className="btn-ghost btn-sm" onClick={() => onViewFull(topic)}>View Full →</button>
      </div>
    </div>
  );
}

export default function SupervisorTopics() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicFiles, setTopicFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSupervisorTopics();
  }, []);

  const fetchSupervisorTopics = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/TopicSubmission/supervisor', { headers });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        setMessage({ type: 'error', text: 'Failed to load assigned topic submissions.' });
      }
    } catch (error) {
      console.error('Error fetching supervisor topics:', error);
      setMessage({ type: 'error', text: 'Error connecting to the server.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicFiles = async (topicId) => {
    try {
      setLoadingFiles(true);
      const token = sessionStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/SubmissionFile?moduleType=TopicSubmission&entityId=${topicId}`, { headers });
      if (response.ok) {
        const files = await response.json();
        setTopicFiles(files);
      } else {
        setTopicFiles([]);
      }
    } catch (error) {
      console.error('Error fetching topic files:', error);
      setTopicFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
  try {
    const token = sessionStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Updated URL to match [HttpGet("download/{id:int}")]
    const response = await fetch(`/api/SubmissionFile/download/${fileId}`, { headers });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || `Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `file-${fileId}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    alert(`Failed to download file: ${error.message}`);
  }
};

  const handleOpenModal = (topic, initialFeedback = '') => {
    setSelectedTopic(topic);
    setFeedback(initialFeedback || topic.supervisorFeedback || '');
    fetchTopicFiles(topic.topicId);
  };

  const handleCloseModal = () => {
    setSelectedTopic(null);
    setFeedback('');
    setTopicFiles([]);
  };

  const handleStatusUpdate = async (topicId, newStatus, customFeedback) => {
    try {
      setUpdating(true);
      const token = sessionStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body = {
        status: newStatus,
        supervisorFeedback: customFeedback !== undefined ? customFeedback : feedback
      };

      const response = await fetch(`/api/TopicSubmission/${topicId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Topic status updated to '${newStatus}'.` });
        if (selectedTopic) handleCloseModal();
        fetchSupervisorTopics();
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.message || 'Failed to update topic status.' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: 'Error connecting to the server.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleApproveQuick = (topic) => {
    handleStatusUpdate(topic.topicId, 'APPROVED', topic.supervisorFeedback || '');
  };

  const handleRequestRevisionQuick = (topic) => {
    handleOpenModal(topic);
  };

  const handleRejectQuick = (topic) => {
    handleStatusUpdate(topic.topicId, 'REJECTED', topic.supervisorFeedback || '');
  };

  if (loading) {
    return (
      <div className="layout">
        <div className="main">
          <div className="content">
            <p>Loading assigned topic reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          {message && (
            <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`} style={{ marginBottom: '15px' }}>
              {message.text}
            </div>
          )}

          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '16px' }}>Topic Review</div>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="card">
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No submitted topics pending your review.</p>
            </div>
          ) : (
            submissions.map((topic) => (
              <TopicCard
                key={topic.topicId}
                topic={{
                  ...topic,
                  student: `Group #${topic.groupId}`
                }}
                onApprove={handleApproveQuick}
                onRequestRevision={handleRequestRevisionQuick}
                onReject={handleRejectQuick}
                onViewFull={handleOpenModal}
              />
            ))
          )}

          {/* Full Page Review Modal */}
          {selectedTopic && (
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
                  maxWidth: '800px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
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
                  <div className="section-title" style={{ fontSize: '18px' }}>
                    Review Submission — Group #{selectedTopic.groupId}
                  </div>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      border: 'none',
                      background: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      lineHeight: 1
                    }}
                  >
                    &times;
                  </button>
                </div>

                <div className="grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div className="form-group">
                      <label className="form-label">Thesis Title</label>
                      <input className="form-control" value={selectedTopic.title || ''} disabled />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Abstract</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '120px' }}
                        value={selectedTopic.abstract || ''}
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Keywords</label>
                      <input className="form-control" value={selectedTopic.keywords || ''} disabled />
                    </div>
                  </div>

                  <div>
                    <div className="form-group">
                      <label className="form-label">Problem Statement</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '120px' }}
                        value={selectedTopic.problemStatement || ''}
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Objectives</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '120px' }}
                        value={selectedTopic.objectives || ''}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Attached Files Section */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Attached Documents / Files</label>
                  {loadingFiles ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading attached files...</p>
                  ) : topicFiles.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No files attached to this submission.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {topicFiles.map((f) => (
                        <div
                          key={f.fileId}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '13px' }}>{f.fileName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {(f.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(f.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => handleDownloadFile(f.fileId, f.fileName)}
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedback Input */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Supervisor Feedback / Notes</label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: '90px' }}
                    placeholder="Provide constructive feedback or reasons for revision/approval/rejection..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                {/* Modal Actions */}
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '15px'
                  }}
                >
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={handleCloseModal}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => handleStatusUpdate(selectedTopic.topicId, 'NEEDS_REVISION')}
                    disabled={updating}
                  >
                    Request Revision
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => handleStatusUpdate(selectedTopic.topicId, 'REJECTED')}
                    disabled={updating}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() => handleStatusUpdate(selectedTopic.topicId, 'APPROVED')}
                    disabled={updating}
                  >
                    Approve
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