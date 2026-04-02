// expenseController.js
// Ye poora file ek hi cheez karta hai:
// Sirf logged-in user ke apne expenses handle karna
// Koi aur user kisi aur ka data nahi dekh sakta — ye security ka core hai

const pool = require('../config/db');
const { validationResult } = require('express-validator');

// ─── CREATE EXPENSE ──────────────────────────────────────────
const createExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // req.user middleware ne set kiya tha — wahan se user ki id milti hai
  // Ye bahut important hai — client se user_id kabhi mat lo!
  // Kyun? — Koi bhi apna user_id badal ke doosre ka data likhne ki koshish kar sakta hai
  const userId = req.user.userId;
  const { title, amount, category, date } = req.body;

  try {
    const [result] = await pool.execute(
      `INSERT INTO expenses (user_id, title, amount, category, date)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, amount, category, date]
    );

    // Naya expense wapas bhejo — frontend ko chahiye hoga UI update ke liye
    res.status(201).json({
      message: 'Expense added',
      expense: {
        id: result.insertId,
        userId,
        title,
        amount,
        category,
        date
      }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET ALL EXPENSES ────────────────────────────────────────
const getExpenses = async (req, res) => {
  const userId = req.user.userId;

  // Query params se filters — ?category=food&month=2025-01
  // Ye optional hain — na ho toh saare expenses
  const { category, month, sort } = req.query;

  // Dynamic query build karenge — conditions ke hisaab se
  // Kyun dynamic? — Filters optional hain, har combination ke liye alag query likhna paagalpan hai
  let query = `
    SELECT id, title, amount, category, date, created_at
    FROM expenses
    WHERE user_id = ?
  `;
  const params = [userId];

  // Category filter add karo agar diya ho
  if (category) {
    query += ` AND category = ?`;
    params.push(category);
  }

  // Month filter — "2025-01" diya toh us mahine ke expenses
  if (month) {
    query += ` AND DATE_FORMAT(date, '%Y-%m') = ?`;
    params.push(month);
  }

  // Sorting — latest pehle ya purane pehle
  // IMPORTANT: sort value directly query mein mat daalo — SQL injection ka risk
  // Whitelist approach: sirf allowed values accept karo
  const allowedSorts = ['date_desc', 'date_asc', 'amount_desc', 'amount_asc'];
  const sortMap = {
    'date_desc':   'date DESC',
    'date_asc':    'date ASC',
    'amount_desc': 'amount DESC',
    'amount_asc':  'amount ASC'
  };
  const sortClause = allowedSorts.includes(sort) ? sortMap[sort] : 'date DESC';
  query += ` ORDER BY ${sortClause}`;

  try {
    const [expenses] = await pool.execute(query, params);

    // Total bhi calculate karo — frontend ko helpful hoga
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    res.json({
      expenses,
      count: expenses.length,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── UPDATE EXPENSE ──────────────────────────────────────────
const updateExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.userId;
  const expenseId = req.params.id; // URL se aata hai — /expenses/:id
  const { title, amount, category, date } = req.body;

  try {
    // Pehle check karo — ye expense exist karta hai AUR is user ka hai?
    // Dono check ek saath — 2 queries ki zaroorat nahi
    const [existing] = await pool.execute(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, userId]
    );

    // Agar mile nahi — do cases hain:
    // 1. Expense exist hi nahi karta
    // 2. Exist karta hai but kisi aur ka hai
    // Dono case mein same response — attacker ko pata nahi chalega
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await pool.execute(
      `UPDATE expenses
       SET title = ?, amount = ?, category = ?, date = ?
       WHERE id = ? AND user_id = ?`,
      [title, amount, category, date, expenseId, userId]
    );

    res.json({
      message: 'Expense updated',
      expense: { id: expenseId, title, amount, category, date }
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE EXPENSE ──────────────────────────────────────────
const deleteExpense = async (req, res) => {
  const userId = req.user.userId;
  const expenseId = req.params.id;

  try {
    // WHERE mein user_id bhi daal — warna koi bhi kisi ka bhi delete kar sakta hai
    // Ye "Authorization" hai — sirf apna data modify karo
    const [result] = await pool.execute(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, userId]
    );

    // affectedRows = kitni rows delete hui
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── SUMMARY ─────────────────────────────────────────────────
const getSummary = async (req, res) => {
  const userId = req.user.userId;

  try {
    // SQL mein hi calculation karo — Node mein loop mat lagao
    // Kyun? — Database calculations ke liye optimized hai
    // 1000 records par Node mein loop slow, MySQL mein fast
    const [categoryTotals] = await pool.execute(
      `SELECT
         category,
         COUNT(*) as count,
         SUM(amount) as total,
         AVG(amount) as average
       FROM expenses
       WHERE user_id = ?
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    // Is month ka total
    const [monthlyTotal] = await pool.execute(
      `SELECT
         COALESCE(SUM(amount), 0) as total,
         COUNT(*) as count
       FROM expenses
       WHERE user_id = ?
         AND MONTH(date) = MONTH(CURDATE())
         AND YEAR(date) = YEAR(CURDATE())`,
      [userId]
    );

    res.json({
      byCategory: categoryTotals,
      thisMonth: monthlyTotal[0]
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getSummary
};