// routes/authRoutes.js
// Route = Address — kaunsi URL pe kaunsa controller chalega
// Sochna: Route ek menu card hai, Controller chef hai

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { body } = require('express-validator');

// Validation rules — controller se pehle chalti hain
const registerValidation = [
  body('name')
    .trim()                          // spaces hata
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name too short'),

  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),               // lowercase kar do

  body('password')
    .isLength({ min: 6 }).withMessage('Password min 6 characters')
    .matches(/\d/).withMessage('Password must contain a number')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

module.exports = router;