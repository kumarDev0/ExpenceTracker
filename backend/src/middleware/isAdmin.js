// isAdmin.js
// Ye check karta hai ki jo request aa rahi hai
// wo admin ki hai ya nahi
// Pehle authenticate chalega, phir isAdmin

const isAdmin = (req, res, next) => {
  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ 
      message: 'Access denied — Admin only' 
    });
  }
  next();
};

module.exports = isAdmin;