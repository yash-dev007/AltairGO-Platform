import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/logo.png';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Destinations', to: '/discover' },
  { label: 'Blogs', to: '/blogs' },
];

function Logo() {
  return (
    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
      <img src={logo} alt="AltairGO" style={{ height: 28, objectFit: 'contain' }} />
    </Link>
  );
}

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1.5 11.5c0-2.2 2.2-4 5-4s5 1.8 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 6h14M3 10h14M3 14h14" stroke="#1a1814" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 4l12 12M16 4L4 16" stroke="#1a1814" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => {
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      setScrolledToBottom(isBottom);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      {/* ── Main pill bar ── */}
      <div className={styles.navPill}>
        <div style={{
          opacity: scrolledToBottom ? 0 : 1,
          pointerEvents: scrolledToBottom ? 'none' : 'auto',
          transition: 'opacity 0.3s ease',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Logo />
        </div>

        {/* Desktop links */}
        <nav className={styles.desktopLinks}>
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={styles.desktopLink}
              style={{
                textDecoration: 'none',
                padding: '9px 14px',
                fontSize: 13.5,
                lineHeight: 1,
                fontWeight: 500,
                color: isActive(item.to) ? 'var(--ink, #1a1814)' : 'var(--ink-soft, #6b6356)',
                display: 'inline-flex',
                alignItems: 'center',
                borderBottom: isActive(item.to) ? '1.5px solid var(--ink, #1a1814)' : '1.5px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA group */}
        <div className={styles.ctaGroup}>
          {user ? (
            <>
              <Link
                to="/trips"
                className={styles.signInDesktop}
                style={{
                  all: 'unset', cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
                  padding: '9px 16px', color: 'var(--ink-soft, #6b6356)',
                  borderRadius: 999, border: '1px solid var(--line, #e7e2d8)',
                  background: 'var(--card, #fff)', display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              >
                <UserIcon />
                Account
              </Link>
              <button
                onClick={handleLogout}
                className={styles.planDesktop}
                style={{
                  all: 'unset', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
                  padding: '10px 20px', background: 'var(--ink, #1a1814)',
                  color: 'var(--page-bg, #faf7f2)', borderRadius: 999,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className={styles.signInDesktop}
                style={{
                  all: 'unset', cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
                  padding: '9px 16px', color: 'var(--ink-soft, #6b6356)',
                  borderRadius: 999, border: '1px solid var(--line, #e7e2d8)',
                  background: 'var(--card, #fff)', display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              >
                <UserIcon />
                Sign In
              </button>
            </>
          )}

          {/* Hamburger Menu Only for Mobile (Visible via CSS media query) */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {NAV_LINKS.map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04, ease: 'easeOut' }}
              >
                <Link
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`${styles.menuLink} ${isActive(item.to) ? styles.activeMenuLink : ''}`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            {user && (
              <Link to="/trips" className={styles.menuLink} onClick={() => setMobileOpen(false)}>
                My Trips
              </Link>
            )}

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.14, ease: 'easeOut' }}
              style={{ marginTop: 8 }}
            >
              {user ? (
                <button
                  onClick={handleLogout}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '13px 20px', fontSize: 15, fontWeight: 600,
                    color: '#dc2626', borderRadius: 14,
                    border: '1.5px solid #fecaca', background: '#fef2f2',
                    display: 'flex', alignItems: 'center', gap: 8,
                    justifyContent: 'center', width: '100%', boxSizing: 'border-box',
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '14px 20px', fontSize: 15, fontWeight: 600,
                    color: 'var(--page-bg, #faf9f5)',
                    background: 'var(--ink, #141413)',
                    borderRadius: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                    justifyContent: 'center', width: '100%', boxSizing: 'border-box',
                  }}
                >
                  <UserIcon /> Sign In
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
