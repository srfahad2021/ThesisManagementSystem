import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style.css';

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
  maxWidth: '560px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
};

const getAuthConfig = () => {
  const token = sessionStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export default function CoordinatorExaminers() {
  const [boards, setBoards] = useState([]);
  const [eligibleExaminers, setEligibleExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [modalError, setModalError] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = getAuthConfig();
      const [boardsRes, examinersRes] = await Promise.all([
        axios.get('/api/board/active', config),
        axios.get('/api/board/eligible-examiners', config)
      ]);

      setBoards(boardsRes.data || []);
      setEligibleExaminers(examinersRes.data || []);
    } catch (err) {
      console.error('Error loading examiner management data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset pagination to page 1 whenever search query changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Filter boards based on board name / group name
  const filteredBoards = boards.filter((board) => {
    const boardName = board.name || `Board #${board.id}`;
    return boardName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination Calculations
  const totalEntries = filteredBoards.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const paginatedBoards = filteredBoards.slice(startIndex, endIndex);

  const handleOpenAssignModal = (board) => {
    setSelectedBoard(board);
    setSelectedUserId('');
    setModalError('');
  };

  const handleCloseModal = () => {
    setSelectedBoard(null);
    setSelectedUserId('');
    setModalError('');
  };

  const handleAddExaminer = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setModalError('Please select an examiner from the dropdown list.');
      return;
    }

    try {
      setAssigning(true);
      setModalError('');
      const config = getAuthConfig();

      const res = await axios.post(
        `/api/board/${selectedBoard.id}/members`,
        { userId: parseInt(selectedUserId, 10) },
        config
      );

      const addedMember = res.data;

      // Update state locally for real-time reactivity
      const updatedMembers = [
        ...(selectedBoard.members || []),
        {
          boardMemberId: addedMember.boardMemberId,
          userId: addedMember.userId,
          username: addedMember.username,
          fullName: addedMember.fullName
        }
      ];

      const updatedBoard = { ...selectedBoard, members: updatedMembers };

      setSelectedBoard(updatedBoard);
      setBoards((prevBoards) =>
        prevBoards.map((b) => (b.id === selectedBoard.id ? updatedBoard : b))
      );

      setSelectedUserId('');
    } catch (err) {
      console.error('Error assigning examiner:', err);
      setModalError(err.response?.data?.message || 'Failed to assign examiner.');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveExaminer = async (boardMemberId) => {
    if (!window.confirm('Remove this examiner from the board?')) return;

    try {
      const config = getAuthConfig();
      await axios.delete(`/api/board/members/${boardMemberId}`, config);

      const updatedMembers = selectedBoard.members.filter(
        (m) => m.boardMemberId !== boardMemberId
      );
      const updatedBoard = { ...selectedBoard, members: updatedMembers };

      setSelectedBoard(updatedBoard);
      setBoards((prevBoards) =>
        prevBoards.map((b) => (b.id === selectedBoard.id ? updatedBoard : b))
      );
    } catch (err) {
      console.error('Error removing examiner:', err);
      alert(err.response?.data?.message || 'Failed to remove examiner.');
    }
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div
            className="section-head"
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div className="section-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Assign Examiners to Active Boards
              </div>
            </div>

            {/* SEARCH BAR */}
            <div>
              <input
                type="text"
                className="form-control"
                placeholder="Search by group / board name..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  minWidth: '250px'
                }}
              />
            </div>
          </div>

          {loading ? (
            <p>Loading active boards...</p>
          ) : (
            <div className="card" style={{ padding: '16px' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Board ID</th>
                    <th style={{ padding: '12px' }}>Board Name</th>
                    <th style={{ padding: '12px' }}>Semester</th>
                    <th style={{ padding: '12px' }}>Assigned Examiners</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBoards.length > 0 ? (
                    paginatedBoards.map((board) => (
                      <tr key={board.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>#{board.id}</td>
                        <td style={{ padding: '12px' }}>{board.name || `Board #${board.id}`}</td>
                        <td style={{ padding: '12px' }}>{board.semesterName}</td>
                        <td style={{ padding: '12px' }}>
                          {board.members && board.members.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {board.members.map((m) => (
                                <span
                                  key={m.boardMemberId}
                                  style={{
                                    backgroundColor: '#e8f0fe',
                                    color: '#1a73e8',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                  }}
                                >
                                  {m.fullName || m.username}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#888', fontStyle: 'italic' }}>— Unassigned —</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '6px 12px' }}
                            onClick={() => handleOpenAssignModal(board)}
                          >
                            Assign Examiners
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                        No active boards found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* PAGINATION CONTROLS */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #eee'
                }}
              >
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Showing {totalEntries > 0 ? startIndex + 1 : 0}–{endIndex} of {totalEntries} entries
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-primary btn-sm"
                    disabled={currentPage === totalPages || totalEntries === 0}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ASSIGN EXAMINERS MODAL POPUP */}
          {selectedBoard && (
            <div className="modal-overlay" style={modalOverlayStyle}>
              <div className="modal-card" style={modalCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>
                    Manage Examiners - {selectedBoard.name || `Board #${selectedBoard.id}`}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                {modalError && (
                  <div style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>
                    {modalError}
                  </div>
                )}

                {/* CURRENT MEMBERS LIST */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Currently Assigned Examiners</h4>
                  {selectedBoard.members && selectedBoard.members.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {selectedBoard.members.map((m) => (
                        <li
                          key={m.boardMemberId}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            marginBottom: '6px'
                          }}
                        >
                          <div>
                            <strong>{m.fullName || m.username}</strong>
                            <span style={{ color: '#666', marginLeft: '8px', fontSize: '12px' }}>
                              (@{m.username})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExaminer(m.boardMemberId)}
                            style={{
                              color: '#d93025',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#888', fontSize: '14px' }}>No examiners assigned yet.</p>
                  )}
                </div>

                {/* ADD NEW EXAMINER FORM */}
                <form onSubmit={handleAddExaminer} style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                    Select Supervisor or Coordinator
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-control"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      style={{ flex: 1, padding: '8px' }}
                    >
                      <option value="">-- Choose Examiner --</option>
                      {eligibleExaminers.map((e) => (
                        <option key={e.userId} value={e.userId}>
                          {e.fullName ? `${e.fullName} (@${e.username}) [${e.role}]` : `@${e.username} [${e.role}]`}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-primary" disabled={assigning}>
                      {assigning ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </form>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    Done
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