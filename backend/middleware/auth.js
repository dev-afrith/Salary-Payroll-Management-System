const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Auto-polyfill employee_db_id for old login tokens
    if (decoded.role === 'employee' && !decoded.employee_db_id && decoded.employee_id) {
      try {
        const [rows] = await db.query('SELECT id FROM employees WHERE employee_id = ?', [decoded.employee_id]);
        if (rows.length > 0) {
          decoded.employee_db_id = rows[0].id;
        }
      } catch (err) {
        console.error('Middleware DB error:', err);
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

const isEmployee = (req, res, next) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Access denied. Employee only.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isEmployee };
