import React, { useState, useEffect } from 'react';
import '../style.css';

export default function StudentTopic() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState(null);

  const [topic, setTopic] = useState({
    topicId: 0,
    groupId: 0,
    title: '',
    abstract: '',
    keywords: '',
    problemStatement: '',
    objectives: '',
    status: 'INITIAL',
    supervisorFeedback: '',
    coordinatorFeedback: '',
    attachments: []
  });

  useEffect(() => {
    fetchStudentGroups();
  }, []);

  // Fetch topic whenever selectedGroupId changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchTopicForGroup(selectedGroupId);
    }
  }, [selectedGroupId]);

  const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // 1. Fetch user's assigned groups
  const fetchStudentGroups = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('/api/ThesisGroup/my-groups', { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        const userGroups = data || [];
        setGroups(userGroups);

        // Auto-select the first group if available
        if (userGroups.length > 0) {
          setSelectedGroupId(userGroups[0].groupId.toString());
        }
      } else {
        // Fallback endpoint if specific API is not implemented
        const fallbackRes = await fetch('/api/ThesisGroup', { headers: getHeaders() });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setGroups(fallbackData || []);
          if (fallbackData.length > 0) {
            setSelectedGroupId(fallbackData[0].groupId.toString());
          }
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setMessage({ type: 'error', text: 'Error connecting to the server.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch topic submission details for the selected group
  const fetchTopicForGroup = async (groupId) => {
    try {
      setLoadingTopic(true);
      setMessage(null);

      const response = await fetch(`/api/TopicSubmission/group/${groupId}`, { 
        headers: getHeaders() 
      });

      if (response.ok) {
        const data = await response.json();
        setTopic(data);
        if (data && data.topicId > 0) {
          fetchAttachments(data.topicId);
        }
      } else if (response.status === 404) {
        // Reset to initial blank topic for newly selected group
        setTopic({
          topicId: 0,
          groupId: parseInt(groupId, 10),
          title: '',
          abstract: '',
          keywords: '',
          problemStatement: '',
          objectives: '',
          status: 'INITIAL',
          supervisorFeedback: '',
          coordinatorFeedback: '',
          attachments: []
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to load topic details for this group.' });
      }
    } catch (error) {
      console.error('Error fetching topic for group:', error);
    } finally {
      setLoadingTopic(false);
    }
  };

  const fetchAttachments = async (topicId) => {
    try {
      const response = await fetch(`/api/SubmissionFile?moduleType=TopicSubmission&entityId=${topicId}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const files = await response.json();
        setTopic(prev => ({ ...prev, attachments: files }));
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTopic((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    if (!topic.topicId || topic.topicId === 0) {
      setMessage({ type: 'error', text: 'Please save your topic draft before uploading files.' });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('moduleType', 'TopicSubmission');
      formData.append('entityId', topic.topicId);

      const response = await fetch('/api/SubmissionFile/upload', {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });

      if (response.ok) {
        const uploadedFile = await response.json();
        setTopic(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), uploadedFile]
        }));
        setSelectedFile(null);
        const fileInput = document.getElementById('topicFileInput');
        if (fileInput) fileInput.value = '';
        setMessage({ type: 'success', text: 'File uploaded successfully!' });
      } else {
        const err = await response.json().catch(() => ({}));
        setMessage({ type: 'error', text: err.message || 'Failed to upload file.' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ type: 'error', text: 'Error uploading file to server.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;

    try {
      const response = await fetch(`/api/SubmissionFile/${fileId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        setTopic(prev => ({
          ...prev,
          attachments: prev.attachments.filter(f => f.fileId !== fileId)
        }));
        setMessage({ type: 'success', text: 'File deleted successfully.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete file.' });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage({ type: 'error', text: 'Error connecting to server.' });
    }
  };

  const handleSubmit = async (targetStatus) => {
    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        ...topic,
        groupId: parseInt(selectedGroupId, 10),
        status: targetStatus
      };

      const headers = {
        'Content-Type': 'application/json',
        ...getHeaders()
      };

      const url = topic.topicId > 0 
        ? `/api/TopicSubmission/${topic.topicId}`
        : `/api/TopicSubmission`;

      const method = topic.topicId > 0 ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedData = await response.json().catch(() => payload);
        setTopic(prev => ({ ...prev, ...savedData, status: targetStatus }));
        setMessage({ 
          type: 'success', 
          text: targetStatus === 'SUBMITTED' ? 'Topic submitted successfully!' : 'Draft saved successfully!' 
        });
      } else {
        const err = await response.json().catch(() => ({}));
        setMessage({ type: 'error', text: err.message || 'Failed to save submission.' });
      }
    } catch (error) {
      console.error('Error saving topic:', error);
      setMessage({ type: 'error', text: 'Error saving submission.' });
    } finally {
      setSaving(false);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      case 'NEEDS_REVISION': return 'badge-warning';
      case 'SUBMITTED':
      case 'SUPERVISOR_REVIEW': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const renderWorkflowSteps = () => {
    const steps = [
      { key: 'INITIAL', label: 'Initialized' },
      { key: 'DRAFT', label: 'Draft' },
      { key: 'SUBMITTED', label: 'Submitted' },
      { key: 'SUPERVISOR_REVIEW', label: 'Supervisor Review' },
      { key: 'APPROVED', label: 'Approved' }
    ];

    const currentIdx = steps.findIndex(s => s.key === topic.status);

    return (
      <div className="workflow-steps" style={{ marginBottom: '20px' }}>
        {steps.map((step, idx) => {
          let stepClass = 'wf-step';
          if (idx < currentIdx) stepClass += ' done';
          else if (idx === currentIdx) stepClass += ' active';

          return (
            <div key={step.key} className={stepClass}>
              <div className="wf-dot"></div>
              {step.label}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="content"><p>Loading student data...</p></div>;
  }

  // CASE 1: Student is NOT assigned to any groups at all
  if (!groups || groups.length === 0) {
    return (
      <div className="layout">
        <div className="main">
          <div className="content">
            <div
              style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                border: '1px solid #ffeeba',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <span style={{ fontSize: '32px' }}>⚠️</span>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>Not Assigned to Any Group</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  You are not currently assigned to any thesis group. Please contact your administrator or supervisor to get assigned to a group before submitting a topic proposal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEditable = topic.status === 'INITIAL' || topic.status === 'DRAFT' || topic.status === 'NEEDS_REVISION' || topic.status === 'REJECTED';

  // CASE 2: Student IS assigned to group(s) -> Show Group Selector and dynamic content
  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          
          {/* Status Message Notification */}
          {message && (
            <div 
              className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`} 
              style={{ 
                marginBottom: '15px', 
                padding: '12px 16px', 
                borderRadius: '6px',
                backgroundColor: message.type === 'error' ? '#f8d7da' : '#d4edda',
                color: message.type === 'error' ? '#721c24' : '#155724',
                border: `1px solid ${message.type === 'error' ? '#f5c6cb' : '#c3e6cb'}`
              }}
            >
              {message.text}
            </div>
          )}

          {/* Top Group Selection Dropdown Switcher */}
          <div 
            className="card" 
            style={{ 
              marginBottom: '20px', 
              padding: '16px 20px', 
              backgroundColor: '#FFF5F5', 
              border: '1px solid rgb(255, 200, 200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}></span>
              <label style={{ fontWeight: 'bold', margin: 0, fontSize: '15px' }}>Select Thesis Group:</label>
            </div>
            
            <select
              className="form-control"
              style={{ maxWidth: '320px', fontWeight: '500' }}
              value={selectedGroupId}
              onChange={handleGroupChange}
            >
              {groups.map(g => (
                <option key={g.groupId} value={g.groupId}>
                  {g.groupName ? `${g.groupName} (Group #${g.groupId})` : `Group #${g.groupId}`}
                </option>
              ))}
            </select>
          </div>

          {loadingTopic ? (
            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
              <p>Loading submission details for selected group...</p>
            </div>
          ) : (
            <>
              {/* Header with Title and Topic Status */}
              <div className="section-head" style={{ marginBottom: '20px' }}>
                <div>
                  <div className="section-title" style={{ fontSize: '16px' }}>
                    Topic Submission for Group #{selectedGroupId}
                  </div>
                </div>
                <span className={`badge ${getBadgeClass(topic.status)}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {topic.status}
                </span>
              </div>

              {renderWorkflowSteps()}

              {/* Feedback Sections */}
              {topic.supervisorFeedback && (
                <div className="card" style={{ marginBottom: '15px', backgroundColor: '#fff8e1', padding: '15px', borderLeft: '4px solid #ffc107' }}>
                  <strong>Supervisor Feedback:</strong> {topic.supervisorFeedback}
                </div>
              )}

              {topic.coordinatorFeedback && (
                <div className="card" style={{ marginBottom: '15px', backgroundColor: '#e8f4f8', padding: '15px', borderLeft: '4px solid #17a2b8' }}>
                  <strong>Coordinator Feedback:</strong> {topic.coordinatorFeedback}
                </div>
              )}

              {/* Topic Form */}
              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="grid-2" style={{ gap: '20px' }}>
                  <div>
                    <div className="form-group">
                      <label className="form-label">Thesis Title *</label>
                      <input
                        className="form-control"
                        name="title"
                        value={topic.title || ''}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                        placeholder="Enter proposed thesis title"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Abstract *</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '120px' }}
                        name="abstract"
                        value={topic.abstract || ''}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                        placeholder="Provide a concise abstract"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Keywords</label>
                      <input
                        className="form-control"
                        name="keywords"
                        value={topic.keywords || ''}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                        placeholder="e.g. Machine Learning, IoT, Web"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="form-group">
                      <label className="form-label">Problem Statement *</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '110px' }}
                        name="problemStatement"
                        value={topic.problemStatement || ''}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                        placeholder="State the core problem being addressed"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Objectives *</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '110px' }}
                        name="objectives"
                        value={topic.objectives || ''}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                        placeholder="List project objectives"
                      />
                    </div>
                  </div>
                </div>

                {/* --- Attachments / File Upload Section --- */}
                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                    📁 Attachments & Supporting Documents
                  </h4>

                  {topic.attachments && topic.attachments.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '15px' }}>
                      {topic.attachments.map((file) => (
                        <li 
                          key={file.fileId || file.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            marginBottom: '8px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>📄</span>
                            <a 
                              href={file.filePath || `/api/SubmissionFile/download/${file.fileId}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none', color: '#0056b3', fontWeight: '500' }}
                            >
                              {file.fileName || file.originalFileName || `Attachment #${file.fileId}`}
                            </a>
                          </div>
                          
                          {isEditable && (
                            <button 
                              type="button" 
                              onClick={() => handleDeleteFile(file.fileId)}
                              style={{
                                backgroundColor: 'transparent',
                                color: '#dc3545',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}
                            >
                              ✕ Remove
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '15px' }}>No files attached for this group yet.</p>
                  )}

                  {isEditable && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        id="topicFileInput"
                        type="file"
                        className="form-control"
                        style={{ maxWidth: '350px' }}
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleFileUpload}
                        disabled={uploading || !selectedFile}
                      >
                        {uploading ? 'Uploading...' : 'Upload File'}
                      </button>
                    </div>
                  )}
                </div>

                {/* --- Form Actions --- */}
                {isEditable && (
                  <div style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={saving}
                      onClick={() => handleSubmit('DRAFT')}
                    >
                      {saving ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={saving}
                      onClick={() => handleSubmit('SUBMITTED')}
                    >
                      {saving ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}