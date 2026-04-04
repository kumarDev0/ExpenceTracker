// adminRoutes.js
// Saare admin routes yahan hain
// authenticate — pehle login check
// isAdmin — phir admin check

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { 
  getAllUsers, 
  getAllExpenses, 
  getStats 
} = require('../controllers/adminController');

// Teeno routes pe dono middleware lagte hain
router.get('/users', authenticate, isAdmin, getAllUsers);
router.get('/expenses', authenticate, isAdmin, getAllExpenses);
router.get('/stats', authenticate, isAdmin, getStats);

module.exports = router;