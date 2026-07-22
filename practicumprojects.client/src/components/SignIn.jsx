import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import App from './ErrorPage.jsx'


const COLORS = {
    primary: '#FF6B6B',
    secondary: '#FF8E72',
    accent: '#FFA07A',
    background: '#FAFAFA',
    cardBg: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    primaryHover: '#E05555',
};

export default function SignInPage({ onSwitchToSignUp, onLoginSuccess }) {
    const [role, setRole] = useState('STUDENT');
    const [username, setUsername] = useState('student');
    const [password, setPassword] = useState('student');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isHovered, setIsHovered] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        // e.preventDefault();
        // if (!username.trim() || !password) {
        //     setError('Please enter both username and password.');
        //     return;
        // }

        // setError('');
        // setIsLoading(true);

        // try {
        //     const response = await fetch('/api/auth/login', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             username: username.trim(),
        //             password: password,
        //             role: role,
        //         }),
        //     });

        //     const data = await response.json();

        //     if (!response.ok) {
        //         throw new Error(data.message || 'Login failed. Please check your credentials.');
        //     }

        //     // 1. SAVE THE JWT TOKEN & USER DATA
        //     // Use localStorage (or sessionStorage if rememberMe is false)
        //     const storage = rememberMe ? localStorage : sessionStorage;
        //     storage.setItem('token', data.token);
        //     storage.setItem('user', JSON.stringify(data.user));

        //     // 2. HANDLE REDIRECT / STATE UPDATE
        //     if (onLoginSuccess) {
        //         // Pass the token and user to your parent handler
        //         onLoginSuccess({ user: data.user, token: data.token, rememberMe });
        //     }

        //     // 3. NAVIGATE TO DASHBOARD
        //     navigate('/dashboard');

        // } catch (err) {
        //     setError(err.message);
        // } finally {
        //     setIsLoading(false);
        // }
        alert("kire?");
    };
    return (
        <>
            <style>{`
        *, *::before, *::after {
          box-sizing: border-box !important;
          margin: 0;
          padding: 0;
        }
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          width: 100% !important;
          min-height: 100vh !important;
          overflow-x: hidden;
        }
      `}</style>

            <div style={styles.container}>
                <header style={styles.header}>
                    <div style={styles.headerContent}>
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <div style={styles.brandContainer}>
                                <div style={styles.brandIcon}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#FFFFFF"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                                    </svg>
                                </div>
                                <span style={styles.brandTitle}>Thesis Management Portal</span>
                            </div>
                        </Link>
                    </div>
                </header>

                <main style={styles.mainCanvas}>
                    <div style={styles.authCard}>
                        <div style={styles.cardHeader}>
                            <h1 style={styles.title}>Portal Sign In</h1>
                            <p style={styles.subtitle}>
                                Enter your credentials to access your thesis dashboard
                            </p>
                        </div>

                        {error && (
                            <div style={styles.errorBox}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={styles.form}>
                        {/* <form style={styles.form}> */}
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Login As</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={styles.selectInput}
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="SUPERVISOR">Supervisor / Faculty</option>
                                    <option value="COORDINATOR">Thesis Coordinator</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <div style={styles.labelRow}>
                                    <label style={styles.label}>Password</label>
                                    <a
                                        href="#forgot"
                                        style={styles.forgotLink}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            alert('Redirect to Password Recovery');
                                        }}
                                    >
                                        Forgot password?
                                    </a>
                                </div>

                                <div style={styles.passwordWrapper}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={styles.passwordInput}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.textSecondary} strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.textSecondary} strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div style={styles.rememberRow}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        style={styles.checkbox}
                                    />
                                    <span>Keep me signed in</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    ...styles.submitButton,
                                    backgroundColor: isHovered === 'submit' ? COLORS.primaryHover : COLORS.primary,
                                    opacity: isLoading ? 0.7 : 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                }}
                                onMouseEnter={() => setIsHovered('submit')}
                                onMouseLeave={() => setIsHovered(null)}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}

const styles = {
    container: {
        height: '100vh',
        width: '100vw',
        backgroundColor: COLORS.background,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: COLORS.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflowX: 'hidden',
    },
    header: {
        backgroundColor: COLORS.cardBg,
        borderBottom: `1px solid ${COLORS.border}`,
        height: '72px',
        width: '100%',
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
    },
    brandContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    brandIcon: {
        backgroundColor: COLORS.primary,
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
    },
    brandTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: COLORS.textPrimary,
        letterSpacing: '-0.02em',
    },
    mainCanvas: {
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
    },
    authCard: {
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
    },
    cardHeader: {
        marginBottom: '28px',
        textAlign: 'center',
    },
    title: {
        fontSize: '26px',
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: '-0.02em',
        margin: '0 0 8px 0',
    },
    subtitle: {
        fontSize: '14px',
        color: COLORS.textSecondary,
        lineHeight: '1.4',
        margin: 0,
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#991B1B',
        fontSize: '13px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    labelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    forgotLink: {
        fontSize: '12px',
        color: COLORS.primary,
        textDecoration: 'none',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '8px',
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.background,
        fontSize: '14px',
        color: COLORS.textPrimary,
        outline: 'none',
    },
    selectInput: {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '8px',
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.background,
        fontSize: '14px',
        color: COLORS.textPrimary,
        outline: 'none',
        cursor: 'pointer',
    },
    passwordWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    passwordInput: {
        width: '100%',
        padding: '12px 42px 12px 14px',
        borderRadius: '8px',
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.background,
        fontSize: '14px',
        color: COLORS.textPrimary,
        outline: 'none',
    },
    eyeButton: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
    },
    rememberRow: {
        display: 'flex',
        alignItems: 'center',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: COLORS.textSecondary,
        cursor: 'pointer',
    },
    checkbox: {
        accentColor: COLORS.primary,
        width: '16px',
        height: '16px',
        cursor: 'pointer',
    },
    submitButton: {
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '15px',
        fontWeight: '600',
        marginTop: '8px',
        transition: 'background-color 0.2s ease',
    },
};