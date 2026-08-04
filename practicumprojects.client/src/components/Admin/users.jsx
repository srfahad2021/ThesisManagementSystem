import React, { useState, useEffect } from 'react';
import '../style.css';
import { miniStat, userRow } from '../script.jsx';
import UserCreatePopup from './userCreatePopup.jsx';
import UserEditPopup from './UserEditPopup.jsx';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');

  // Modal & Pagination State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Helper to fetch authorization token safely
  const getAuthToken = () => sessionStorage.getItem('token') || '';

  // Role Enum Map
  const roleMap = {
  1: 'Student',
  0: 'Supervisor',
  2: 'Coordinator',
  3: 'Examiner',
  4: 'Admin',
  'STUDENT': 'Student',
  'SUPERVISOR': 'Supervisor',
  'COORDINATOR': 'Coordinator',
  'EXAMINER': 'Examiner',
  'ADMIN': 'Admin',
  'CHAIRMAN': 'Chairman'
};

  const formatRoleDisplay = (roleInput) => {
    if (roleInput === undefined || roleInput === null || roleInput === '') {
      return 'N/A';
    }

    const numericRole = Number(roleInput);
    if (!isNaN(numericRole) && roleMap.hasOwnProperty(numericRole)) {
      return roleMap[numericRole];
    }

    if (typeof roleInput === 'string') {
      const cleanRole = roleInput.trim();
      if (!cleanRole) return 'N/A';
      return cleanRole.charAt(0).toUpperCase() + cleanRole.slice(1).toLowerCase();
    }

    return 'N/A';
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const response = await fetch('/api/user', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      let fetchedList = [];
      if (Array.isArray(data)) {
        fetchedList = data;
      } else if (Array.isArray(data.users)) {
        fetchedList = data.users;
      } else if (Array.isArray(data.data)) {
        fetchedList = data.data;
      }

      setUsers(fetchedList);
    } catch (err) {
      setError(err.message || 'An error occurred while loading users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle disabling/enabling a user
  const handleToggleDisable = async (user) => {
  const isCurrentlyDisabled = user.isActive === false || user.status === 'Disabled';
  const actionText = isCurrentlyDisabled ? 'enable' : 'disable';

  if (!window.confirm(`Are you sure you want to ${actionText} user "${user.username}"?`)) {
    return;
  }

  // Explicitly check userId returned from the API
  const userId = user.userId || user.id || user._id;
  const token = getAuthToken();
  const newIsActive = isCurrentlyDisabled;

  try {
    const response = await fetch(`/api/user/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        isActive: newIsActive
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update status (${response.status})`);
    }

    // Refresh list from server on success
    fetchUsers();
  } catch (err) {
    alert(`Error trying to ${actionText} user: ` + err.message);
  }
};

  // Safe user array
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((u) => {
    const term = searchTerm.toLowerCase();
    const fullName = u?.fullName ? String(u.fullName).toLowerCase() : '';
    const username = u?.username ? String(u.username).toLowerCase() : '';

    const matchesSearch = username.includes(term) || fullName.includes(term);

    const userRoleDisplay = formatRoleDisplay(u?.role);
    const matchesRole =
      selectedRole === 'All Roles' ||
      userRoleDisplay.toUpperCase() === selectedRole.toUpperCase();

    return matchesSearch && matchesRole;
  });

  const countRole = (roleName) =>
    safeUsers.filter(
      (u) => formatRoleDisplay(u?.role).toUpperCase() === roleName.toUpperCase()
    ).length;

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startIdx = totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalUsers);

  // Helper to safely get status display
  const getUserStatus = (u) => {
    if (u?.status) return u.status;
    if (u?.isActive === false) return 'Disabled';
    return 'Active';
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '16px' }}>User Accounts</div>
              <div className="text-muted text-sm">Manage all system users for IUBAT CSE Department</div>
            </div>
            <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              + Create Account
            </button>
          </div>

          {/* Dynamic Mini Stats */}
          <div className="grid-4" style={{ marginBottom: '20px' }}>
            {miniStat('Students', countRole('Student').toString())}
            {miniStat('Supervisors', countRole('Supervisor').toString())}
            {miniStat('Coordinators', countRole('Coordinator').toString())}
            {miniStat('Examiners', countRole('Examiner').toString())}
          </div>

          <div className="card" style={{ marginBottom: '16px' }}>
            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <div className="search-bar">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="form-control"
                  placeholder="Search by name or ID…"
                  style={{ width: '240px' }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <select
                className="form-control"
                style={{ width: '160px' }}
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Roles">All Roles</option>
                <option value="Student">Student</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Coordinator">Coordinator</option>
                <option value="Examiner">Examiner</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Table Wrap */}
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                        Loading users...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--danger)', padding: '24px' }}>
                        {error}
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u, idx) => (
                      <React.Fragment key={u.id || u._id || u.username || idx}>
                        {userRow(
                          u.username,
                          u.fullName || '-',
                          formatRoleDisplay(u.role),
                          u.email || '-',
                          getUserStatus(u),
                          u.lastLogin || 'N/A',
                          () => setEditingUser(u),
                          () => handleToggleDisable(u)
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <div className="text-muted text-sm">
                Showing {startIdx}–{endIdx} of {totalUsers} users
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
          </div>

          {/* User Create Modal */}
          <UserCreatePopup
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => fetchUsers()}
          />

          {/* User Edit Modal */}
          <UserEditPopup
            isOpen={Boolean(editingUser)}
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSuccess={() => fetchUsers()}
          />
        </div>
      </div>
    </div>
  );
}