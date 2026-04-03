import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Left side */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logo}>🚀</div>
          <h1 style={s.leftTitle}>Shuru Karo Aaj Se</h1>
          <p style={s.leftSub}>
            Free account banao aur apne expenses track karna shuru karo
          </p>
          <div style={s.steps}>
            <div style={s.step}>
              <span style={s.stepNum}>1</span>
              <span>Account banao — bilkul free</span>
            </div>
            <div style={s.step}>
              <span style={s.stepNum}>2</span>
              <span>Expenses add karo</span>
            </div>
            <div style={s.step}>
              <span style={s.stepNum}>3</span>
              <span>Charts se samjho kahan ja raha hai paisa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.title}>Account Banao 🎯</h2>
          <p style={s.subtitle}>Free mein shuru karo — koi credit card nahi</p>

          {error && (
            <div style={s.error}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Poora Naam</label>
              <input
                style={s.input}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rahul Kumar"
                required
              />
            </div>

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
                placeholder="Min 6 characters, 1 number"
                required
              />
              <p style={s.hint}>Kam se kam 6 characters aur 1 number hona chahiye</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={s.btn}
            >
              {loading ? '⏳ Creating account...' : 'Account Banao →'}
            </button>
          </form>

          <p style={s.link}>
            Already account hai?{' '}
            <Link to="/login" style={s.linkA}>Login karo</Link>
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
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
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
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    opacity: '0.95',
  },
  stepNum: {
    background: 'rgba(255,255,255,0.3)',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
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
    background: '#f8fafc',
  },
  hint: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
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

export default Register;