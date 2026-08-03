import React, { useState, useEffect } from 'react';
import '../style.css';

// Semester Row Helper Function
export function semRow(sem, year, start, end, groups, status, onEdit) {
  const sc = status === 'Active' ? 'badge-success' : status === 'Completed' ? 'badge-info' : 'badge-neutral';
  
  // Format dates for display if passed as ISO strings
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <tr key={`${sem}-${year}-${start}`}>
      <td><strong>{sem}</strong></td>
      <td>{year}</td>
      <td>{formatDate(start)}</td>
      <td>{formatDate(end)}</td>
      <td>{groups ?? 0}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
      <td style={{ textAlign: 'right' }}>
        <button className="btn-secondary btn-sm" onClick={onEdit}>Edit</button>
      </td>
    </tr>
  );
}

export default function Semesters() {
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null); // null = Create Mode, object = Edit Mode

  // Form Fields State
  const [semesterType, setSemesterType] = useState('Fall');
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Active');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/semester', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSemesters(data);
      }
    } catch (err) {
      console.error("Failed to load semesters:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format ISO dates (YYYY-MM-DD) for <input type="date" />
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  // Open modal for CREATING a new semester
  const handleOpenCreateModal = () => {
    setEditingSemester(null);
    setSemesterType('Fall');
    setYear(new Date().getFullYear());
    setStartDate('');
    setEndDate('');
    setStatus('Active');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Open modal for EDITING an existing semester
  const handleOpenEditModal = (sem) => {
    setEditingSemester(sem);
    setSemesterType(sem.semesterType || sem.sem || 'Fall');
    setYear(sem.year);
    setStartDate(formatDateForInput(sem.startDate || sem.start));
    setEndDate(formatDateForInput(sem.endDate || sem.end));
    setStatus(sem.status || 'Active');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!startDate || !endDate) {
      setErrorMessage('Please provide both start and end dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMessage('End date must be after or equal to the start date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('token');
      const payload = {
        semesterType,
        year: parseInt(year, 10),
        startDate,
        endDate,
        status
      };

      const isEdit = !!editingSemester;
      const url = isEdit ? `/api/semester/${editingSemester.semesterId}` : '/api/semester';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        await fetchSemesters();
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.message || `Failed to ${isEdit ? 'update' : 'create'} semester.`);
      }
    } catch (err) {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="section-title" style={{ fontSize: '16px', fontWeight: 600 }}>Semester Management</div>
            </div>
            <button className="btn-primary" onClick={handleOpenCreateModal}>+ New Semester</button>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Year</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Groups</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        Loading semesters...
                      </td>
                    </tr>
                  ) : semesters.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        No semesters found. Click <strong>+ New Semester</strong> to create one.
                      </td>
                    </tr>
                  ) : (
                    semesters.map((sem) =>
                      semRow(
                        sem.semesterType || sem.sem,
                        sem.year,
                        sem.startDate || sem.start,
                        sem.endDate || sem.end,
                        sem.groupCount || sem.groups || 0,
                        sem.status,
                        () => handleOpenEditModal(sem)
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create / Edit Modal Popup */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-container">
                <div className="modal-header">
                  <div className="modal-title">
                    {editingSemester ? 'Edit Semester' : 'Create New Semester'}
                  </div>
                  <button className="modal-close-btn" onClick={handleCloseModal}>&times;</button>
                </div>

                {errorMessage && (
                  <div className="badge badge-danger" style={{ display: 'block', padding: '8px 12px', borderRadius: '6px', marginBottom: '14px' }}>
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Semester Term</label>
                    <select
                      className="form-select"
                      value={semesterType}
                      onChange={(e) => setSemesterType(e.target.value)}
                      required
                    >
                      <option value="Fall">Fall</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Year</label>
                    <input
                      type="number"
                      className="form-control"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      min="2000"
                      max="2100"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : editingSemester ? 'Update Semester' : 'Create Semester'}
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