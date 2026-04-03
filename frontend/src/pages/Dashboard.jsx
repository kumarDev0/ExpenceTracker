import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import api from '../services/api';

const COLORS = {
  food: '#6366f1',
  transport: '#f59e0b',
  entertainment: '#8b5cf6',
  shopping: '#ec4899',
  health: '#10b981',
  other: '#ef4444'
};

const categoryEmoji = {
  food: '🍕', transport: '🚗', entertainment: '🎬',
  shopping: '🛒', health: '💊', other: '📦'
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, expensesRes] = await Promise.all([
        api.get('/expenses/summary'),
        api.get('/expenses?sort=date_desc')
      ]);
      setSummary(summaryRes.data);
      setRecentExpenses(expensesRes.data.expenses.slice(0, 5));
    } catch (err) {
      setError('Data load nahi hua');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={s.center}>
        <div style={s.spinner}>⏳</div>
        <p style={s.loadingText}>Data load ho raha hai...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div style={s.center}>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
        <button onClick={fetchData} style={s.retryBtn}>🔄 Try Again</button>
      </div>
    </>
  );

  const pieData = summary?.byCategory?.map(cat => ({
    name: cat.category,
    value: parseFloat(cat.total)
  })) || [];

  const thisMonthTotal = parseFloat(summary?.thisMonth?.total || 0);
  const thisMonthCount = summary?.thisMonth?.count || 0;
  const topCategory = summary?.byCategory?.[0]?.category || 'N/A';
  const avgPerDay = thisMonthTotal > 0
    ? (thisMonthTotal / new Date().getDate()).toFixed(0)
    : 0;

  return (
    <>
      <Navbar />
      <div style={s.page}>

        {/* Welcome Banner */}
        <div style={s.banner}>
          <div>
            <h2 style={s.bannerTitle}>Namaste! 👋</h2>
            <p style={s.bannerSub}>Yahan hai tera is mahine ka financial summary</p>
          </div>
          <button
            onClick={() => navigate('/expenses')}
            style={s.addBtn}
          >
            + Expense Add Karo
          </button>
        </div>

        {/* Summary Cards */}
        <div style={s.cardGrid}>
          <div style={{ ...s.card, borderTop: '4px solid #6366f1' }}>
            <p style={s.cardLabel}>💰 This Month</p>
            <p style={s.cardValue}>₹{thisMonthTotal.toLocaleString()}</p>
            <p style={s.cardSub}>Total kharch</p>
          </div>
          <div style={{ ...s.card, borderTop: '4px solid #8b5cf6' }}>
            <p style={s.cardLabel}>📊 Transactions</p>
            <p style={s.cardValue}>{thisMonthCount}</p>
            <p style={s.cardSub}>Is mahine</p>
          </div>
          <div style={{ ...s.card, borderTop: '4px solid #f59e0b' }}>
            <p style={s.cardLabel}>🏆 Top Category</p>
            <p style={s.cardValue}>
              {topCategory !== 'N/A' ? categoryEmoji[topCategory] : ''} {topCategory}
            </p>
            <p style={s.cardSub}>Sabse zyada kharch</p>
          </div>
          <div style={{ ...s.card, borderTop: '4px solid #10b981' }}>
            <p style={s.cardLabel}>📅 Daily Average</p>
            <p style={s.cardValue}>₹{avgPerDay}</p>
            <p style={s.cardSub}>Per day average</p>
          </div>
        </div>

        {/* Bottom Grid */}
        <div style={s.bottomGrid}>

          {/* Pie Chart */}
          <div style={s.box}>
            <h3 style={s.boxTitle}>📈 Category Breakdown</h3>
            {pieData.length === 0 ? (
              <div style={s.emptyBox}>
                <p style={s.emptyText}>Koi expense nahi abhi tak</p>
                <button
                  onClick={() => navigate('/expenses')}
                  style={s.emptyBtn}
                >
                  + Pehla Expense Add Karo
                </button>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[entry.name] || '#888'}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Category list */}
                <div style={s.categoryList}>
                  {summary?.byCategory?.map(cat => (
                    <div key={cat.category} style={s.categoryRow}>
                      <div style={s.categoryLeft}>
                        <div style={{
                          ...s.colorDot,
                          background: COLORS[cat.category] || '#888'
                        }}/>
                        <span style={s.categoryName}>
                          {categoryEmoji[cat.category]} {cat.category}
                        </span>
                      </div>
                      <span style={s.categoryAmount}>
                        ₹{parseFloat(cat.total).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Recent Expenses */}
          <div style={s.box}>
            <div style={s.boxHeader}>
              <h3 style={s.boxTitle}>🕐 Recent Expenses</h3>
              <button
                onClick={() => navigate('/expenses')}
                style={s.seeAllBtn}
              >
                Sab dekho →
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div style={s.emptyBox}>
                <p style={s.emptyText}>Abhi tak koi expense nahi</p>
              </div>
            ) : (
              <div style={s.expenseList}>
                {recentExpenses.map(exp => (
                  <div key={exp.id} style={s.expRow}>
                    <div style={{
                      ...s.expIcon,
                      background: COLORS[exp.category] + '20'
                    }}>
                      {categoryEmoji[exp.category]}
                    </div>
                    <div style={s.expInfo}>
                      <p style={s.expTitle}>{exp.title}</p>
                      <p style={s.expMeta}>
                        {exp.category} · {exp.date?.split('T')[0]}
                      </p>
                    </div>
                    <p style={{
                      ...s.expAmount,
                      color: COLORS[exp.category] || '#6366f1'
                    }}>
                      ₹{parseFloat(exp.amount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/expenses')}
              style={s.addExpBtn}
            >
              + Naya Expense Add Karo
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const s = {
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '1rem',
  },
  spinner: { fontSize: '48px' },
  loadingText: { color: '#64748b', fontSize: '16px' },
  retryBtn: {
    padding: '10px 24px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
  },
  banner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  bannerTitle: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '14px',
  },
  addBtn: {
    padding: '10px 20px',
    background: 'white',
    color: '#6366f1',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  card: {
    background: 'white',
    padding: '1.25rem 1.5rem',
    borderRadius: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardLabel: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  cardSub: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  box: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  boxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  boxTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '1rem',
  },
  seeAllBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  categoryList: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  categoryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  categoryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  colorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  categoryName: {
    fontSize: '14px',
    color: '#374151',
    textTransform: 'capitalize',
  },
  categoryAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
  },
  expenseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '1rem',
  },
  expRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    borderRadius: '10px',
    background: '#f8fafc',
  },
  expIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  expInfo: { flex: 1 },
  expTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a2e',
    marginBottom: '2px',
  },
  expMeta: {
    fontSize: '12px',
    color: '#94a3b8',
    textTransform: 'capitalize',
  },
  expAmount: {
    fontSize: '15px',
    fontWeight: '700',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    gap: '1rem',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  emptyBtn: {
    padding: '10px 20px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  addExpBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
  },
};

export default Dashboard;