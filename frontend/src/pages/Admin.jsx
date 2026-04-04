import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// ─── PIE CHART ───────────────────────────────────────────────
const COLORS = ["#a78bfa", "#f472b6", "#34d399", "#fb923c", "#60a5fa", "#facc15"];
const CATEGORY_COLORS = {
  food: "#f472b6",
  transport: "#60a5fa",
  entertainment: "#a78bfa",
  shopping: "#fb923c",
  health: "#34d399",
  other: "#facc15",
};

function PieChart({ data }) {
  if (!data || data.length === 0) return (
    <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>No data</div>
  );

  const total = data.reduce((s, d) => s + parseFloat(d.total || d.amount || 0), 0);
  let cumulative = 0;
  const size = 140;
  const cx = size / 2, cy = size / 2, r = 55, innerR = 28;

  const slices = data.map((d, i) => {
    const val = parseFloat(d.total || d.amount || 0);
    const pct = val / total;
    const start = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const end = cumulative * 2 * Math.PI - Math.PI / 2;
    const large = pct > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const ix1 = cx + innerR * Math.cos(start), iy1 = cy + innerR * Math.sin(start);
    const ix2 = cx + innerR * Math.cos(end), iy2 = cy + innerR * Math.sin(end);
    return {
      d: `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`,
      color: CATEGORY_COLORS[d.category] || COLORS[i % COLORS.length],
      label: d.category || d.title || "",
      pct: Math.round(pct * 100),
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} opacity={0.92} />
        ))}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="#1a1a2e" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">Total</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#a78bfa" fontSize="9">₹{total.toFixed(0)}</text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", justifyContent: "center" }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#ccc" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            {s.label} ({s.pct}%)
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e1b4b 0%, #1a1a2e 100%)",
      border: `1px solid ${color}33`,
      borderRadius: 16,
      padding: "20px 24px",
      flex: 1,
      minWidth: 130,
      boxShadow: `0 4px 24px ${color}22`,
    }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── USER CARD ───────────────────────────────────────────────
function UserCard({ user, expenses }) {
  const [open, setOpen] = useState(false);
  const userExpenses = expenses.filter(e => e.email === user.email);
  const total = userExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  // Group by category for pie
  const catMap = {};
  userExpenses.forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + parseFloat(e.amount);
  });
  const catData = Object.entries(catMap).map(([category, total]) => ({ category, total }));

  const joinDate = new Date(user.created_at).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e1b4b 0%, #1a1a2e 100%)",
      border: "1px solid #3730a333",
      borderRadius: 20,
      marginBottom: 16,
      overflow: "hidden",
      boxShadow: "0 4px 32px #0005",
    }}>
      {/* User Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          cursor: "pointer",
          background: open ? "#2d1b6933" : "transparent",
          transition: "background 0.2s",
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS[user.id % COLORS.length]}, #6d28d9)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0,
          boxShadow: "0 2px 12px #a78bfa44",
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.name}
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.email}
          </div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 1 }}>
            Joined: {joinDate}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>
            ₹{total.toFixed(0)}
          </div>
          <div style={{ fontSize: 11, color: "#888" }}>
            {userExpenses.length} expense{userExpenses.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div style={{
          marginLeft: 8, color: "#a78bfa", fontSize: 18, flexShrink: 0,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s",
        }}>▾</div>
      </div>

      {/* Expanded Section */}
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #3730a322" }}>

          {userExpenses.length === 0 ? (
            <div style={{ color: "#666", textAlign: "center", padding: "24px 0", fontSize: 13 }}>
              Koi expense nahi add kiya
            </div>
          ) : (
            <>
              {/* Pie Chart */}
              <div style={{ padding: "20px 0 8px", display: "flex", justifyContent: "center" }}>
                <PieChart data={catData} />
              </div>

              {/* Expense List */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Expense History
                </div>
                {userExpenses.map((e, i) => {
                  const dt = new Date(e.date);
                  const dateStr = dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                  const catColor = CATEGORY_COLORS[e.category] || "#a78bfa";
                  return (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: "#ffffff08",
                      borderRadius: 10,
                      marginBottom: 6,
                      border: `1px solid ${catColor}22`,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: catColor, flexShrink: 0,
                        boxShadow: `0 0 6px ${catColor}`,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {e.title}
                        </div>
                        <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
                          <span style={{
                            background: `${catColor}22`, color: catColor,
                            padding: "1px 7px", borderRadius: 10, fontSize: 10,
                          }}>{e.category}</span>
                          {" · "}{dateStr}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: catColor, flexShrink: 0 }}>
                        ₹{parseFloat(e.amount).toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* User Total */}
              <div style={{
                marginTop: 12,
                padding: "12px 16px",
                background: "linear-gradient(135deg, #4c1d9533, #1e1b4b)",
                borderRadius: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #a78bfa33",
              }}>
                <span style={{ color: "#aaa", fontSize: 13 }}>Total Spent</span>
                <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 18 }}>₹{total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────
export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, expensesRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/expenses"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setExpenses(expensesRes.data.expenses);
    } catch (err) {
      if (err.response?.status === 403) setError("Access denied — Admin only");
      else setError("Kuch galat ho gaya, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={S.center}>
      <div style={S.spinner} />
      <div style={{ color: "#a78bfa", marginTop: 16, fontSize: 14 }}>Loading dashboard...</div>
    </div>
  );

  if (error) return (
    <div style={S.center}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ color: "#f472b6", fontSize: 16, marginTop: 12 }}>{error}</div>
      <button onClick={() => navigate("/")} style={S.btn}>Wapas Jao</button>
    </div>
  );

  const tabs = ["users", "stats"];

  return (
    <div style={S.page}>
      {/* Background decoration */}
      <div style={S.bgBlob1} />
      <div style={S.bgBlob2} />

      <div style={S.container}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <div style={{ fontSize: 11, color: "#a78bfa", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
              Admin Panel
            </div>
            <h1 style={S.title}>Dashboard 🛡️</h1>
          </div>
          <button onClick={fetchAll} style={S.refreshBtn}>↻ Refresh</button>
        </div>

        {/* Stat Cards */}
        <div style={S.cardRow}>
          <StatCard icon="👥" label="Total Users" value={stats?.totalUsers} color="#a78bfa" />
          <StatCard icon="💸" label="Total Expenses" value={stats?.totalExpenses} color="#f472b6" />
          <StatCard icon="💰" label="Total Amount" value={`₹${parseFloat(stats?.totalAmount || 0).toFixed(0)}`} color="#34d399" />
        </div>

        {/* Tabs */}
        <div style={S.tabRow}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...S.tabBtn,
                background: activeTab === tab
                  ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                  : "#ffffff0a",
                color: activeTab === tab ? "#fff" : "#888",
                border: activeTab === tab ? "1px solid #7c3aed" : "1px solid #ffffff11",
                boxShadow: activeTab === tab ? "0 4px 16px #7c3aed44" : "none",
              }}
            >
              {tab === "users" ? "👤 Users" : "📊 Stats"}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
              {users.length} registered user{users.length !== 1 ? "s" : ""} — click to expand
            </div>
            {users.map(user => (
              <UserCard key={user.id} user={user} expenses={expenses} />
            ))}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div>
            {/* Overall Pie */}
            <div style={S.statsCard}>
              <div style={S.cardTitle}>📊 Category-wise Breakdown</div>
              <PieChart data={stats?.categoryStats || []} />
            </div>

            {/* Category Table */}
            <div style={S.statsCard}>
              <div style={S.cardTitle}>💡 Category Details</div>
              {stats?.categoryStats?.map((c, i) => {
                const color = CATEGORY_COLORS[c.category] || COLORS[i % COLORS.length];
                const pct = ((parseFloat(c.total) / parseFloat(stats.totalAmount)) * 100).toFixed(1);
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                        <span style={{ color: "#e2e8f0", fontSize: 13, textTransform: "capitalize" }}>{c.category}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color, fontWeight: 700, fontSize: 13 }}>₹{parseFloat(c.total).toFixed(0)}</span>
                        <span style={{ color: "#666", fontSize: 11, marginLeft: 6 }}>{c.count} entries</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: "#ffffff0a", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        borderRadius: 3, transition: "width 1s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f0f1a; }
        ::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 2px; }
      `}</style>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1a 0%, #1a0533 50%, #0f0f1a 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  bgBlob1: {
    position: "fixed", top: -100, right: -100,
    width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, #7c3aed22, transparent 70%)",
    pointerEvents: "none",
  },
  bgBlob2: {
    position: "fixed", bottom: -100, left: -100,
    width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, #4f46e522, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "24px 16px 48px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: "clamp(22px, 5vw, 32px)",
    fontWeight: 800,
    background: "linear-gradient(135deg, #a78bfa, #f472b6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  refreshBtn: {
    background: "#ffffff0a",
    border: "1px solid #ffffff15",
    color: "#a78bfa",
    padding: "8px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  cardRow: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  tabRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  tabBtn: {
    padding: "10px 20px",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  statsCard: {
    background: "linear-gradient(135deg, #1e1b4b 0%, #1a1a2e 100%)",
    border: "1px solid #3730a333",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 4px 32px #0005",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#e2e8f0",
    marginBottom: 16,
    letterSpacing: "0.02em",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f0f1a",
    gap: 12,
  },
  spinner: {
    width: 40, height: 40,
    border: "3px solid #3730a3",
    borderTop: "3px solid #a78bfa",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  btn: {
    marginTop: 8,
    padding: "10px 24px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
};