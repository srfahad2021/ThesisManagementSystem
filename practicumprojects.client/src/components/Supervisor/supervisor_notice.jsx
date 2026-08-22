import React, { useState, useEffect, useMemo } from 'react';
import '../style.css';
import { NoticeCard, NoticeModal } from '../NoticeComponents';

const API_BASE = 'https://thesismanagementsystem-6opj.onrender.com/api';
const PAGE_SIZE = 10;

export default function Supervisor_notice() {
  const [notices, setNotices] = useState([]);
  const [assignableGroups, setAssignableGroups] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [error, setError] = useState(null);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchNotices();
    fetchGroups();
  }, [typeFilter]);

  // Reset pagination to page 1 on filter or search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Notice?typeFilter=${typeFilter}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error('Failed to load notices.');
      setNotices(await res.json());
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
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
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

  // Filter notices based on search query
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const query = searchTerm.toLowerCase();
      const titleMatch = n.title?.toLowerCase().includes(query);
      const contentMatch = n.content?.toLowerCase().includes(query);
      const authorMatch = n.authorName?.toLowerCase().includes(query);
      return titleMatch || contentMatch || authorMatch;
    });
  }, [notices, searchTerm]);

  // Total pages calculation
  const totalPages = Math.ceil(filteredNotices.length / PAGE_SIZE);

  // Paginated items slice
  const paginatedNotices = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredNotices.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredNotices, currentPage]);

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px' }}>Supervisor Notice Board</div>
              <div className="text-muted text-sm">Post private notices to your supervised groups or view public announcements.</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', width: '350px' }}>
              <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="ALL">Show All</option>
                <option value="PUBLIC">Public Only</option>
                <option value="PRIVATE">Private Only</option>
              </select>
              <button className="btn-primary" style={{width: '200px'}} onClick={() => { setEditingNotice(null); setIsModalOpen(true); }}>
                + Create Notice
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px', padding: '8px' }}
            />
          </div>

          {error && <div className="card" style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

          {loading ? (
            <div className="card"><p className="text-muted">Loading notices...</p></div>
          ) : paginatedNotices.length === 0 ? (
            <div className="card">
              <p className="text-muted">
                {searchTerm ? 'No matching notices found.' : 'No notices found.'}
              </p>
            </div>
          ) : (
            <>
              {paginatedNotices.map((n) => (
                <NoticeCard
                  key={n.noticeId}
                  notice={n}
                  userRole="SUPERVISOR"
                  onEdit={(notice) => { setEditingNotice(notice); setIsModalOpen(true); }}
                  onDelete={handleDeleteNotice}
                  onDownloadAttachment={handleDownload}
                />
              ))}

              {/* Pagination & Status Footer */}
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', marginTop: '16px' }}>
                <span style={{ fontSize: '14px', color: '#6c757d' }}>
                  Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredNotices.length)} of {filteredNotices.length} results
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
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
            isSupervisor={true}
          />
        </div>
      </div>
    </div>
  );
}