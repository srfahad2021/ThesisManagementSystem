import React, { useState, useEffect } from 'react';
import '../style.css';
import { NoticeCard, NoticeModal } from '../NoticeComponents';

const API_BASE = 'http://localhost:64580/api';

export default function Supervisor_notice() {
  const [notices, setNotices] = useState([]);
  const [assignableGroups, setAssignableGroups] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [error, setError] = useState(null);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchNotices();
    fetchGroups();
  }, [typeFilter]);

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

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px' }}>Supervisor Notice Board</div>
              <div className="text-muted text-sm">Post private notices to your supervised groups or view public announcements.</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="ALL">Show All</option>
                <option value="PUBLIC">Public Only</option>
                <option value="PRIVATE">Private Only</option>
              </select>
              <button className="btn-primary" onClick={() => { setEditingNotice(null); setIsModalOpen(true); }}>
                + Create Notice
              </button>
            </div>
          </div>

          {error && <div className="card" style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

          {loading ? (
            <div className="card"><p className="text-muted">Loading notices...</p></div>
          ) : notices.length === 0 ? (
            <div className="card"><p className="text-muted">No notices found.</p></div>
          ) : (
            notices.map((n) => (
              <NoticeCard
                key={n.noticeId}
                notice={n}
                userRole="SUPERVISOR"
                onEdit={(notice) => { setEditingNotice(notice); setIsModalOpen(true); }}
                onDelete={handleDeleteNotice}
                onDownloadAttachment={handleDownload}
              />
            ))
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