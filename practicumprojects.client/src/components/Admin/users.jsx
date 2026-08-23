// practicumprojects.client\src\components\Admin\users.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../style.css';
import { miniStat } from '../script.jsx';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bulk Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');

  // Modal & Pagination State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
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

  // Handle Bulk Uploading via CSV / Excel
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/bulk-create`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to bulk import users.');
      }

      let statusMsg = `${result.createdCount || 0} user(s) imported successfully.`;
      if (result.errors && result.errors.length > 0) {
        statusMsg += ` (${result.errors.length} skipped due to errors)`;
      }

      setUploadMessage({ type: 'success', text: statusMsg, details: result.errors });
      fetchUsers();
    } catch (err) {
      setUploadMessage({ type: 'error', text: err.message || 'An error occurred during bulk import.' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle resetting a user password
  const handleResetPassword = async (user) => {
    const defaultNewPassword = `${user.username}@123`;
    if (!window.confirm(`Reset password for "${user.username}" to default password "${defaultNewPassword}"?`)) {
      return;
    }

    const userId = user.userId || user.id || user._id;
    const token = getAuthToken();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          newPassword: defaultNewPassword
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || `Failed to reset password (${response.status})`);
      }

      alert(`Password for ${user.username} successfully reset to: ${defaultNewPassword}`);
    } catch (err) {
      alert(`Error resetting password: ` + err.message);
    }
  };

  // Handle disabling/enabling a user
  const handleToggleDisable = async (user) => {
    const isCurrentlyDisabled = user.isActive === false || user.status === 'Disabled';
    const actionText = isCurrentlyDisabled ? 'enable' : 'disable';

    if (!window.confirm(`Are you sure you want to ${actionText} user "${user.username}"?`)) {
      return;
    }

    const userId = user.userId || user.id || user._id;
    const token = getAuthToken();
    const newIsActive = isCurrentlyDisabled;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${userId}/status`, {
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv, .xls, .xlsx, .xlsm"
                onChange={handleFileUpload}
              />
              <button
                className="btn-secondary"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Importing...' : '↑ Import CSV/Excel'}
              </button>
              <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                + Create Account
              </button>
            </div>
          </div>

          {/* Bulk Upload Notification Banner */}
          {uploadMessage && (
            <div
              style={{
                padding: '12px 16px',
                marginBottom: '16px',
                borderRadius: '6px',
                backgroundColor: uploadMessage.type === 'success' ? '#d1e7dd' : '#f8d7da',
                color: uploadMessage.type === 'success' ? '#0f5132' : '#842029',
                border: `1px solid ${uploadMessage.type === 'success' ? '#badbcc' : '#f5c2c7'}`
              }}
            >
              <div style={{ fontWeight: '600' }}>{uploadMessage.text}</div>
              {uploadMessage.details && uploadMessage.details.length > 0 && (
                <ul style={{ margin: '8px 0 0 16px', padding: 0, fontSize: '13px' }}>
                  {uploadMessage.details.map((errDetail, i) => (
                    <li key={i}>{errDetail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

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
                    paginatedUsers.map((u, idx) => {
                      const status = getUserStatus(u);
                      return (
                        <tr key={u.userId || u.id || u.username || idx}>
                          <td style={{ fontWeight: '600' }}>{u.username}</td>
                          <td>{u.fullName || (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : '-')}</td>
                          <td>
                            <span className="badge badge-info">{formatRoleDisplay(u.role)}</span>
                          </td>
                          <td>{u.email || '-'}</td>
                          <td>
                            <span className={`badge ${status === 'Disabled' ? 'badge-danger' : 'badge-success'}`}>
                              {status}
                            </span>
                          </td>
                          <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn-secondary btn-sm"
                                onClick={() => setEditingUser(u)}
                                title="Edit User"
                              >
                                Edit
                              </button>
                              <button
                                className="btn-primary btn-sm"
                                onClick={() => handleResetPassword(u)}
                                title="Reset Password"
                              >
                                Reset Password
                              </button>
                              <button
                                className={`btn-secondary btn-sm`}
                                style={{ 
                                  color: status === 'Disabled' ? 'var(--success, #10B981)' : 'var(--danger)', 
                                  borderColor: status === 'Disabled' ? 'var(--success, #10B981)' : 'var(--danger)' 
                                }}
                                onClick={() => handleToggleDisable(u)}
                              >
                                {status === 'Disabled' ? 'Enable' : 'Disable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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

// =========================================================================
// Embedded Component: UserCreatePopup
// =========================================================================
function UserCreatePopup({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'Student',
    semester: 'Spring 2026'
  });

  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getAuthToken = () => sessionStorage.getItem('token');

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    let firstName = '';
    let lastName = '';
    if (formData.fullName.trim()) {
      const parts = formData.fullName.trim().split(' ');
      firstName = parts[0];
      if (parts.length > 1) lastName = parts.slice(1).join(' ');
    }

    const roleMapping = {
      Student: 'STUDENT',
      Supervisor: 'SUPERVISOR',
      Coordinator: 'COORDINATOR',
      Examiner: 'EXAMINER'
    };

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim() || null,
      firstName: firstName || null,
      lastName: lastName || null,
      role: roleMapping[formData.role] || 'STUDENT'
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setErrorMessage('');
    setLoading(true);

    const bodyData = new FormData();
    bodyData.append('file', selectedFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/bulk-create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: bodyData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process bulk upload');
      }

      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div className="card" style={{ width: '520px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div className="section-title">Create User Account</div>
            <div className="text-muted text-sm">Add a single user or import users via file upload</div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: '18px', padding: '4px 8px' }}>
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="comment-box" style={{ borderColor: 'var(--danger)', background: '#FEE2E2', marginBottom: '16px' }}>
            <div className="comment-text" style={{ color: 'var(--danger)' }}>
              {errorMessage}
            </div>
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            Single Account
          </button>
          <button
            className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            Bulk Upload (CSV / Excel)
          </button>
        </div>

        {activeTab === 'single' && (
          <form onSubmit={handleSingleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Username / University ID <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="e.g. 22303266"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name (Optional)</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="e.g. SR Fahad"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="e.g. fahad@iubat.edu"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="Student">Student</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Examiner">Examiner</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester</label>
                <select
                  name="semester"
                  className="form-control"
                  value={formData.semester}
                  onChange={handleInputChange}
                >
                  <option value="Spring 2026">Spring 2026</option>
                  <option value="Fall 2025">Fall 2025</option>
                  <option value="Summer 2025">Summer 2025</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'bulk' && (
          <form onSubmit={handleBulkSubmit}>
            <div className="form-group">
              <label className="form-label">Upload File (.csv, .xls, .xlsm, .xlsx)</label>
              <input
                type="file"
                className="form-control"
                accept=".csv, .xls, .xlsm, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                required
              />
              <div className="text-muted text-sm mt-16" style={{ marginTop: '6px' }}>
                Supported formats: <strong>.csv</strong>, <strong>.xls</strong>, <strong>.xlsx</strong>, <strong>.xlsm</strong>
              </div>
            </div>

            <div className="comment-box" style={{ marginTop: '16px' }}>
              <div className="comment-header">
                <span className="comment-author">Expected Spreadsheet Headers:</span>
              </div>
              <div className="comment-text">
                Only <strong>Username</strong> and <strong>Role</strong> is required per row:
                <br />
                <code>Username, FullName, Email, Role, Password</code>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={!selectedFile || loading}>
                {loading ? 'Uploading...' : 'Upload & Import'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// Embedded Component: UserEditPopup
// =========================================================================
function UserEditPopup({ isOpen, user, onClose, onSuccess }) {
  const roleToEnumString = {
    '1': 'STUDENT',
    '0': 'SUPERVISOR',
    '2': 'COORDINATOR',
    '3': 'EXAMINER',
    '4': 'ADMIN'
  };
  const enumToRoleCode = {
    'STUDENT': '1',
    'SUPERVISOR': '0',
    'COORDINATOR': '2',
    'EXAMINER': '3',
    'ADMIN': '4'
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '1'
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      let roleCode = '1';
      if (user.role !== undefined && user.role !== null) {
        const roleStr = String(user.role).toUpperCase();
        roleCode = enumToRoleCode[roleStr] || String(user.role);
      }

      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        role: roleCode
      });
      setErrorMessage('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const token = sessionStorage.getItem('token') || '';
    const userId = user.userId || user.id || user._id;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          role: roleToEnumString[formData.role] || 'STUDENT'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update user (${response.status})`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while updating the user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-card" style={modalCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Edit User Details</h3>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6B7280' }}
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div style={{ padding: '10px', marginBottom: '16px', borderRadius: '6px', background: '#FEE2E2', color: '#DC2626', fontSize: '13px' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Username <span style={{ fontSize: '11px', color: '#9CA3AF' }}>(Cannot be modified)</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={user.username || ''}
              disabled
              style={{ width: '100%', backgroundColor: '#F3F4F6', cursor: 'not-allowed', color: '#6B7280' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="user@iubat.edu"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Role
            </label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              <option value="1">Student</option>
              <option value="0">Supervisor</option>
              <option value="2">Coordinator</option>
              <option value="3">Examiner</option>
              <option value="4">Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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