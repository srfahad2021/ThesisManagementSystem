import React, { useState, useEffect } from 'react';
import './topnavbar.css';

/* --- Edit Profile Modal Component --- */
function UserEditPopup({ isOpen, user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Re-sync form fields whenever user object changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullName: user.fullName || user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''),
        email: user.email || '',
      });
      setErrorMessage('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const token = sessionStorage.getItem('token');
    const userId = user.userId || user.id || user._id;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/editprofile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update profile (${response.status})`);
      }

      // Read response payload if backend returns updated user
      const responseData = await response.json().catch(() => null);

      // Create updated user state
      const updatedUser = responseData || {
        ...user,
        fullName: formData.fullName,
        firstName: formData.fullName.split(' ')[0] || formData.fullName,
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        email: formData.email
      };

      // Notify parent component to update state & local/session storage
      if (onSuccess) {
        onSuccess(updatedUser);
      }

      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while updating profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Edit Profile</h3>
          <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
        </div>

        {errorMessage && <div className="error-banner">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Username <span className="form-hint">(Cannot be modified)</span>
            </label>
            <input type="text" value={user.username || ''} disabled className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="user@iubat.edu"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group-lg">
            <label className="form-label">
              Role <span className="form-hint">(Cannot be modified)</span>
            </label>
            <input type="text" value={user.role || ''} disabled className="form-control" />
          </div>

          <div className="modal-actions">
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

/* --- Password Change Modal Component --- */
function PasswordChangePopup({ isOpen, user, onClose, onSuccess }) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const token = sessionStorage.getItem('token') || '';
    const userId = user.userId || user.id || user._id;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${userId}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to change password (${response.status})`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while updating the password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Change Password</h3>
          <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
        </div>

        {errorMessage && <div className="error-banner">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              placeholder="Enter current password"
              value={passwordData.currentPassword}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={passwordData.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="form-control"
            />
          </div>

          <div className="form-group-lg">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter new password"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --- Main TopNavbar Component --- */
const TopNavbar = ({ 
  user,
  onRoleChange, 
  pageTitle = 'Dashboard', 
  breadcrumb = `Home / ${pageTitle}`,
  onLogout,
  onUserUpdated
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  if(!user){
    return null;
  }
  const activeRole = user?.role;

  return (
    <>
      <div className="topbar-wrapper">
        <header className="topbar">
          <div>
            <div className="topbar-title" id="topbarTitle">{pageTitle}</div>
            <div className="topbar-breadcrumb" id="topbarBreadcrumb">{breadcrumb}</div>
          </div>

          <div className="topbar-right">
            {user && (
              <div className="user-badge">
                <span>{<user className="first"></user> ? `${user.firstName + " " + user.lastName}` : user.username}</span>
                <span className="role-tag">{activeRole}</span>
              </div>
            )}

            {/* Settings Menu Dropdown */}
            <div className="settings-menu-container">
              <button 
                className="icon-btn" 
                title="Settings"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="settings-dropdown">
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsEditOpen(true);
                    }}
                  >
                    Edit Profile
                  </button>
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsPasswordOpen(true);
                    }}
                  >
                    Change Password
                  </button>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button className="logout-btn" title="Sign Out" onClick={onLogout}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>
      </div>

      <UserEditPopup 
        isOpen={isEditOpen} 
        user={user} 
        onClose={() => setIsEditOpen(false)} 
        onSuccess={onUserUpdated} 
      />

      <PasswordChangePopup 
        isOpen={isPasswordOpen} 
        user={user} 
        onClose={() => setIsPasswordOpen(false)} 
        onSuccess={() => alert('Password updated successfully!')} 
      />
    </>
  );
};

export default TopNavbar;