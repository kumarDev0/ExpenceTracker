const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authenticate = require('../middleware/auth');
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getSummary
} = require('../controllers/expenseController');

// Validation rules
const expenseValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title required')
    .isLength({ max: 200 }).withMessage('Title too long'),

  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be positive number'),

  body('category')
    .isIn(['food', 'transport', 'entertainment', 'shopping', 'health', 'other'])
    .withMessage('Invalid category'),

  body('date')
    .isDate().withMessage('Valid date required')
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid expense ID')
];

// Saare routes pe authenticate middleware lagao
// Matlab: bina login ke koi bhi ye routes access nahi kar sakta
// authenticate pehle chalega, phir controller
router.get('/summary', authenticate, getSummary);
router.get('/', authenticate, getExpenses);
router.post('/', authenticate, expenseValidation, createExpense);
router.put('/:id', authenticate, idValidation, expenseValidation, updateExpense);
router.delete('/:id', authenticate, idValidation, deleteExpense);

module.exports = router;