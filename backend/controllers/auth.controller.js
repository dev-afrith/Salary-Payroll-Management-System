const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, 'admin']
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Employee Login
const employeeLogin = async (req, res) => {
  try {
    const { employee_id, password } = req.body;

    if (!employee_id || !password) {
      return res.status(400).json({ message: 'Employee ID and password are required.' });
    }

    const [users] = await db.query(
      'SELECT u.*, e.id as employee_db_id, e.full_name, e.department_id, e.designation_id, e.employee_id as emp_code FROM users u JOIN employees e ON u.employee_id = e.employee_id WHERE u.employee_id = ? AND u.role = ?',
      [employee_id, 'employee']
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid Employee ID or password.' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is not yet activated. Please contact HR.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Employee ID or password.' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role, employee_id: user.emp_code, employee_db_id: user.employee_db_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employee_id: user.emp_code,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, employee_id, email, role, is_active, last_login FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    // If employee, get extra info
    if (user.role === 'employee' && user.employee_id) {
      const [employees] = await db.query(
        `SELECT e.*, d.name as department_name, des.name as designation_name 
         FROM employees e 
         LEFT JOIN departments d ON e.department_id = d.id 
         LEFT JOIN designations des ON e.designation_id = des.id 
         WHERE e.employee_id = ?`,
        [user.employee_id]
      );
      if (employees.length > 0) {
        user.employee = employees[0];
      }
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Logout (client-side token removal, but we acknowledge)
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully.' });
};

module.exports = { adminLogin, employeeLogin, getMe, logout };
