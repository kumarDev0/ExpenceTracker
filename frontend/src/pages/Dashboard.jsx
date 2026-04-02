// Dashboard — app ka home page
// Yahan 2 API calls honge:
// 1. Summary — category wise totals
// 2. Recent expenses — last 5
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import api from '../services/api';

// Pie chart ke liye colors — ek color per category
const COLORS = {
  food: '#6366f1',
  transport: '#f59e0b',
  entertainment: '#8b5cf6',
  shopping: '#ec4899',
  health: '#10b981',
  other: '#ef4444'
};

const Dashboard = () => {
  // State — loading, error, aur data
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Component load hone pe data fetch karo
  // useEffect = "ye kaam tab karo jab component screen pe aaye"
  useEffect(() => {
    fetchDashboardData();
  }, []); // [] = sirf ek baar

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Dono API calls ek saath — parallel mein
      // Promise.all = dono simultaneously chalao, dono hone ka wait karo
      // Agar ek ek karte toh zyada time lagta
      const [summaryRes, expensesRes] = await Promise.all([
        api.get('/expenses/summary'),
        api.get('/expenses?sort=date_desc')
      ]);

      setSummary(summaryRes.data);
      // Sirf last 5 dikhao dashboard pe
      setRecentExpenses(expensesRes.data.expenses.slice(0, 5));

    } catch (err) {
      setError('Data load nahi hua — try again');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Emoji per category
  const categoryEmoji = {
    food: '🍕', transport: '🚗', entertainment: '🎬',
    shopping: '🛒', health: '💊', other: '📦'
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={s.center}>Data load ho raha hai...</div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div style={s.center}>
          <p style={{ color: '#dc2626' }}>{error}</p>
          <button onClick={fetchDashboardData} style={s.retryBtn}>
            Try Again
          </button>
        </div>
      </>
    );
  }

  // Pie chart ke liye data format
  const pieData = summary?.byCategory?.map(cat => ({
    name: cat.category,
    value: parseFloat(cat.total)
  })) || [];

  // Summary cards ke liye values
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

        {/* Summary Cards — 4 boxes upar */}
        <div style={s.cardGrid}>
          <div style={{ ...s.card, borderTop: '3px solid #6366f1' }}>
            <p style={s.cardLabel}>This Month</p>
            <p style={s.cardValue}>₹{thisMonthTotal.toLocaleString()}</p>
          </div>
          <div style={{ ...s.card, borderTop: '3px solid #8b5cf6' }}>
            <p style={s.cardLabel}>Total Expenses</p>
            <p style={s.cardValue}>{thisMonthCount}</p>
          </div>
          <div style={{ ...s.card, borderTop: '3px solid #f59e0b' }}>
            <p style={s.cardLabel}>Top Category</p>
            <p style={s.cardValue}>
              {categoryEmoji[topCategory]} {topCategory}
            </p>
          </div>
          <div style={{ ...s.card, borderTop: '3px solid #10b981' }}>
            <p style={s.cardLabel}>Avg Per Day</p>
            <p style={s.cardValue}>₹{avgPerDay}</p>
          </div>
        </div>

        {/* Bottom section — Chart + Recent */}
        <div style={s.bottomGrid}>

          {/* Pie Chart */}
          <div style={s.box}>
            <h3 style={s.boxTitle}>Category Breakdown</h3>
            {pieData.length === 0 ? (
              <p style={s.empty}>Koi expense nahi abhi tak</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
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
                  <Tooltip formatter={(val) => `₹${val}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Expenses */}
          <div style={s.box}>
            <div style={s.boxHeader}>
              <h3 style={s.boxTitle}>Recent Expenses</h3>
              <button
                onClick={() => navigate('/expenses')}
                style={s.seeAll}
              >
                Sab dekho →
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div style={s.emptyBox}>
                <p style={s.empty}>Koi expense nahi abhi tak</p>
                <button
                  onClick={() => navigate('/expenses')}
                  style={s.addBtn}
                >
                  + Pehla Expense Add Karo
                </button>
              </div>
            ) : (
              <>
                {recentExpenses.map(exp => (
                  <div key={exp.id} style={s.expRow}>
                    <div style={s.expLeft}>
                      <span style={s.emoji}>
                        {categoryEmoji[exp.category]}
                      </span>
                      <div>
                        <p style={s.expTitle}>{exp.title}</p>
                        <p style={s.expDate}>{exp.date}</p>
                      </div>
                    </div>
                    <p style={s.expAmount}>₹{parseFloat(exp.amount).toLocaleString()}</p>
                  </div>
                ))}

                <button
                  onClick={() => navigate('/expenses')}
                  style={s.addBtn}
                >
                  + Expense Add Karo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const s = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  card: { background: 'white', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  cardLabel: { fontSize: '13px', color: '#888', marginBottom: '8px' },
  cardValue: { fontSize: '24px', fontWeight: '700', color: '#1f2937' },
  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  box: { background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  boxHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  boxTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '1rem' },
  seeAll: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px' },
  expRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
  expLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  emoji: { fontSize: '24px' },
  expTitle: { fontSize: '14px', fontWeight: '500', marginBottom: '2px' },
  expDate: { fontSize: '12px', color: '#9ca3af' },
  expAmount: { fontSize: '15px', fontWeight: '600', color: '#1f2937' },
  emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: '1rem' },
  empty: { color: '#9ca3af', fontSize: '14px', textAlign: 'center' },
  addBtn: { width: '100%', marginTop: '16px', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  retryBtn: { padding: '8px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default Dashboard;