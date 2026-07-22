import React, { useState, useEffect } from 'react';
import LeftNavbar from './components/LeftNavbar.jsx';
import TopNavbar from './components/TopNavbar.jsx';
import MainPage from './components/MainPage.jsx';
import { getPageLabel } from './Information/RolesAndConfig.js';

export default function App({ page = 'dashboard' }) {

    const [activeRole, setActiveRole] = useState('ADMIN');
    const [currentPage, setCurrentPage] = useState(page);

    return (
        <div>
            {/* Pass current role & user info down to LeftNavbar */}
            <LeftNavbar
                currentRole={activeRole}
                onPageChange={({ pageId }) => setCurrentPage(pageId)}
            />

            {/* Pass full user object down to TopNavbar */}
            <TopNavbar
                activeRole={activeRole}
                onRoleChange={(newRole) => setActiveRole(newRole)}
                pageTitle={currentPage}
                breadcrumb={`Home / ${currentPage}`}
            />

            {/* Main Page Body */}
            {/*<MainPage
                user={user}
                currentRole={activeRole}
                currentPage={currentPage}
            />*/}
        </div>
    );
}