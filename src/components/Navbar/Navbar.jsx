import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, LogOut, Plane } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { search } from '../../services/api.js';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setShowResults(false); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await search(q, 'destination', 8);
        setSearchResults(data.results || data || []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        navigate(`/destination/${searchResults[0].id}`);
      } else if (searchQuery.trim().length >= 2) {
        navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setShowResults(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={() => window.scrollTo(0, 0)}>
          <img src={logo} alt="AltairGO Logo" className={styles.logoImg} />
        </Link>

        <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`${styles.links} ${isOpen ? styles.active : ''}`}>
          <Link to="/" className={styles.link} onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/discover" className={styles.link} onClick={() => setIsOpen(false)}>Discover</Link>
          <Link to="/blogs" className={styles.link} onClick={() => setIsOpen(false)}>Blogs</Link>
          {user && <Link to="/trips" className={styles.link} onClick={() => setIsOpen(false)}>My Trips</Link>}

          {user ? (
            <button
              onClick={handleLogout}
              className={`${styles.link} ${styles.mobileBtnOnly}`}
              style={{ background: 'transparent', border: 'none', color: '#dc2626', textAlign: 'left', paddingLeft: 0, fontSize: '1.5rem', cursor: 'pointer' }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className={`${styles.mobileLoginBtn} ${styles.mobileBtnOnly}`} onClick={() => setIsOpen(false)}>
              <User size={18} className={styles.btnIcon} />
              Sign In
            </Link>
          )}
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search destinations..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => { if (searchQuery.length >= 2) setShowResults(true); }}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
          </div>
          {showResults && (
            <div className={styles.searchResults}>
              {searchLoading ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Link
                    key={item.id}
                    to={`/destination/${item.id}`}
                    className={styles.searchResultItem}
                    onClick={() => { setShowResults(false); setSearchQuery(''); }}
                  >
                    <div className={styles.resultImage}>
                      {item.image_url || item.image ? (
                        <img src={item.image_url || item.image} alt={item.name} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : null}
                    </div>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>{item.name}</span>
                      <span className={styles.resultLocation}>{item.location || item.state_name || ''}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No results found</div>
              )}
            </div>
          )}
        </div>

        <div className={styles.navActions}>
          {user ? (
            <>
              <Link to="/trips" className={styles.userChip}>
                <User size={16} />
                {user.name?.split(' ')[0] || 'Account'}
              </Link>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.45rem 0.9rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>
                <User size={16} className={styles.btnIcon} />
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
