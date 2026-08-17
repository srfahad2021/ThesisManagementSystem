import React, { useState, useEffect } from 'react';
import '../style.css';

export function TopicCard({ topic, onViewFull }) {
  const { title, student, keywords, status } = topic;

  // Determine status badge class base
  const sc = status === 'PENDING' || status === 'SUBMITTED' 
    ? 'badge-warning' 
    : status === 'SUPERVISOR_REVIEW' || status === 'NEEDS_REVISION' 
    ? 'badge-info' 
    : status === 'APPROVED' 
    ? 'badge-success' 
    : 'badge-danger';

  const keywordList = keywords ? keywords.split(',') : [];

  return (
    <div 
      style={{ 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius)', 
        padding: '10px 14px', 
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      {/* Left side: Title, Student Name, Keywords Inline */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span 
            style={{ 
              fontWeight: 600, 
              fontSize: '14px', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}
          >
            {title || 'Untitled Topic'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flexShrink: 0 }}>
            • {student}
          </span>
        </div>

        {keywordList.length > 0 && (
          <div className="tag-cloud" style={{ margin: 0, gap: '4px' }}>
            {keywordList.map((k, i) => (
              <span key={i} className="tag" style={{ fontSize: '11px', padding: '1px 6px' }}>
                {k.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Badge and View Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span className={`badge ${sc}`} style={{ margin: 0 }}>{status}</span>
        {onViewFull && (
          <button className="btn-primary btn-sm" onClick={() => onViewFull(topic)}>
            View Full →
          </button>
        )}
      </div>
    </div>
  );
}

export default function Topics() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicFiles, setTopicFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTopicSubmissions();
  }, []);

  // Reset pagination when search term or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const fetchTopicSubmissions = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/TopicSubmission/all', { headers });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        setMessage({ type: 'error', text: `Failed to fetch topic submissions. Status: ${response.status}` });
      }
    } catch (error) {
      console.error('Error fetching topic submissions:', error);
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

  const handleOpenModal = (topic) => {
    setSelectedTopic(topic);
    fetchTopicFiles(topic.topicId);
  };

  const handleCloseModal = () => {
    setSelectedTopic(null);
    setTopicFiles([]);
  };

  // Filter list per section tab and search query
  const getFilteredTopics = (statusType) => {
    return submissions.filter(t => {
      const s = (t.status || '').toUpperCase();
      let matchesStatus = false;

      if (statusType === 'pending') matchesStatus = (s === 'PENDING' || s === 'SUBMITTED');
      else if (statusType === 'supervisor_review') matchesStatus = (s === 'SUPERVISOR_REVIEW' || s === 'NEEDS_REVISION');
      else if (statusType === 'approved') matchesStatus = (s === 'APPROVED');
      else if (statusType === 'rejected') matchesStatus = (s === 'REJECTED');

      if (!matchesStatus) return false;

      // Apply Search Filter
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      const titleMatch = (t.title || '').toLowerCase().includes(term);
      const studentMatch = (t.studentNames || `Group #${t.groupId}`).toLowerCase().includes(term);
      const keywordsMatch = (t.keywords || '').toLowerCase().includes(term);

      return titleMatch || studentMatch || keywordsMatch;
    });
  };

  if (loading) {
    return (
      <div className="layout">
        <div className="main">
          <div className="content">
            <p>Loading topic submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'pending', label: 'Pending' },
    { key: 'supervisor_review', label: 'Review Requested' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
  ];

  const currentTabTopics = getFilteredTopics(activeTab);
  const totalEntries = currentTabTopics.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const paginatedTopics = currentTabTopics.slice(startIndex, endIndex);

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
              <div className="section-title" style={{ fontSize: '16px' }}>Topic Submissions</div>
            </div>
          </div>

          {/* Controls Header: Tabs + Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '15px' }}>
            {/* Section Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {sections.map(sec => {
                const count = getFilteredTopics(sec.key).length;
                const isActive = activeTab === sec.key;
                return (
                  <button
                    key={sec.key}
                    onClick={() => setActiveTab(sec.key)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius)',
                      border: 'none',
                      background: isActive ? 'var(--primary, #007bff)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {sec.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div style={{ minWidth: '240px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search topics, students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '13px', padding: '6px 12px' }}
              />
            </div>
          </div>

          {/* Section Content Display */}
          {paginatedTopics.length === 0 ? (
            <div className="card">
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                No submissions found.
              </p>
            </div>
          ) : (
            paginatedTopics.map((topic) => (
              <TopicCard
                key={topic.topicId}
                topic={{
                  ...topic,
                  student: topic.studentNames || `Group #${topic.groupId}`
                }}
                onViewFull={handleOpenModal}
              />
            ))
          )}

          {/* Pagination Controls with Entry Count */}
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

          {/* Popup Modal for View Full */}
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
                    Topic Details — {selectedTopic.groupName || `Group #${selectedTopic.groupId}`}
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

                {/* Attached Files */}
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

                {/* Supervisor Feedback */}
                {selectedTopic.supervisorFeedback && (
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Supervisor Feedback</label>
                    <textarea
                      className="form-control"
                      style={{ minHeight: '80px' }}
                      value={selectedTopic.supervisorFeedback}
                      disabled
                    />
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '15px'
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={handleCloseModal}
                  >
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