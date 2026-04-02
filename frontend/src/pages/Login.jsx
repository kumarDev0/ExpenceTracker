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
      <div style={s.card}>
        <h2 style={s.title}>Welcome Back 👋</h2>
        <p style={s.sub}>Apna expense track karo</p>

        {error && <div style={s.err}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="rahul@example.com" required />

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••" required />

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={s.link}>
          Account nahi hai? <Link to="/register" style={s.a}>Register karo</Link>
        </p>
      </div>
    </div>
  );
};

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5' },
  card: { background:'white', padding:'2rem', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)', width:'100%', maxWidth:'400px' },
  title: { margin:'0 0 4px', fontSize:'24px' },
  sub: { margin:'0 0 24px', color:'#666', fontSize:'14px' },
  err: { background:'#fee2e2', color:'#dc2626', padding:'10px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
  label: { display:'block', margin:'0 0 6px', fontSize:'14px', fontWeight:'500' },
  input: { width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box', marginBottom:'16px' },
  btn: { width:'100%', padding:'12px', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
  link: { textAlign:'center', marginTop:'16px', fontSize:'14px' },
  a: { color:'#6366f1', textDecoration:'none' }
};

export default Login;