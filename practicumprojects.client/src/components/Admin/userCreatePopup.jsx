import React, { useState } from 'react';

export default function UserCreatePopup({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Single User Form State (Only username is required)
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'Student',
    semester: 'Spring 2026'
  });

  // Bulk Upload Form State
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
  // Handle Single User Creation API call
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

    // Role mapping
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
      const response = await fetch('/api/auth/create-user', {
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

  // Handle Bulk User Import API call
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setErrorMessage('');
    setLoading(true);

    const bodyData = new FormData();
    bodyData.append('file', selectedFile);

    try {
      const response = await fetch('/api/auth/bulk-create', {
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div className="section-title">Create User Account</div>
            <div className="text-muted text-sm">Add a single user or import users via file upload</div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: '18px', padding: '4px 8px' }}>
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="comment-box" style={{ borderColor: 'var(--danger)', background: '#FEE2E2', marginBottom: '16px' }}>
            <div className="comment-text" style={{ color: 'var(--danger)' }}>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
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

        {/* Tab 1: Single User Form */}
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

            {/* Actions */}
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

        {/* Tab 2: Bulk File Import */}
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

            {/* Actions */}
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