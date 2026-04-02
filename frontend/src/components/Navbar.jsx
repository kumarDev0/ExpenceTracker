// Navbar — har page pe dikhega
// useAuth se user ka naam aur logout function milega
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={s.nav}>
      <div style={s.brand}>💰 ExpenseTracker</div>

      <div style={s.links}>
        <Link to="/dashboard" style={s.link}>Dashboard</Link>
        <Link to="/expenses" style={s.link}>Expenses</Link>

        <span style={s.user}>Hi, {user?.name?.split(' ')[0]}</span>

        <button onClick={handleLogout} style={s.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const s = {
  nav: {
    background: 'white',
    padding: '0 2rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',    // page scroll karo toh bhi upar rehta hai
    top: 0,
    zIndex: 100
  },
  brand: { fontSize: '18px', fontWeight: '700', color: '#6366f1' },
  links: { display: 'flex', alignItems: 'center', gap: '24px' },
  link: { color: '#555', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  user: { fontSize: '14px', color: '#888' },
  logoutBtn: {
    padding: '6px 14px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default Navbar;