import React, { useState, useEffect } from 'react';
import { roles, getPageLabel } from '../Information/RolesAndConfig.js';
// ════════════════════ ICON HELPERS ════════════════════
const icons = {
  homeIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  chartIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  userIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  groupIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  calIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  topicIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  progressIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  docIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  attendIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  reportIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  auditIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  cmsIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  meetingIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  evalIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  assignIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  aiIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2M9 9h6" />
    </svg>
  ),
  univIcon: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
};


export default function LeftNavbar({ currentRole, user, onPageChange }) {
  const [currentPage, setCurrentPage] = useState('');
  // Grab active role configuration directly from imported roles
  const roleData = roles[currentRole] || roles.dept_admin;

  // 1. Auto-inject Google Fonts dynamically into document head
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // 2. Reset active page to first menu item whenever currentRole changes
  useEffect(() => {
    const firstPage = roleData.nav[0]?.items[0]?.id || '';
    setCurrentPage(firstPage);
    
    // CONSISTENT OBJECT PAYLOAD
    if (onPageChange) {
      onPageChange({ pageId: firstPage, role: currentRole });
    }
  }, [currentRole]);

  // 3. Handle item clicks
  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
    if (onPageChange) {
      onPageChange({ pageId, role: currentRole });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        /* Reset default margins/paddings so it sticks to the absolute top-left edge */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
        }

        :root {
          --primary: #FF6B6B;
          --sidebar-bg: #1F2937;
          --sidebar-text: #D1D5DB;
          --text-muted: #9CA3AF;
          --radius-sm: 6px;
        }

        .sidebar {
          font-family: 'Poppins', sans-serif !important;
          width: 240px; 
          min-width: 240px; 
          background: var(--sidebar-bg);
          display: flex; 
          flex-direction: column; 
          overflow-y: auto; 
          z-index: 10;
          height: 100vh;
          position: fixed; /* Ensures sticky positioning to top-left edge */
          top: 0;
          left: 0;
        }

        .sidebar-logo {
          ppadding: 20px 20px 16px; 
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; 
          align-items: center; 
          gap: 10px;
          margin-top:10px;
        }

        .logo-mark {
          width: 32px; 
          height: 32px; 
          background: var(--primary); 
          border-radius: 8px;
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-family: 'Poppins', sans-serif !important; 
          font-weight: 700; 
          font-size: 14px; 
          color: #fff;
        }

        .logo-text { 
          font-family: 'Poppins', sans-serif !important; 
          font-weight: 600; 
          font-size: 14px; 
          color: #fff; 
          line-height: 1.2; 
        }

        .logo-sub { 
          font-size: 10px; 
          color: var(--text-muted); 
          font-weight: 400; 
        }

        .sidebar-role {
          margin: 12px 16px 8px; 
          padding: 8px 10px; 
          background: rgba(255,107,107,0.12);
          border-radius: var(--radius-sm); 
          font-size: 11px; 
          font-weight: 500;
          color: var(--primary); 
          letter-spacing: 0.5px; 
          text-transform: uppercase;
        }

        .sidebar-section { 
          padding: 8px 16px 4px; 
          font-size: 10px; 
          color: var(--text-muted); 
          font-weight: 600; 
          letter-spacing: 1px; 
          text-align:left;
          text-transform: uppercase; 
          margin-top: 8px; 
        }

        .sidebar-item {
          display: flex; 
          align-items: center; 
          gap: 10px; 
          padding: 9px 16px 9px 20px;
          color: var(--sidebar-text); 
          cursor: pointer; 
          border-radius: 0;
          font-size: 13px; 
          font-weight: 400; 
          transition: all 0.15s;
          border-left: 3px solid transparent; 
          text-decoration: none;
        }

        .sidebar-item:hover { 
          background: rgba(255,255,255,0.06); 
          color: #fff; 
        }

        .sidebar-item.active { 
          background: rgba(255,107,107,0.12); 
          color: var(--primary); 
          border-left-color: var(--primary); 
          font-weight: 500; 
        }

        .sidebar-item svg { 
          width: 16px; 
          height: 16px; 
          opacity: 0.7; 
          flex-shrink: 0; 
        }

        .sidebar-item.active svg { 
          opacity: 1; 
        }

        .sidebar-badge { 
          margin-left: auto; 
          background: var(--primary); 
          color: #fff; 
          font-size: 10px; 
          padding: 1px 6px; 
          border-radius: 20px; 
          font-weight: 600; 
        }

        .sidebar-footer { 
          margin-top: auto; 
          padding: 16px; 
          border-top: 1px solid rgba(255,255,255,0.06); 
        }

        .user-chip { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          cursor: pointer; 
        }

        .avatar { 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: var(--primary); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-family: 'Poppins', sans-serif !important; 
          font-weight: 600; 
          font-size: 12px; 
          color: #fff; 
          flex-shrink: 0; 
        }

        .user-name { 
          font-size: 13px; 
          color: #fff; 
          font-weight: 500; 
        }

        .user-email { 
          font-size: 11px; 
          color: var(--text-muted); 
        }
      `}</style>

      <aside className="sidebar">
        {/* Sidebar Header / Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">TMP</div>
          <div>
            <div className="logo-text">TMP</div>
            <div className="logo-sub">Thesis Management Platform</div>
          </div>
        </div>

        {/* Dynamic Role Title */}
        <div className="sidebar-role" id="sidebarRole">
          {roleData.label}
        </div>

        {/* Dynamic Nav Items Container */}
        <nav id="sidebarNav">
          {roleData.nav.map((section, sIndex) => (
            <React.Fragment key={sIndex}>
              <div className="sidebar-section">{section.section}</div>
              {section.items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <a
                    key={item.id}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.id)}
                    id={`nav_${item.id}`}
                  >
                    {item.icon()}
                    {item.label}
                    {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                  </a>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Sidebar Footer User Profile */}
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar" id="sidebarUserAvatar">
              {roleData.initials}
            </div>
            <div>
              <div className="user-name" id="sidebarUserName">
                {user?.username || user?.Username || 'Loading...'}
              </div>
              <div className="user-email" id="sidebarUserOrg">
                {roleData.org}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}