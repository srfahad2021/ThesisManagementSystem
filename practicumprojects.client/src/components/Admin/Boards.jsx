import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: '16px'
};

const modalCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '24px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
};

// Helper function to extract Auth headers from sessionStorage
const getAuthConfig = () => {
  const token = sessionStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = getAuthConfig();

      const [boardRes, semRes] = await Promise.all([
        axios.get('/api/board', config),
        axios.get('/api/semester/active', config)
      ]);

      setBoards(boardRes.data || []);
      setSemesters(semRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBoards = useMemo(() => {
    return boards.filter((b) => {
      const matchesSearch =
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id?.toString().includes(searchTerm) ||
        b.semesterName?.toLowerCase().includes(searchTerm.toLowerCase());

      const isActive = b.isActive;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'Active' && isActive) ||
        (selectedStatus === 'Disabled' && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [boards, searchTerm, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const totalPages = Math.ceil(filteredBoards.length / itemsPerPage) || 1;
  const paginatedBoards = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBoards.slice(start, start + itemsPerPage);
  }, [filteredBoards, currentPage, itemsPerPage]);

  const handleToggleStatus = async (board) => {
    const newStatus = !board.isActive;
    try {
      await axios.put(`/api/board/${board.id}/status`, { isActive: newStatus }, getAuthConfig());
      setBoards((prev) =>
        prev.map((b) => (b.id === board.id ? { ...b, isActive: newStatus } : b))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Could not update board status.');
    }
  };

  const handleDeleteBoard = async (board) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete board "${board.name || '#' + board.id}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`/api/board/${board.id}`, getAuthConfig());
      setBoards((prev) => prev.filter((b) => b.id !== board.id));
    } catch (err) {
      console.error('Failed to delete board:', err);
      alert(err.response?.data?.message || 'Could not delete board.');
    }
  };

  return (
    <div className="boards-container" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Board Management</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => setIsBulkOpen(true)}>
            Bulk Create
          </button>
          <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
            + Create Board
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by board ID, name, or semester..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          className="form-control"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Disabled">Disabled</option>
        </select>
      </div>

      {loading ? (
        <p>Loading boards...</p>
      ) : (
        <div className="table-responsive">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Board ID</th>
                <th style={{ padding: '12px' }}>Board Name</th>
                <th style={{ padding: '12px' }}>Semester</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBoards.length > 0 ? (
                paginatedBoards.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>#{b.id}</td>
                    <td style={{ padding: '12px' }}>{b.name || `Board #${b.id}`}</td>
                    <td style={{ padding: '12px' }}>{b.semesterName || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: b.isActive ? '#e6f4ea' : '#fce8e6',
                          color: b.isActive ? '#137333' : '#c5221f'
                        }}
                      >
                        {b.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ marginRight: '8px', padding: '4px 8px' }}
                        onClick={() => setEditingBoard(b)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-primary"
                        style={{ marginRight: '8px', padding: '4px 8px' }}
                        onClick={() => handleToggleStatus(b)}
                      >
                        {b.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 8px', borderColor: '#E85555'
                         }}
                        onClick={() => handleDeleteBoard(b)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                    No boards found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button
            className="btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span style={{ alignSelf: 'center', fontSize: '14px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      )}

      {isCreateOpen && (
        <BoardFormModal
          semesters={semesters}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchData();
          }}
        />
      )}

      {editingBoard && (
        <BoardFormModal
          board={editingBoard}
          semesters={semesters}
          onClose={() => setEditingBoard(null)}
          onSuccess={() => {
            setEditingBoard(null);
            fetchData();
          }}
        />
      )}

      {isBulkOpen && (
        <BoardBulkCreatePopup
          semesters={semesters}
          onClose={() => setIsBulkOpen(false)}
          onSuccess={() => {
            setIsBulkOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function BoardFormModal({ board, semesters, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: board?.name || '',
    semesterId: board?.semesterId ? board.semesterId.toString() : ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        semesterId: formData.semesterId ? parseInt(formData.semesterId, 10) : null
      };

      const config = getAuthConfig();

      if (board) {
        await axios.put(`/api/board/${board.id}`, payload, config);
      } else {
        await axios.post('/api/board', payload, config);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save board.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-card" style={modalCardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
          {board ? 'Edit Board' : 'Create New Board'}
        </h3>

        {error && <div style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Board Name *
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Board A"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Active Semester
            </label>
            <select
              name="semesterId"
              className="form-control"
              value={formData.semesterId}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              <option value="">-- Select Active Semester --</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : board ? 'Save Changes' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BoardBulkCreatePopup({ semesters, onClose, onSuccess }) {
  const defaultSemesterId = semesters.length > 0 ? semesters[0].id : 1;
  const initialJson = JSON.stringify(
    [
      { name: 'Board A', semesterId: defaultSemesterId },
      { name: 'Board B', semesterId: defaultSemesterId }
    ],
    null,
    2
  );

  const [jsonText, setJsonText] = useState(initialJson);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const parsedData = JSON.parse(jsonText);
      if (!Array.isArray(parsedData)) {
        setError('JSON payload must be an array of board objects.');
        return;
      }

      setSubmitting(true);
      await axios.post('/api/board/bulk', parsedData, getAuthConfig());
      onSuccess();
    } catch (err) {
      console.error(err);
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your syntax.');
      } else {
        setError(err.response?.data?.message || 'Failed to upload bulk boards.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-card" style={modalCardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Bulk Create Boards</h3>

        {error && <div style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Paste JSON Array
            </label>
            <textarea
              className="form-control"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows="8"
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Upload Boards'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}