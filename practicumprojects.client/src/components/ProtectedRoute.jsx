import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
    // Check both storage options based on "Keep me signed in" choice
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');

    // 1. Not logged in -> Redirect to Sign In
    if (!token || !userJson) {
        return <Navigate to="/signin" replace />;
    }

    // 2. Optional: Role-based access control
    if (allowedRoles && allowedRoles.length > 0) {
        try {
            const user = JSON.parse(userJson);
            if (!allowedRoles.includes(user.role)) {
                // If user doesn't have the required role, redirect to unauthorized/main
                return <Navigate to="/" replace />;
            }
        } catch (e) {
            return <Navigate to="/signin" replace />;
        }
    }

    // Authenticated (and authorized) -> Render the component
    return children;
}