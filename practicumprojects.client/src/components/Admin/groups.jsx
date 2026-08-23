import React, { useState, useEffect, useMemo } from 'react';
import '../style.css';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Form State
  const [studentId1, setStudentId1] = useState('');
  const [studentId2, setStudentId2] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch groups and users on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [groupsRes, usersRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/group`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/group/eligible-users`, { headers })
      ]);

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStudents(usersData.students || []);
        setSupervisors(usersData.supervisors || []);
      }
    } catch (err) {
      console.error("Failed to load group data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setStudentId1('');
    setStudentId2('');
    setSupervisorId('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentId1 && !studentId2) {
      setErrorMessage('Please select at least one student.');
      return;
    }

    if (studentId1 && studentId2 && studentId1 === studentId2) {
      setErrorMessage('Student 1 and Student 2 cannot be the same person.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/group`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId1: studentId1 ? parseInt(studentId1, 10) : null,
          studentId2: studentId2 ? parseInt(studentId2, 10) : null,
          supervisorId: supervisorId ? parseInt(supervisorId, 10) : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Failed to create group.');
      } else {
        setIsModalOpen(false);
        await fetchData(); // Refresh table list
      }
    } catch (err) {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${groupName}"?`);
    if (!isConfirmed) return;

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/group/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchData(); // Refresh table after deletion
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.message || 'Failed to delete group.');
      }
    } catch (err) {
      console.error("Failed to delete group:", err);
      alert('A network error occurred while deleting.');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'INITIALIZED':
        return <span className="badge badge-info">Initialized</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-warning">In Progress</span>;
      case 'COMPLETED':
        return <span className="badge badge-success">Completed</span>;
      case 'ARCHIVED':
        return <span className="badge badge-neutral">Archived</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const formatMembers = (s1, s2) => {
    const list = [];
    if (s1) list.push(s1.fullName || s1.username);
    if (s2) list.push(s2.fullName || s2.username);
    return list.length > 0 ? list.join(', ') : 'Unassigned';
  };

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      const groupName = (g.groupName || '').toLowerCase();
      const student1 = (g.student1?.fullName || g.student1?.username || '').toLowerCase();
      const student2 = (g.student2?.fullName || g.student2?.username || '').toLowerCase();
      const supervisor = (g.supervisor?.fullName || g.supervisor?.username || '').toLowerCase();
      const status = (g.status || '').toLowerCase();

      return (
        groupName.includes(query) ||
        student1.includes(query) ||
        student2.includes(query) ||
        supervisor.includes(query) ||
        status.includes(query)
      );
    });
  }, [groups, searchQuery]);

  // Reset page index when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination calculations
  const totalGroups = filteredGroups.length;
  const totalPages = Math.ceil(totalGroups / itemsPerPage) || 1;
  const startIdx = totalGroups === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalGroups);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(start, start + itemsPerPage);
  }, [filteredGroups, currentPage, itemsPerPage]);

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div className="section-title" style={{ fontSize: '16px', fontWeight: 600 }}>Thesis Groups</div>
              <div className="text-muted text-sm">
                Showing {startIdx}–{endIdx} of {totalGroups} group(s)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Bar Input */}
              <input
                type="text"
                className="form-control"
                placeholder="Search groups, members, supervisor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '260px', padding: '6px 12px', fontSize: '14px' }}
              />

              <button className="btn-primary" onClick={handleOpenModal}>+ Create Group</button>
            </div>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Members</th>
                    <th>Supervisor</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        Loading groups...
                      </td>
                    </tr>
                  ) : paginatedGroups.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        {searchQuery ? (
                          <>No groups matching "<strong>{searchQuery}</strong>"</>
                        ) : (
                          <>No groups found. Click <strong>+ Create Group</strong> to create one.</>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedGroups.map((g) => (
                      <tr key={g.groupId}>
                        <td><strong>{g.groupName}</strong></td>
                        <td>{formatMembers(g.student1, g.student2)}</td>
                        <td>{g.supervisor ? (g.supervisor.fullName || g.supervisor.username) : 'Unassigned'}</td>
                        <td>{renderStatusBadge(g.status)}</td>
                        <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn-secondary btn-sm" 
                              style={{ 
                                color: 'var(--danger)', 
                                borderColor: 'var(--danger)' 
                              }}
                            onClick={() => handleDeleteGroup(g.groupId, g.groupName)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <div className="text-muted text-sm">
              Showing {startIdx}–{endIdx} of {totalGroups} groups
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
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
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>

          {/* Modal Popup */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-container">
                <div className="modal-header">
                  <div className="modal-title">Create Thesis Group</div>
                  <button className="modal-close-btn" onClick={handleCloseModal}>&times;</button>
                </div>

                {errorMessage && (
                  <div className="badge badge-danger" style={{ display: 'block', padding: '8px 12px', borderRadius: '6px' }}>
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleCreateGroup}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Student 1</label>
                    <select
                      className="form-select"
                      value={studentId1}
                      onChange={(e) => setStudentId1(e.target.value)}
                    >
                      <option value="">-- Select Student 1 --</option>
                      {students.map((s) => (
                        <option key={s.userId} value={s.userId}>
                          {s.fullName} ({s.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Student 2 (Optional)</label>
                    <select
                      className="form-select"
                      value={studentId2}
                      onChange={(e) => setStudentId2(e.target.value)}
                    >
                      <option value="">-- Select Student 2 --</option>
                      {students.map((s) => (
                        <option key={s.userId} value={s.userId}>
                          {s.fullName} ({s.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Supervisor</label>
                    <select
                      className="form-select"
                      value={supervisorId}
                      onChange={(e) => setSupervisorId(e.target.value)}
                    >
                      <option value="">-- Select Supervisor --</option>
                      {supervisors.map((sup) => (
                        <option key={sup.userId} value={sup.userId}>
                          {sup.fullName} ({sup.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Group'}
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