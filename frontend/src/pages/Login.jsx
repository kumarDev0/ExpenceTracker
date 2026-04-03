import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Left side — decorative */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logo}>💰</div>
          <h1 style={s.leftTitle}>ExpenseTracker</h1>
          <p style={s.leftSub}>Apna paisa samjho, apni zindagi control karo</p>
          <div style={s.features}>
            <div style={s.feature}>✓ Real-time expense tracking</div>
            <div style={s.feature}>✓ Category wise breakdown</div>
            <div style={s.feature}>✓ Beautiful charts</div>
            <div style={s.feature}>✓ 100% Secure</div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.title}>Welcome Back 👋</h2>
          <p style={s.subtitle}>Login karke continue karo</p>

          {error && (
            <div style={s.error}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Email Address</label>
              <input
                style={s.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={s.btn}
            >
              {loading ? '⏳ Logging in...' : 'Login →'}
            </button>
          </form>

          <p style={s.link}>
            Account nahi hai?{' '}
            <Link to="/register" style={s.linkA}>
              Register karo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh',
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    // Mobile pe hide karo
    '@media (max-width: 768px)': {
      display: 'none'
    }
  },
  leftContent: {
    color: 'white',
    maxWidth: '400px',
  },
  logo: {
    fontSize: '64px',
    marginBottom: '1rem',
  },
  leftTitle: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '1rem',
    color: 'white',
  },
  leftSub: {
    fontSize: '16px',
    opacity: '0.9',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  feature: {
    fontSize: '15px',
    opacity: '0.9',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#f8fafc',
  },
  card: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '6px',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '2rem',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '1rem',
    fontSize: '14px',
    border: '1px solid #fecaca',
  },
  field: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    background: '#f8fafc',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.5px',
  },
  link: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '14px',
    color: '#64748b',
  },
  linkA: {
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Login;