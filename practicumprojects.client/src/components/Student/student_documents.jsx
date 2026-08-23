import React, { useState, useEffect } from 'react';
import '../style.css';

// Helper function to render table rows
export function docRow(name, type, version, date, status, fileId, onDownload, onDelete, onShowReview) {
  const sc =
    status === 'Approved'
      ? 'badge-success'
      : status === 'Revision Requested'
      ? 'badge-danger'
      : status === 'Under Review'
      ? 'badge-warning'
      : 'badge-neutral';

  return (
    <tr key={fileId || name} className="data-table-row">
      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
        <strong style={{ color: 'var(--text-primary, #111827)', fontSize: '14px' }}>{name}</strong>
      </td>
      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
        <span className="badge badge-neutral">{type}</span>
      </td>
      <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: 'var(--text-secondary, #6b7280)', fontSize: '13px', textAlign: 'center' }}>
        {date}
      </td>
      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
        <span className={`badge ${sc}`}>{status}</span>
      </td>
      <td style={{ padding: '12px 20px 12px 16px', verticalAlign: 'middle', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <button className="btn-secondary btn-sm" onClick={() => onShowReview(fileId, name, status)}>
            Show Review
          </button>
          <button className="btn-secondary btn-sm" onClick={() => onDownload(fileId)}>
            Download
          </button>
          <button className="btn-primary btn-sm" onClick={() => onDelete(fileId)}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function StudentDocuments({ moduleType = 'DocumentSubmission' }) {
  // Group Selection State
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Review Modal State
  const [reviewModalDoc, setReviewModalDoc] = useState(null);

  // Form State inside Upload Popup
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Proposal');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Get Auth Bearer Headers if stored in client
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 1. Fetch user's assigned groups on mount
  useEffect(() => {
    fetchStudentGroups();
  }, []);

  // 2. Fetch documents whenever selectedGroupId changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchDocuments(selectedGroupId);
    } else {
      setDocuments([]);
    }
  }, [selectedGroupId, moduleType]);

  const fetchStudentGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Group/my-groups`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUserGroups(data);
        if (data.length > 0) {
          // Auto-select the first group
          setSelectedGroupId(data[0].groupId);
        }
      } else {
        console.error('Failed to fetch student groups');
      }
    } catch (error) {
      console.error('Error fetching student groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchDocuments = async (groupId) => {
    try {
      setLoadingDocs(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/SubmissionFile/module/${moduleType}/${groupId}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Upload Document with selectedGroupId as entityId
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      setErrorMsg('Please select a group first.');
      return;
    }
    if (!selectedFile) {
      setErrorMsg('Please select a file.');
      return;
    }
    if (!docTitle.trim()) {
      setErrorMsg('Please enter a Document Title.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('moduleType', moduleType);
    formData.append('entityId', selectedGroupId);

    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
    const sanitizedTitle = `${docTitle.trim()} [${docType}]${fileExtension}`;

    const fileWithTitle = new File([selectedFile], sanitizedTitle, { type: selectedFile.type });
    formData.append('file', fileWithTitle);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/SubmissionFile/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setSelectedFile(null);
        setDocTitle('');
        setDocType('Proposal');
        setIsModalOpen(false);
        fetchDocuments(selectedGroupId);
      } else {
        const errData = await response.json().catch(() => ({}));
        setErrorMsg(errData.message || 'Upload failed.');
      }
    } catch (err) {
      setErrorMsg('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Download File
  const handleDownload = async (fileId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/SubmissionFile/download/${fileId}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Delete File
  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/SubmissionFile/${fileId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc.fileId !== fileId));
      } else {
        alert('Failed to delete document.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Open Review Modal
  const handleShowReview = (fileId, title, status) => {
    const doc = documents.find((d) => d.fileId === fileId);
    setReviewModalDoc({
      fileId,
      title,
      status: doc?.status || status || 'Under Review',
      reviewComments: doc?.reviewComments || 'No reviewer feedback has been provided for this document yet.',
      reviewedAt: doc?.reviewedAt ? new Date(doc.reviewedAt).toLocaleDateString('en-US') : 'N/A',
      reviewerName: doc?.reviewerName || 'Assigned Supervisor',
    });
  };

  // Parse custom title and document type from raw filename
  const parseDocumentDetails = (rawFileName) => {
    const cleanName = rawFileName.replace(/\.[^/.]+$/, '');
    const match = cleanName.match(/^(.*?) \[(.*?)\]$/);
    if (match) {
      return { title: match[1], type: match[2] };
    }
    return { title: cleanName, type: 'Document' };
  };

  const renderContent = () => {
    return (
      <>
        {/* Header & Group Selector */}
        <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="section-title" style={{ fontSize: '18px', fontWeight: '600' }}>
              Document Management
            </div>
            <div className="text-muted text-sm" style={{ marginTop: '4px' }}>
              Select a group to view and manage its submitted documents.
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedGroupId || userGroups.length === 0}
          >
            + Upload Document
          </button>
        </div>

        {/* Group Selection Dropdown Bar */}
        <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label htmlFor="groupSelect" style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>
            Select Group:
          </label>
          {loadingGroups ? (
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Loading your groups...</span>
          ) : userGroups.length === 0 ? (
            <span style={{ fontSize: '13px', color: 'var(--danger-color, red)' }}>
              You are not a member of any group yet.
            </span>
          ) : (
            <select
              id="groupSelect"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                minWidth: '220px',
                backgroundColor: '#fff',
              }}
            >
              {userGroups.map((group) => (
                <option key={group.groupId} value={group.groupId}>
                  {group.groupName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Document Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', width: '20%', textAlign: 'center' }}>
                    Document Title
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', width: '15%', textAlign: 'center' }}>
                    Type
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', width: '15%', textAlign: 'center' }}>
                    Date Uploaded
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', width: '15%', textAlign: 'center' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 20px 12px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', textAlign: 'center', width: '20%' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #f3f4f6' }}>
                {loadingDocs ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      Loading documents...
                    </td>
                  </tr>
                ) : !selectedGroupId ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                      Please select a group to view documents.
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                      No documents uploaded for this group yet.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => {
                    const { title, type } = parseDocumentDetails(doc.fileName);
                    const formattedDate = new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return docRow(
                      title,
                      type,
                      'v1.0',
                      formattedDate,
                      doc.status || 'Under Review',
                      doc.fileId,
                      handleDownload,
                      handleDelete,
                      handleShowReview
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Popup Modal */}
        {isModalOpen && (
          <div className="modal-overlay" style={modalOverlayStyle}>
            <div className="modal-content card" style={modalContentStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Upload Document</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                >
                  ✕
                </button>
              </div>

              {errorMsg && <div style={{ color: 'var(--danger-color, red)', marginBottom: '10px', fontSize: '13px' }}>{errorMsg}</div>}

              <form onSubmit={handleUploadSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Research Proposal, Chapter 1 - Intro"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value="Proposal">Proposal</option>
                    <option value="Chapter">Chapter</option>
                    <option value="Literature Review">Literature Review</option>
                    <option value="Methodology">Methodology</option>
                    <option value="Report">Report</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>File Document</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary btn-sm" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Review Feedback Modal */}
        {reviewModalDoc && (
          <div className="modal-overlay" style={modalOverlayStyle}>
            <div className="modal-content card" style={{ ...modalContentStyle, width: '450px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Document Review</h3>
                <button
                  onClick={() => setReviewModalDoc(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Document:</strong> <span style={{ color: 'var(--text-secondary)' }}>{reviewModalDoc.title}</span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Status:</strong>{' '}
                <span className={`badge ${
                  reviewModalDoc.status === 'Approved'
                    ? 'badge-success'
                    : reviewModalDoc.status === 'Revision Requested'
                    ? 'badge-danger'
                    : reviewModalDoc.status === 'Under Review'
                    ? 'badge-warning'
                    : 'badge-neutral'
                }`}>
                  {reviewModalDoc.status}
                </span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Reviewer:</strong> <span style={{ color: 'var(--text-secondary)' }}>{reviewModalDoc.reviewerName}</span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Feedback Comments:</strong>
                <div style={{
                  marginTop: '6px',
                  padding: '10px',
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap'
                }}>
                  {reviewModalDoc.reviewComments}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button className="btn-secondary btn-sm" onClick={() => setReviewModalDoc(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">{renderContent()}</div>
      </div>
    </div>
  );
}

// Inline Styles for Modal Overlay
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  width: '380px',
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '8px',
};