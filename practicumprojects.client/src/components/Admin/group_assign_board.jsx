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

export default function CoordinatorGroups() {
  const [boards, setBoards] = useState([]);
  const [unassignedGroups, setUnassignedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal specific states
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [assignedBoardGroups, setAssignedBoardGroups] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [modalError, setModalError] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const config = getAuthConfig();
      const [boardsRes, groupsRes] = await Promise.all([
        axios.get('/api/board/active-groups-summary', config),
        axios.get('/api/board/unassigned-groups', config)
      ]);

      setBoards(boardsRes.data || []);
      setUnassignedGroups(groupsRes.data || []);
    } catch (err) {
      console.error('Error fetching board groups data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = async (board) => {
    setSelectedBoard(board);
    setSelectedGroupId('');
    setModalError('');
    setModalLoading(true);

    try {
      const config = getAuthConfig();
      const res = await axios.get(`/api/board/${board.id}/groups`, config);
      setAssignedBoardGroups(res.data || []);
    } catch (err) {
      console.error('Error fetching board assigned groups:', err);
      setModalError('Failed to load current groups for this board.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedBoard(null);
    setAssignedBoardGroups([]);
    setSelectedGroupId('');
    setModalError('');
  };

  const handleAddGroupToBoard = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      setModalError('Please select a group from the list.');
      return;
    }

    try {
      setAssigning(true);
      setModalError('');
      const config = getAuthConfig();

      const parsedGroupId = parseInt(selectedGroupId, 10);

      const res = await axios.post(
        `/api/board/${selectedBoard.id}/groups`,
        { groupId: parsedGroupId },
        config
      );

      const newAssignment = res.data;

      // 1. Update assigned groups inside modal
      setAssignedBoardGroups((prev) => [
        ...prev,
        {
          boardGroupId: newAssignment.boardGroupId,
          groupId: newAssignment.groupId,
          groupName: newAssignment.groupName
        }
      ]);

      // 2. Remove group from unassigned dropdown list (1 group = 1 board constraint)
      setUnassignedGroups((prev) =>
        prev.filter((g) => g.groupId !== parsedGroupId)
      );

      setSelectedGroupId('');
    } catch (err) {
      console.error('Error assigning group:', err);
      setModalError(err.response?.data?.message || 'Failed to assign group.');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveGroupFromBoard = async (boardGroupId, groupId) => {
    if (!window.confirm('Are you sure you want to remove this group from the board?')) return;

    try {
      const config = getAuthConfig();
      await axios.delete(`/api/board/groups/${boardGroupId}`, config);

      // Find the removed group details to put back into unassigned pool
      const removedItem = assignedBoardGroups.find((g) => g.boardGroupId === boardGroupId);

      // 1. Remove from modal's current list
      setAssignedBoardGroups((prev) =>
        prev.filter((g) => g.boardGroupId !== boardGroupId)
      );

      // 2. Put back into unassigned dropdown list
      if (removedItem) {
        setUnassignedGroups((prev) => [
          ...prev,
          { groupId: removedItem.groupId, groupName: removedItem.groupName }
        ]);
      }
    } catch (err) {
      console.error('Error removing group:', err);
      alert(err.response?.data?.message || 'Failed to unassign group.');
    }
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Assign Groups to Active Boards
              </div>
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
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.length > 0 ? (
                    boards.map((board) => (
                      <tr key={board.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>#{board.id}</td>
                        <td style={{ padding: '12px' }}>{board.name || `Board #${board.id}`}</td>
                        <td style={{ padding: '12px' }}>{board.semesterName}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '6px 16px' }}
                            onClick={() => handleOpenAssignModal(board)}
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>
                        No active boards found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ASSIGN GROUPS MODAL POPUP */}
          {selectedBoard && (
            <div className="modal-overlay" style={modalOverlayStyle}>
              <div className="modal-card" style={modalCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>
                    Assigned Groups - {selectedBoard.name || `Board #${selectedBoard.id}`}
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

                {/* CURRENT ASSIGNED GROUPS LIST */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Currently Assigned Groups</h4>
                  {modalLoading ? (
                    <p style={{ fontSize: '14px', color: '#666' }}>Loading groups...</p>
                  ) : assignedBoardGroups.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {assignedBoardGroups.map((g) => (
                        <li
                          key={g.boardGroupId}
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
                            <strong>{g.groupName}</strong>
                            <span style={{ color: '#666', marginLeft: '8px', fontSize: '12px' }}>
                              (ID: {g.groupId})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGroupFromBoard(g.boardGroupId, g.groupId)}
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
                    <p style={{ color: '#888', fontSize: '14px' }}>No groups assigned to this board yet.</p>
                  )}
                </div>

                {/* ADD NEW GROUP FORM */}
                <form onSubmit={handleAddGroupToBoard} style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                    Select Unassigned Group
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-control"
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      style={{ flex: 1, padding: '8px' }}
                    >
                      <option value="">-- Choose Group --</option>
                      {unassignedGroups.map((group) => (
                        <option key={group.groupId} value={group.groupId}>
                          {group.groupName} (ID: {group.groupId})
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