// adminController.js
// Sirf admin ke liye — saare users aur expenses dekho

const pool = require('../config/db');

// ─── SAARE USERS DEKHO ────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({
      totalUsers: users.length,
      users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── SAARE EXPENSES DEKHO ─────────────────────────────────────
const getAllExpenses = async (req, res) => {
  try {
    const [expenses] = await pool.execute(
      `SELECT e.id, u.name as userName, u.email, 
              e.title, e.amount, e.category, e.date
       FROM expenses e
       JOIN users u ON e.user_id = u.id
       ORDER BY e.date DESC`
    );

    const total = expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount), 0
    );

    res.json({
      totalExpenses: expenses.length,
      totalAmount: total.toFixed(2),
      expenses
    });
  } catch (error) {
    console.error('Admin expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── OVERALL STATS ────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.execute(
      'SELECT COUNT(*) as totalUsers FROM users'
    );

    const [[{ totalExpenses, totalAmount }]] = await pool.execute(
      'SELECT COUNT(*) as totalExpenses, COALESCE(SUM(amount), 0) as totalAmount FROM expenses'
    );

    const [categoryStats] = await pool.execute(
      `SELECT category, COUNT(*) as count, SUM(amount) as total
       FROM expenses
       GROUP BY category
       ORDER BY total DESC`
    );

    res.json({
      totalUsers,
      totalExpenses,
      totalAmount: parseFloat(totalAmount).toFixed(2),
      categoryStats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getAllExpenses, getStats };