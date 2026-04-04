// Admin.jsx
// Sirf admin dekh sakta hai ye page
// Stats, Users aur Expenses teen sections hain

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

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
      if (err.response?.status === 403) {
        setError("Access denied — Admin only");
      } else {
        setError("Kuch galat ho gaya, dobara try karo");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={styles.center}>
      <p>Loading...</p>
    </div>
  );

  if (error) return (
    <div style={styles.center}>
      <p style={{ color: "red" }}>{error}</p>
      <button onClick={() => navigate("/")} style={styles.btn}>
        Wapas Jao
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Admin Dashboard</h1>

      {/* Stats Cards */}
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <h2>{stats?.totalUsers}</h2>
          <p>Total Users</p>
        </div>
        <div style={styles.card}>
          <h2>{stats?.totalExpenses}</h2>
          <p>Total Expenses</p>
        </div>
        <div style={styles.card}>
          <h2>₹{stats?.totalAmount}</h2>
          <p>Total Amount</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        {["stats", "users", "expenses"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tabBtn,
              background: activeTab === tab ? "#6366f1" : "#1e1e2e",
              color: activeTab === tab ? "#fff" : "#aaa",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Category Stats */}
      {activeTab === "stats" && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Count</th>
              <th style={styles.th}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {stats?.categoryStats.map((c) => (
              <tr key={c.category}>
                <td style={styles.td}>{c.category}</td>
                <td style={styles.td}>{c.count}</td>
                <td style={styles.td}>₹{parseFloat(c.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Users Table */}
      {activeTab === "users" && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={styles.td}>{u.id}</td>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  {new Date(u.created_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Expenses Table */}
      {activeTab === "expenses" && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td style={styles.td}>{e.userName}</td>
                <td style={styles.td}>{e.title}</td>
                <td style={styles.td}>₹{e.amount}</td>
                <td style={styles.td}>{e.category}</td>
                <td style={styles.td}>
                  {new Date(e.date).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
    color: "#fff",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "24px",
    color: "#6366f1",
  },
  cardRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },
  card: {
    background: "#1e1e2e",
    borderRadius: "12px",
    padding: "24px 32px",
    textAlign: "center",
    flex: "1",
    minWidth: "150px",
  },
  tabRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  tabBtn: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#1e1e2e",
    borderRadius: "12px",
    overflow: "hidden",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    background: "#2a2a3e",
    color: "#aaa",
    fontSize: "13px",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #2a2a3e",
    fontSize: "14px",
  },
  btn: {
    padding: "10px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "16px",
  },
};