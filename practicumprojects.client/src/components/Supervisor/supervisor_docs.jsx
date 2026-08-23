import React, { useState, useEffect, useMemo } from 'react';
import '../style.css';

export default function SupervisorDocs() {
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Group Documents Modal State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDocs, setGroupDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Review Modal State
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Helper to fetch Auth Token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 1. Fetch Supervisor's Assigned Groups
  useEffect(() => {
    fetchSupervisorGroups();
  }, []);

  const fetchSupervisorGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Group/my-groups`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        console.error('Failed to fetch supervised groups');
      }
    } catch (error) {
      console.error('Error loading supervisor groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Filter groups based on search query (group name or student names/usernames)
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase().trim();

    return groups.filter((group) => {
      const groupNameMatches = group.groupName?.toLowerCase().includes(query);

      const student1Name = group.student1?.fullName || group.student1?.username || '';
      const student2Name = group.student2?.fullName || group.student2?.username || '';
      
      const memberMatches =
        student1Name.toLowerCase().includes(query) ||
        student2Name.toLowerCase().includes(query);

      return groupNameMatches || memberMatches;
    });
  }, [groups, searchQuery]);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination slice
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage) || 1;
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroups, currentPage, itemsPerPage]);

  // 2. Open Documents Modal & Fetch Group Documents
  const handleShowDocuments = async (group) => {
    setSelectedGroup(group);
    setLoadingDocs(true);
    setGroupDocs([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/SubmissionFile/module/DocumentSubmission/${group.groupId}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const docs = await response.json();
        setGroupDocs(docs);
      } else {
        console.error('Failed to fetch group documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  // 3. Download Document
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

  // 4. Open Review Modal
  const handleOpenReviewModal = (doc) => {
    setSelectedDoc(doc);
    setReviewStatus(doc.status || 'Approved');
    setReviewComments(doc.reviewComments || '');
    setReviewError('');
  };

  // 5. Submit Review Feedback
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/SubmissionFile/review/${selectedDoc.fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          status: reviewStatus,
          reviewComments: reviewComments.trim(),
        }),
      });

      if (response.ok) {
        // Update document state locally inside groupDocs
        setGroupDocs((prevDocs) =>
          prevDocs.map((doc) =>
            doc.fileId === selectedDoc.fileId
              ? { ...doc, status: reviewStatus, reviewComments: reviewComments.trim() }
              : doc
          )
        );
        setSelectedDoc(null);
      } else {
        const errData = await response.json().catch(() => ({}));
        setReviewError(errData.message || 'Failed to submit review.');
      }
    } catch (error) {
      setReviewError('An error occurred while saving the review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Helper to extract clean document title and type
  const parseDocumentDetails = (rawFileName) => {
    const cleanName = rawFileName.replace(/\.[^/.]+$/, '');
    const match = cleanName.match(/^(.*?) \[(.*?)\]$/);
    if (match) {
      return { title: match[1], type: match[2] };
    }
    return { title: cleanName, type: 'Document' };
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px', fontWeight: '600' }}>
                Supervisor Document Review
              </div>
              <div className="text-muted text-sm">
                View submitted thesis/project documents and provide feedback to your assigned groups.
              </div>
            </div>

            {/* Search Input Bar */}
            <div style={{ minWidth: '260px', flex: '0 1 320px' }}>
              <input
                type="text"
                placeholder="Search by group name or member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              />
            </div>
          </div>

          {/* Supervised Groups Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <div className="table-wrap" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                      Group Name
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                      Group Members
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                      Supervisor
                    </th>
                    <th style={{ padding: '12px 20px 12px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ divideY: '1px solid #f3f4f6' }}>
                  {loadingGroups ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                        Loading assigned groups...
                      </td>
                    </tr>
                  ) : filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                        {searchQuery ? 'No groups found matching your search.' : 'No groups assigned to you yet.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedGroups.map((group) => {
                      const members = [
                        group.student1?.fullName || group.student1?.username,
                        group.student2?.fullName || group.student2?.username,
                      ].filter(Boolean).join(', ');

                      const supervisorName =
                        group.supervisor?.fullName || group.supervisor?.username || 'Unassigned';

                      return (
                        <tr key={group.groupId} className="data-table-row">
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                            <strong style={{ color: 'var(--text-primary, #111827)', fontSize: '14px' }}>
                              {group.groupName}
                            </strong>
                          </td>
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: '#4b5563', fontSize: '13px' }}>
                            {members || 'No members assigned'}
                          </td>
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: '#4b5563', fontSize: '13px' }}>
                            {supervisorName}
                          </td>
                          <td style={{ padding: '12px 20px 12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                            <button
                              className="btn-primary btn-sm"
                              onClick={() => handleShowDocuments(group)}
                            >
                              Show Document
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Navigation Bar */}
            {!loadingGroups && filteredGroups.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#ffffff'
              }}>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredGroups.length)} of  {filteredGroups.length} groups
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    // style={{  cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>

                  <span style={{ fontSize: '13px', color: '#374151', padding: '0 6px' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="btn-primary btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    // style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Group Documents Modal */}
          {selectedGroup && (
            <div className="modal-overlay" style={modalOverlayStyle}>
              <div className="modal-content card" style={{ ...modalContentStyle, width: '700px', maxWidth: '95vw' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>
                      Documents for {selectedGroup.groupName}
                    </h3>
                    <div className="text-muted text-sm" style={{ marginTop: '2px' }}>
                      Review uploaded materials and provide feedback.
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGroup(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {loadingDocs ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      Loading documents...
                    </div>
                  ) : groupDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                      This group has not uploaded any documents yet.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '10px', fontSize: '12px', color: '#6b7280' }}>Title</th>
                          <th style={{ padding: '10px', fontSize: '12px', color: '#6b7280' }}>Type</th>
                          <th style={{ padding: '10px', fontSize: '12px', color: '#6b7280' }}>Uploaded</th>
                          <th style={{ padding: '10px', fontSize: '12px', color: '#6b7280' }}>Status</th>
                          <th style={{ padding: '10px', fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupDocs.map((doc) => {
                          const { title, type } = parseDocumentDetails(doc.fileName);
                          const formattedDate = new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });

                          const statusBadge =
                            doc.status === 'Approved'
                              ? 'badge-success'
                              : doc.status === 'Revision Requested'
                              ? 'badge-danger'
                              : doc.status === 'Under Review'
                              ? 'badge-warning'
                              : 'badge-neutral';

                          return (
                            <tr key={doc.fileId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '10px', fontSize: '13px', fontWeight: '500' }}>{title}</td>
                              <td style={{ padding: '10px' }}>
                                <span className="badge badge-neutral">{type}</span>
                              </td>
                              <td style={{ padding: '10px', fontSize: '12px', color: '#6b7280' }}>{formattedDate}</td>
                              <td style={{ padding: '10px' }}>
                                <span className={`badge ${statusBadge}`}>{doc.status || 'Under Review'}</span>
                              </td>
                              <td style={{ padding: '10px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button
                                    className="btn-secondary btn-sm"
                                    onClick={() => handleDownload(doc.fileId)}
                                  >
                                    Download
                                  </button>
                                  <button
                                    className="btn-primary btn-sm"
                                    onClick={() => handleOpenReviewModal(doc)}
                                  >
                                    Review
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button className="btn-secondary btn-sm" onClick={() => setSelectedGroup(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Review Modal */}
          {selectedDoc && (
            <div className="modal-overlay" style={{ ...modalOverlayStyle, zIndex: 1100 }}>
              <div className="modal-content card" style={{ ...modalContentStyle, width: '480px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Review Document</h3>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                  >
                    ✕
                  </button>
                </div>

                {reviewError && (
                  <div style={{ color: 'var(--danger-color, red)', marginBottom: '10px', fontSize: '13px' }}>
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                      Document Name
                    </label>
                    <div style={{ fontSize: '14px', color: '#374151', padding: '6px 0' }}>
                      {parseDocumentDetails(selectedDoc.fileName).title}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                      Review Status
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      <option value="Approved">Approved</option>
                      <option value="Revision Requested">Revision Requested</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                      Review Feedback / Comments
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Add specific recommendations, required revisions, or feedback..."
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setSelectedDoc(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary btn-sm" disabled={isSubmittingReview}>
                      {isSubmittingReview ? 'Saving...' : 'Submit Review'}
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

// Modal Overlay Styles
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
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '20px',
};