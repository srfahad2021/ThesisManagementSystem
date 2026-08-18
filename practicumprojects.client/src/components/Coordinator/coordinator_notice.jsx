import React, { useState, useEffect } from 'react';
import '../style.css';
import { NoticeCard, NoticeModal } from '../NoticeComponents';

const API_BASE = 'http://localhost:64580/api';

export default function Coordinator_notice() {
  const [notices, setNotices] = useState([]);
  const [assignableGroups, setAssignableGroups] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedGroupId, setSelectedGroupId] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust items per page as needed

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchNotices();
    fetchGroups();
  }, [typeFilter, selectedGroupId]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Notice?typeFilter=${typeFilter}&groupId=${selectedGroupId}`, {
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Failed to load notices.');
      setNotices(await res.json());
      setCurrentPage(1); // Reset to first page on filter change/data reload
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/Notice/assignable-groups`, { headers: getAuthHeader() });
      if (res.ok) setAssignableGroups(await res.json());
    } catch (err) { }
  };

  const handleSaveNotice = async (formData, noticeId) => {
    try {
      const method = noticeId ? 'PUT' : 'POST';
      const url = noticeId ? `${API_BASE}/Notice/${noticeId}` : `${API_BASE}/Notice`;

      const res = await fetch(url, {
        method: method,
        headers: getAuthHeader(),
        body: formData
      });

      if (!res.ok) throw new Error('Failed to save notice.');

      setIsModalOpen(false);
      setEditingNotice(null);
      fetchNotices();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Delete this notice? (Admin/Coordinator privilege)')) return;
    try {
      const res = await fetch(`${API_BASE}/Notice/${noticeId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Failed to delete notice.');
      fetchNotices();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const res = await fetch(`${API_BASE}/SubmissionFile/download/${fileId}`, { headers: getAuthHeader() });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (err) {
      alert('Download error');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Filter notices by title or text content
  const filteredNotices = notices.filter((n) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const titleMatch = n.title ? n.title.toLowerCase().includes(query) : false;
    const textMatch = n.bodyText ? n.bodyText.toLowerCase().includes(query) : false;
    return titleMatch || textMatch;
  });

  // Pagination calculation values
  const totalEntries = filteredNotices.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const currentNotices = filteredNotices.slice(startIndex, endIndex);

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px' }}>Coordinator Notice Board</div>
              <div className="text-muted text-sm">Manage public announcements and private group communications.</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search title or text..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ width: '200px' }}
              />

              <select className="form-control" style={{width: '200px'}} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="ALL">All Types</option>
                <option value="PUBLIC">Public Only</option>
                <option value="PRIVATE">Private Only</option>
              </select>

              <select
                className="form-control"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(parseInt(e.target.value, 10))}
                style={{width: '200px'}}
              >
                <option value={0}>All Groups Filter</option>
                {assignableGroups.map((g) => (
                  <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
                ))}
              </select>

              <button className="btn-primary" style={{ width: '200px' }} onClick={() => { setEditingNotice(null); setIsModalOpen(true); }}>
                + Create Notice
              </button>
            </div>
          </div>

          {error && <div className="card" style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

          {loading ? (
            <div className="card"><p className="text-muted">Loading notices...</p></div>
          ) : totalEntries === 0 ? (
            <div className="card"><p className="text-muted">No notices found.</p></div>
          ) : (
            <>
              {currentNotices.map((n) => (
                <NoticeCard
                  key={n.noticeId}
                  notice={n}
                  userRole="COORDINATOR"
                  onEdit={(notice) => { setEditingNotice(notice); setIsModalOpen(true); }}
                  onDelete={handleDeleteNotice}
                  onDownloadAttachment={handleDownload}
                />
              ))}

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

          <NoticeModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingNotice(null); }}
            onSave={handleSaveNotice}
            assignableGroups={assignableGroups}
            initialNotice={editingNotice}
            isSupervisor={false}
          />
        </div>
      </div>
    </div>
  );
}