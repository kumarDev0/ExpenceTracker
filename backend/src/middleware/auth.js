// middleware/auth.js
// Middleware = Security guard
// Har protected route pe pehle ye chalega
// Agar token valid hai → req.user mein user info daalo → aage jaane do
// Agar token invalid/missing → rok do, 401 bhejo

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Token kahan hota hai? — Authorization header mein
  // Format: "Bearer eyJhbGc..."
  const authHeader = req.headers.authorization;

  // Token hai hi nahi
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  // "Bearer " hata ke sirf token nikalo
  const token = authHeader.split(' ')[1];

  try {
    // Verify karo — secret se match karo
    // Agar token tamper hua hoga toh ye error throw karega
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User info request mein daal do — controller use karega
    req.user = decoded; // { userId, email }

    next(); // Security guard ne haath hilaya — aage jao
  } catch (error) {
    // Token expired ya fake
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = authenticate;