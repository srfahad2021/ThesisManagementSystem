import React, { useState } from 'react';

export default function UserCreatePopup({ isOpen, onClose, onSubmitSingle, onSubmitBulk }) {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'

  // Single User Form State
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

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitSingle) onSubmitSingle(formData);
    onClose();
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (onSubmitBulk && selectedFile) {
      onSubmitBulk(selectedFile);
    }
    onClose();
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
        zIndex: 1000,
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
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="e.g. SR Fahad"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username / University ID</label>
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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="e.g. fahad@iubat.edu"
                value={formData.email}
                onChange={handleInputChange}
                required
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
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Bulk File Import */}
        {activeTab === 'bulk' && (
          <form onSubmit={handleBulkSubmit}>
            <div className="form-group">
              <label className="form-label">Upload File (.csv, .xls, .xlsm)</label>
              <input
                type="file"
                className="form-control"
                accept=".csv, .xls, .xlsm, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                required
              />
              <div className="text-muted text-sm mt-16" style={{ marginTop: '6px' }}>
                Supported file types: <strong>.csv</strong>, <strong>.xls</strong>, <strong>.xlsm</strong>
              </div>
            </div>

            <div className="comment-box" style={{ marginTop: '16px' }}>
              <div className="comment-header">
                <span className="comment-author">Expected Columns:</span>
              </div>
              <div className="comment-text">
                Ensure your spreadsheet has the following column headers:
                <br />
                <code>Username, FullName, Email, Role, Semester</code>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={!selectedFile}>
                Upload & Import
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}