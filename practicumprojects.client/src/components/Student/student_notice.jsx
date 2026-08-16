import React, { useState, useEffect } from 'react';
import '../style.css';
import { NoticeCard } from '../NoticeComponents';

const API_BASE = 'http://localhost:64580/api';

export default function Student_notice() {
  const [notices, setNotices] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, PUBLIC, PRIVATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchNotices();
  }, [typeFilter]);

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

          {error && <div className="card" style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

          {loading ? (
            <div className="card"><p className="text-muted">Loading notices...</p></div>
          ) : notices.length === 0 ? (
            <div className="card"><p className="text-muted">No notices available.</p></div>
          ) : (
            notices.map((notice) => (
              <NoticeCard
                key={notice.noticeId}
                notice={notice}
                userRole="STUDENT"
                onDownloadAttachment={handleDownload}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}