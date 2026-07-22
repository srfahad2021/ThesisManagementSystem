import React from 'react';
const TopNavbar = ({ 
  activeRole = 'dept_admin', 
  onRoleChange, 
  pageTitle = 'dashboard', 
  breadcrumb = `Home / ${pageTitle}`
}) => {
  const roles = [
    { id: 'dept_admin', label: 'Dept Admin' },
    { id: 'student', label: 'Student' },
    { id: 'supervisor', label: 'Supervisor' },
    { id: 'coordinator', label: 'Coordinator' },
    { id: 'examiner', label: 'Examiner' },
    { id: 'super_admin', label: 'Super Admin' },
  ];

  return (
    <>
      {/* Embedded CSS Resets and Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Poppins:wght@500;600;700&display=swap');

        /* Force reset margins, padding, and layout constraints on parent elements */
        html, body, #root, #__next {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        :root {
          --primary: #FF6B6B;
          --primary-light: #FF8E72;
          --accent: #FFA07A;
          --bg: #F7F6F3;
          --bg-card: #FFFFFF;
          --sidebar-bg: #1F2937;
          --sidebar-text: #D1D5DB;
          --sidebar-active: #FF6B6B;
          --border: #E5E7EB;
          --text-primary: #1F2937;
          --text-secondary: #6B7280;
          --text-muted: #9CA3AF;
          --success: #22C55E;
          --warning: #F59E0B;
          --danger: #EF4444;
          --info: #3B82F6;
          --radius: 10px;
          --radius-sm: 6px;
          --shadow: 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
        }

        .topbar-wrapper * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .topbar-wrapper {
          font-family: 'DM Sans', sans-serif;
          position: fixed;
          top: 0;
          left: 240px; /* Offset by LeftNavbar width */
          right: 0;
          width: calc(100% - 240px);
          z-index: 9999;
        }

        .topbar {
          height: 56px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 16px;
          width: 100%;
        }

        .topbar-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: var(--text-primary);
        }

        .topbar-breadcrumb {
          font-size: 12px;
          color: var(--text-muted);
        }

        .topbar-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .role-switcher-container {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .role-pill {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid var(--border);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          color: var(--text-secondary);
          background: var(--bg-card);
          transition: all 0.15s;
          user-select: none;
        }

        .role-pill:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .role-pill.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }

        .icon-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all 0.15s;
        }

        .icon-btn svg {
          width: 18px;
          height: 18px;
        }

        .icon-btn:hover {
          background: var(--bg);
          color: var(--text-primary);
        }

        .notif-dot {
          position: relative;
        }

        .notif-dot::after {
          content: '3';
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--primary);
          color: #fff;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
      `}</style>

      {/* Navigation Topbar */}
      <div className="topbar-wrapper">
        <header className="topbar">
          <div>
            <div className="topbar-title" id="topbarTitle">{pageTitle}</div>
            <div className="topbar-breadcrumb" id="topbarBreadcrumb">{breadcrumb}</div>
          </div>

          <div className="topbar-right">
            

            {/* Notification Button */}
            <button className="icon-btn notif-dot" title="Notifications">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            {/* Settings Button */}
            <button className="icon-btn" title="Settings">
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
          </div>
        </header>
      </div>
    </>
  );
};

export default TopNavbar;