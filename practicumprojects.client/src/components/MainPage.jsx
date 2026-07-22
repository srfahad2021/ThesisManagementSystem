import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
// Sorbet-inspired Color Palette Tokens
const COLORS = {
    primary: '#FF6B6B',       // Soft Coral
    secondary: '#FF8E72',     // Warm Peach
    accent: '#FFA07A',        // Muted Rose / Light Salmon
    background: '#FAFAFA',    // Light Neutral App Background
    cardBg: '#FFFFFF',        // Pure White Container
    border: '#E5E7EB',        // Subtle Divider Line
    textPrimary: '#1F2937',   // Dark Charcoal
    textSecondary: '#6B7280', // Slate Gray
    primaryHover: '#E05555',
};

export default function LandingPage() {
    const [navHovered, setNavHovered] = useState(null);
    const [ctaHovered, setCtaHovered] = useState(null);

    // Directly override body & html inline styles on mount
    useEffect(() => {
        const originalMargin = document.body.style.margin;
        const originalPadding = document.body.style.padding;
        const originalOverflow = document.body.style.overflowX;

        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflowX = 'hidden';

        return () => {
            document.body.style.margin = originalMargin;
            document.body.style.padding = originalPadding;
            document.body.style.overflowX = originalOverflow;
        };
    }, []);

    return (
        <>
            {/* Universal CSS Reset injected inline */}
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
                {/* --- PUBLIC HEADER --- */}
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

                        {/* <nav style={styles.navLinks}>
              {['Overview', '36-Week Timeline', 'Roles & Workflow', 'Guidelines'].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    ...styles.navLink,
                    color: navHovered === index ? COLORS.primary : COLORS.textSecondary,
                  }}
                  onMouseEnter={() => setNavHovered(index)}
                  onMouseLeave={() => setNavHovered(null)}
                >
                  {item}
                </a>
              ))}
            </nav> */}

                        <Link to="/signin">
                            <button
                                style={{
                                    ...styles.loginButton,
                                    backgroundColor: ctaHovered === 'headerLogin' ? COLORS.primaryHover : COLORS.primary,
                                }}
                                onMouseEnter={() => setCtaHovered('headerLogin')}
                                onMouseLeave={() => setCtaHovered(null)}
                            >
                                Portal Login
                            </button>
                        </Link>
                    </div>
                </header>

                {/* --- HERO SECTION --- */}
                <section style={styles.heroSection}>
                    <div style={styles.badgeContainer}>
                        <span style={styles.badgeDot}></span>
                        <span style={styles.badgeText}>36-Week Supervised Undergraduate Research Engine</span>
                    </div>

                    <h1 style={styles.heroTitle}>
                        Streamline Your Academic Thesis & <span style={{ color: COLORS.primary }}>Project Journey</span>
                    </h1>

                    <p style={styles.heroSubtitle}>
                        A unified, role-governed platform connecting Students, Supervisors, Coordinators, Chairmen, and Admins across every milestone—from project formation to final defense board evaluation.
                    </p>

                    <div style={styles.heroActions}>
                        <Link to='/signin'>
                            <button
                                style={{
                                    ...styles.primaryCta,
                                    backgroundColor: ctaHovered === 'heroPrimary' ? COLORS.primaryHover : COLORS.primary,
                                }}
                                onMouseEnter={() => setCtaHovered('heroPrimary')}
                                onMouseLeave={() => setCtaHovered(null)}
                            >
                                Sign In to Portal
                            </button>
                        </Link>

                        <button
                            style={{
                                ...styles.secondaryCta,
                                borderColor: ctaHovered === 'heroSecondary' ? COLORS.primary : COLORS.border,
                                color: ctaHovered === 'heroSecondary' ? COLORS.primary : COLORS.textPrimary,
                            }}
                            onMouseEnter={() => setCtaHovered('heroSecondary')}
                            onMouseLeave={() => setCtaHovered(null)}
                            onClick={() => {
                                const el = document.getElementById('features-grid');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Explore System Capabilities
                        </button>
                    </div>

                    {/* --- SYSTEM HIGHLIGHT CARDS --- */}
                    <div id="features-grid" style={styles.gridContainer}>
                        <div style={styles.featureCard}>
                            <div style={{ ...styles.cardIconBox, backgroundColor: '#FFF0F0', color: COLORS.primary }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <h3 style={styles.cardTitle}>36-Week Progress Engine</h3>
                            <p style={styles.cardDescription}>
                                Sequential milestone stepper with automated lock, pending, and approval states to keep research trajectories accountable.
                            </p>
                        </div>

                        <div style={styles.featureCard}>
                            <div style={{ ...styles.cardIconBox, backgroundColor: '#FFF3EE', color: COLORS.secondary }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3 style={styles.cardTitle}>Role-Based Control</h3>
                            <p style={styles.cardDescription}>
                                Tailored interfaces built specifically for Students, Supervisors, Coordinators, Board Chairmen, and System Administrators.
                            </p>
                        </div>

                        <div style={styles.featureCard}>
                            <div style={{ ...styles.cardIconBox, backgroundColor: '#FFF5EF', color: COLORS.accent }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <h3 style={styles.cardTitle}>Rubric Defense Grading</h3>
                            <p style={styles.cardDescription}>
                                Structured multi-evaluator scoring matrix covering presentation, final technical report, and continuous progress metrics.
                            </p>
                        </div>
                    </div>
                </section>

                {/* --- FOOTER --- */}
                <footer style={styles.footer}>
                    <div style={styles.footerContent}>
                        <div style={styles.footerBrand}>
                            <span style={styles.footerTitle}>Thesis Management Portal</span>
                            <span style={styles.footerSub}>Department of Computer Science and Engineering</span>
                        </div>
                        <div style={styles.copyright}>
                            © {new Date().getFullYear()} CSE Academic Committee. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

// Inline Styles Object
const styles = {
    container: {
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100%',
        backgroundColor: COLORS.background,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: COLORS.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    header: {
        backgroundColor: COLORS.cardBg,
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
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
        justifyContent: 'center',
    },
    brandTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: COLORS.textPrimary,
        letterSpacing: '-0.02em',
    },
    navLinks: {
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
    },
    navLink: {
        fontSize: '14px',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
    },
    loginButton: {
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    heroSection: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexGrow: 1,
        boxSizing: 'border-box',
        width: '100%',
    },
    badgeContainer: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#FFF0F0',
        border: `1px solid ${COLORS.accent}40`,
        borderRadius: '20px',
        padding: '6px 16px',
        marginBottom: '24px',
    },
    badgeDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: COLORS.primary,
    },
    badgeText: {
        fontSize: '13px',
        fontWeight: '600',
        color: COLORS.primary,
    },
    heroTitle: {
        fontSize: '48px',
        fontWeight: '800',
        lineHeight: '1.15',
        letterSpacing: '-0.03em',
        color: COLORS.textPrimary,
        maxWidth: '850px',
        margin: '0 0 20px 0',
    },
    heroSubtitle: {
        fontSize: '18px',
        lineHeight: '1.6',
        color: COLORS.textSecondary,
        maxWidth: '680px',
        margin: '0 0 36px 0',
    },
    heroActions: {
        display: 'flex',
        gap: '16px',
        marginBottom: '80px',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    primaryCta: {
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: '14px 28px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        boxShadow: '0 2px 4px rgba(255, 107, 107, 0.2)',
    },
    secondaryCta: {
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        padding: '14px 28px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        width: '100%',
        boxSizing: 'border-box',
    },
    featureCard: {
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'left',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        boxSizing: 'border-box',
    },
    cardIconBox: {
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '700',
        margin: '0 0 10px 0',
        color: COLORS.textPrimary,
    },
    cardDescription: {
        fontSize: '14px',
        lineHeight: '1.5',
        color: COLORS.textSecondary,
        margin: 0,
    },
    footer: {
        backgroundColor: COLORS.cardBg,
        borderTop: `1px solid ${COLORS.border}`,
        marginTop: 'auto',
        width: '100%',
    },
    footerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxSizing: 'border-box',
    },
    footerBrand: {
        display: 'flex',
        flexDirection: 'column',
    },
    footerTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    footerSub: {
        fontSize: '12px',
        color: COLORS.textSecondary,
        marginTop: '2px',
    },
    copyright: {
        fontSize: '13px',
        color: COLORS.textSecondary,
    },
};