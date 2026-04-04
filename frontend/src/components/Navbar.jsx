import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'villainxcoding9010@gmail.com';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <nav style={s.nav}>
      <div style={s.container}>
        {/* Logo */}
        <Link to="/dashboard" style={s.brand}>
          💰 ExpenseTracker
        </Link>

        {/* Desktop links */}
        <div style={s.desktopLinks} className="desktop-links">
          <Link to="/dashboard" style={isActive('/dashboard') ? s.linkActive : s.link}>
            Dashboard
          </Link>
          <Link to="/expenses" style={isActive('/expenses') ? s.linkActive : s.link}>
            Expenses
          </Link>
          {isAdmin && (
            <Link to="/admin" style={isActive('/admin') ? s.adminLinkActive : s.adminLink}>
              🛡️ Admin
            </Link>
          )}
        </div>

        {/* User info + logout — desktop */}
        <div style={s.desktopRight} className="desktop-right">
          <div style={s.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={s.userName}>
            {user?.name?.split(' ')[0]}
          </span>
          <button onClick={handleLogout} style={s.logoutBtn}>
            Logout
          </button>
        </div>

        {/* Hamburger — mobile only */}
        <button
          style={s.hamburger}
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          <Link to="/dashboard" style={s.mobileLink} onClick={() => setMenuOpen(false)}>
            📊 Dashboard
          </Link>
          <Link to="/expenses" style={s.mobileLink} onClick={() => setMenuOpen(false)}>
            💸 Expenses
          </Link>
          {isAdmin && (
            <Link to="/admin" style={s.mobileAdminLink} onClick={() => setMenuOpen(false)}>
              🛡️ Admin Panel
            </Link>
          )}
          <div style={s.mobileDivider} />
          <div style={s.mobileUser}>
            Hi, {user?.name?.split(' ')[0]} 👋
          </div>
          <button onClick={handleLogout} style={s.mobileLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const s = {
  nav: {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#6366f1',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  desktopLinks: {
    display: 'flex',
    gap: '8px',
  },
  link: {
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  linkActive: {
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    background: '#eef2ff',
  },
  adminLink: {
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#7c3aed',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    background: '#f5f3ff',
    border: '1px solid #ddd6fe',
  },
  adminLinkActive: {
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    background: '#7c3aed',
  },
  desktopRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  logoutBtn: {
    padding: '7px 16px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    color: '#374151',
    padding: '4px 8px',
  },
  mobileMenu: {
    background: 'white',
    borderTop: '1px solid #e2e8f0',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mobileLink: {
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    background: '#f8fafc',
  },
  mobileAdminLink: {
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#7c3aed',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    background: '#f5f3ff',
    border: '1px solid #ddd6fe',
  },
  mobileDivider: {
    height: '1px',
    background: '#e2e8f0',
    margin: '4px 0',
  },
  mobileUser: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#64748b',
  },
  mobileLogout: {
    padding: '12px 16px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    textAlign: 'left',
  },
};

export default Navbar;

