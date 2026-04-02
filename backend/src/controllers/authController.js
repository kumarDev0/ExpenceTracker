// controllers/authController.js
// Controller ka kaam: Request aaya → process karo → response do
// Sochna: Ye ek "handler" hai — jaise customer care executive jo call uthata hai

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// ─── REGISTER ────────────────────────────────────────────────
const register = async (req, res) => {
  // Step 1: Pehle check karo — koi validation error toh nahi?
  // express-validator ne pehle check kiya hoga (route mein lagega)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 = Bad Request — user ne galat data bheja
    return res.status(400).json({ errors: errors.array() });
  }

  // Step 2: User ne jo bheja wo nikalo
  const { name, email, password } = req.body;

  try {
    // Step 3: Email pehle se exist karta hai kya?
    // Kyun check karo? — duplicate users nahi chahiye
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]  // ? = placeholder — SQL injection se bachata hai!
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
      // 409 = Conflict — ye resource already exist karta hai
    }

    // Step 4: Password hash karo — KABHI plain text store mat karo
    // 12 = "salt rounds" — jitna zyada, utna secure, utna slow
    // Industry standard: 10-12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Step 5: Database mein save karo
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Step 6: Token banao — user ko login kiya hua consider karo
    const token = jwt.sign(
      { userId: result.insertId, email },  // Payload — kya store karna hai token mein
      process.env.JWT_SECRET,              // Secret key — sirf server ko pata hai
      { expiresIn: '7d' }                  // 7 din baad expire — security ke liye
    );

    // Step 7: Response bhejo — password wapas mat bhejo!
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email
        // password yahan nahi — never expose password
      }
    });
    // 201 = Created — naya resource bana

  } catch (error) {
    console.error('Register error:', error);
    // 500 = Internal Server Error — hamari galti
    res.status(500).json({ message: 'Server error, try again' });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Step 1: Email se user dhundo
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // Step 2: User mila? Nahi mila toh...
    // IMPORTANT: "User not found" mat likho — attacker ko pata chalega
    // ki email exist karta hai ya nahi. Hamesha generic message do.
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Step 3: Password compare karo
    // bcrypt.compare: user ne jo diya vs DB mein jo hash hai
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
      // Same message — attacker confuse rehta hai
    }

    // Step 4: Token banao aur bhejo
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error, try again' });
  }
};

module.exports = { register, login };