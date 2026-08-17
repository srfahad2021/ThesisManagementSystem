import React, { useState, useEffect, useMemo } from 'react';
import '../style.css';

export default function AllGroupsList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State for Group Documents
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDocs, setGroupDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Helper to fetch Auth Token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 1. Fetch All Thesis Groups
  useEffect(() => {
    fetchAllGroups();
  }, []);

  const fetchAllGroups = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/Group', {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        setError('Failed to fetch thesis groups.');
      }
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('An error occurred while loading groups.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Documents for Selected Group
  const handleShowDocuments = async (group) => {
    setSelectedGroup(group);
    setLoadingDocs(true);
    setGroupDocs([]);

    try {
      const response = await fetch(`/api/SubmissionFile/module/DocumentSubmission/${group.groupId}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const docs = await response.json();
        setGroupDocs(docs);
      } else {
        console.error('Failed to fetch group documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // 3. Download Document
  const handleDownload = async (fileId) => {
    try {
      const response = await fetch(`/api/SubmissionFile/download/${fileId}`, {
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

  // Filter groups by search query and status
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const query = searchQuery.toLowerCase().trim();

      const groupNameMatch = (group.groupName || group.GroupName)?.toLowerCase().includes(query);

      const student1Name = group.student1?.fullName || group.student1?.username || '';
      const student2Name = group.student2?.fullName || group.student2?.username || '';
      const memberMatch =
        student1Name.toLowerCase().includes(query) ||
        student2Name.toLowerCase().includes(query);

      const supervisorName = group.supervisor?.fullName || group.supervisor?.username || '';
      const supervisorMatch = supervisorName.toLowerCase().includes(query);

      const matchesSearch = !query || groupNameMatch || memberMatch || supervisorMatch;

      const matchesStatus =
        statusFilter === 'ALL' ||
        group.status?.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [groups, searchQuery, statusFilter]);

  // Reset to first page when filtering/searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Paginated data slice
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage) || 1;
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroups, currentPage, itemsPerPage]);

  // Dynamic status badge helper
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'COMPLETED':
      case 'ACTIVE':
        return 'badge-success';
      case 'REJECTED':
      case 'INACTIVE':
        return 'badge-danger';
      case 'PENDING':
      case 'UNDER REVIEW':
        return 'badge-warning';
      default:
        return 'badge-neutral';
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
          {/* Header Section */}
          <div
            className="section-head"
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div className="section-title" style={{ fontSize: '18px', fontWeight: '600' }}>
                All Thesis Groups
              </div>
              <div className="text-muted text-sm">
                Overview of all registered thesis groups, assigned students, and submitted documents.
              </div>
            </div>

            {/* Controls: Search & Status Filter */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', minWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search group, member, or supervisor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  flex: '1',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* Table View */}
          <div
            className="card"
            style={{
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderRadius: '8px',
            }}
          >
            <div className="table-wrap" style={{ overflowX: 'auto' }}>
              <table
                className="data-table"
                style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Group Name</th>
                    <th style={thStyle}>Group Members</th>
                    <th style={thStyle}>Supervisor</th>
                    <th style={{ ...thStyle, textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ divideY: '1px solid #f3f4f6' }}>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                        Loading groups...
                      </td>
                    </tr>
                  ) : paginatedGroups.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                        {searchQuery || statusFilter !== 'ALL'
                          ? 'No groups match your current filter.'
                          : 'No thesis groups found.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedGroups.map((group) => {
                      const members = [
                        group.student1?.fullName || group.student1?.username,
                        group.student2?.fullName || group.student2?.username,
                      ]
                        .filter(Boolean)
                        .join(', ');

                      const supervisorName =
                        group.supervisor?.fullName || group.supervisor?.username || 'Unassigned';

                      return (
                        <tr key={group.groupId} className="data-table-row">
                          <td style={{ ...tdStyle, color: '#6b7280', fontSize: '13px' }}>
                            #{group.groupId}
                          </td>
                          <td style={tdStyle}>
                            <strong style={{ color: 'var(--text-primary, #111827)', fontSize: '14px' }}>
                              {group.GroupName || group.groupName}
                            </strong>
                          </td>
                          <td style={{ ...tdStyle, color: '#4b5563', fontSize: '13px' }}>
                            {members || 'No members assigned'}
                          </td>
                          <td style={{ ...tdStyle, color: '#4b5563', fontSize: '13px' }}>
                            {supervisorName}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right', paddingRight: '20px' }}>
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

            {/* Pagination Controls Footer */}
            {!loading && filteredGroups.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderTop: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                }}
              >
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredGroups.length)} of{' '}
                  {filteredGroups.length} groups
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    className="btn-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    style={{
                      opacity: 1,
                      cursor: 'pointer',
                    }}
                  >
                    Previous
                  </button>

                  <span style={{ fontSize: '13px', color: '#374151', padding: '0 4px' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="btn-primary btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    style={{
                      opacity: 1,
                      cursor: 'pointer',
                    }}
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
              <div
                className="modal-content card"
                style={{ ...modalContentStyle, width: '650px', maxWidth: '95vw' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>
                      Documents for {selectedGroup.groupName || selectedGroup.GroupName}
                    </h3>
                    <div className="text-muted text-sm" style={{ marginTop: '2px' }}>
                      View uploaded thesis documents and files.
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
                          <th style={{ padding: '10px', fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
                            Actions
                          </th>
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

                          return (
                            <tr key={doc.fileId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '10px', fontSize: '13px', fontWeight: '500' }}>{title}</td>
                              <td style={{ padding: '10px' }}>
                                <span className="badge badge-neutral">{type}</span>
                              </td>
                              <td style={{ padding: '10px', fontSize: '12px', color: '#6b7280' }}>
                                {formattedDate}
                              </td>
                              <td style={{ padding: '10px' }}>
                                <span className={`badge ${getStatusBadge(doc.status)}`}>
                                  {doc.status || 'Submitted'}
                                </span>
                              </td>
                              <td style={{ padding: '10px', textAlign: 'right' }}>
                                <button
                                  className="btn-secondary btn-sm"
                                  onClick={() => handleDownload(doc.fileId)}
                                >
                                  Download
                                </button>
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
        </div>
      </div>
    </div>
  );
}

// Inline Style Helpers
const thStyle = {
  padding: '12px 16px',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#6b7280',
};

const tdStyle = {
  padding: '12px 16px',
  verticalAlign: 'middle',
};

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