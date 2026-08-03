import React, { useState, useEffect } from 'react';



export default function UserEditPopup({ isOpen, user, onClose, onSuccess }) {

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
    role: '1' // default numeric string
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Populate form values when user changes
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
    const userId = user.userId || user.id || user._id;;

    try {
      const response = await fetch(`/api/user/${userId}`, {
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
          {/* Read-Only Username */}
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

          {/* Full Name */}
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

          {/* Email */}
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

          {/* Role Selection */}
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

          {/* Actions */}
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

// Basic modal popup styles matching existing theme
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