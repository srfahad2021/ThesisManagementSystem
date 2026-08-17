import React, { useState, useEffect } from 'react';
import LeftNavbar from './components/LeftNavbar.jsx';
import TopNavbar from './components/TopNavbar.jsx';
import DynamicPageShower from './components/DynamicPageShower.jsx';
import { getPageLabel } from './Information/RolesAndConfig.js';

export default function App({ page = 'dashboard' }) {
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [activeRole, setActiveRole] = useState(() => {
        return user?.role || 'ADMIN';
    });

    const [currentPage, setCurrentPage] = useState(page);

    useEffect(() => {
        if (user?.role) {
            setActiveRole(user.role);
        }
    }, [user]);

    const handleUserUpdated = (updatedUser) => {
        // 1. Update React state so the UI updates instantly
        setUser(updatedUser);

        // 2. Safely update user in storage while keeping tokens intact 
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
    };

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
            {/* 1. Left Navbar Fixed Sidebar */}
            {user && (
                <LeftNavbar
                    user={user}
                    onPageChange={({ pageId }) => setCurrentPage(pageId)}
                />
            )}

            {/* 2. Main Content Wrapper Offset by Sidebar Width */}
            <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopNavbar
                    user={user}
                    onRoleChange={(newRole) => setActiveRole(newRole)}
                    pageTitle={pageTitle}
                    breadcrumb={`Home / ${pageTitle}`}
                    onLogout={handleLogout}
                    onUserUpdated={handleUserUpdated}
                />

                {/* 3. Main Body */}
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