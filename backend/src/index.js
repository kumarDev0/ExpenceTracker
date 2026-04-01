const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Security middleware — pehle lagao
app.use(helmet());         // Security headers automatically
app.use(cors({
  origin: 'http://localhost:5173',  // Sirf apna frontend allowed
  credentials: true
}));
app.use(express.json());   // JSON body parse karna

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'Server chal raha hai!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});