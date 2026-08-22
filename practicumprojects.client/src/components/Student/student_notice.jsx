import React, { useState, useEffect, useMemo } from 'react';
import '../style.css';
import { NoticeCard } from '../NoticeComponents';

const API_BASE = 'https://thesismanagementsystem-6opj.onrender.com/api';
const PAGE_SIZE = 10;

export default function Student_notice() {
  const [notices, setNotices] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, PUBLIC, PRIVATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchNotices();
  }, [typeFilter]);

  // Reset pagination to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/Notice?typeFilter=${typeFilter}`, {
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Failed to fetch notices.');
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const res = await fetch(`${API_BASE}/SubmissionFile/download/${fileId}`, {
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Download failed.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter notices based on search input
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const query = searchTerm.toLowerCase();
      const titleMatch = notice.title?.toLowerCase().includes(query);
      const contentMatch = notice.content?.toLowerCase().includes(query);
      const authorMatch = notice.authorName?.toLowerCase().includes(query);
      return titleMatch || contentMatch || authorMatch;
    });
  }, [notices, searchTerm]);

  // Dynamic pagination calculation
  const totalPages = Math.ceil(filteredNotices.length / PAGE_SIZE);

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
              <div className="section-title" style={{ fontSize: '18px' }}>Student Notice Board</div>
              <div className="text-muted text-sm">View general announcements and private notices for your group.</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="form-control"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">Show All Notices</option>
                <option value="PUBLIC">Public Only</option>
                <option value="PRIVATE">Private Only</option>
              </select>
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
                {searchTerm ? 'No matching notices found.' : 'No notices available.'}
              </p>
            </div>
          ) : (
            <>
              {paginatedNotices.map((notice) => (
                <NoticeCard
                  key={notice.noticeId}
                  notice={notice}
                  userRole="STUDENT"
                  onDownloadAttachment={handleDownload}
                />
              ))}

              {/* Pagination & Footer Info */}
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', marginTop: '16px' }}>
                <span style={{ fontSize: '14px', color: '#6c757d' }}>
                  Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredNotices.length)} of {filteredNotices.length} results
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}