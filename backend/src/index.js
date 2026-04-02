const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes'); // naya line
const expenseRoutes = require('./routes/expenseRoutes'); // naya

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // naya line
app.use('/api/expenses', expenseRoutes); // naya

app.get('/health', (req, res) => {
  res.json({ status: 'Server chal raha hai!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});