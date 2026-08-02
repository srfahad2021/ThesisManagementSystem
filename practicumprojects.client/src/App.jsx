import React, { useState, useEffect } from 'react';
import LeftNavbar from './components/LeftNavbar.jsx';
import TopNavbar from './components/TopNavbar.jsx';
import DynamicPageShower from './components/DynamicPageShower.jsx';
import { getPageLabel } from './Information/RolesAndConfig.js';

export default function App({ page = 'dashboard' }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [activeRole, setActiveRole] = useState(() => {
        return user?.role || user?.Role || 'ADMIN';
    });

    const [currentPage, setCurrentPage] = useState(page);

    useEffect(() => {
        if (user?.role || user?.Role) {
            setActiveRole(user.role || user.Role);
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
        window.location.href = '/signin';
    };

    const pageTitle = getPageLabel(activeRole, currentPage);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F6F3' }}>
            {/* 1. Left Navbar Fixed Sidebar (240px) */}
            (user & 
                <LeftNavbar
                    user={user}
                    onPageChange={({ pageId }) => setCurrentPage(pageId)}
                />
            );

            {/* 2. Main Content Wrapper Offset by Sidebar Width */}
            <div style={{ marginLeft: '180px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopNavbar
                    user={user}
                    onRoleChange={(newRole) => setActiveRole(newRole)}
                    pageTitle={pageTitle}
                    breadcrumb={`Home / ${pageTitle}`}
                    onLogout={handleLogout}
                />

                {/* 3. Main Body Offset by TopNavbar Height (56px) */}
                <main style={{ 
                    marginTop: '36px', 
                    padding: '24px', 
                    flex: 1, 
                    minHeight: 'calc(100vh - 56px)',
                    boxSizing: 'border-box'
                }}>
                    <DynamicPageShower
                        user={user}
                        currentRole={activeRole}
                        currentPage={currentPage}
                    />
                </main>
            </div>
        </div>
    );
}