import React, { useState, useEffect } from 'react';
import { roles, getPageLabel } from '../Information/RolesAndConfig.js';
import {icons} from '../Information/Icons.jsx';


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