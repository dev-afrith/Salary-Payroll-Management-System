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

    // Normalized: Join with employees to verify email
    const [users] = await db.query(
      'SELECT u.*, e.email FROM users u JOIN employees e ON u.employee_id = e.employee_id WHERE e.email = ? AND u.role = ?',
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

    // Normalized: Join with employees for full context
    const [users] = await db.query(
      'SELECT u.*, e.id as employee_db_id, e.full_name, e.email, e.department_id, e.designation_id, e.employee_id as emp_code FROM users u JOIN employees e ON u.employee_id = e.employee_id WHERE u.employee_id = ? AND u.role = ?',
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
      { 
        id: user.id, 
        role: user.role, 
        employee_id: user.emp_code, 
        employee_db_id: user.employee_db_id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employee_id: user.emp_code,
        employee_db_id: user.employee_db_id,
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
    // Normalized: Fetch email from employees table
    const [users] = await db.query(
      'SELECT u.id, u.employee_id, u.role, u.is_active, u.last_login, e.email FROM users u JOIN employees e ON u.employee_id = e.employee_id WHERE u.id = ?', 
      [req.user.id]
    );

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
        user.employee_db_id = employees[0].id;
        user.full_name = employees[0].full_name;
      }
    } else if (user.role === 'admin') {
      user.full_name = 'Admin';
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Logout
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully.' });
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { employee_id, phone } = req.body;

    if (!employee_id || !phone) {
      return res.status(400).json({ message: 'Employee ID and mobile number are required.' });
    }

    // Verify the employee exists and phone matches
    const [employees] = await db.query(
      'SELECT id, employee_id, full_name, phone FROM employees WHERE employee_id = ? AND phone = ?',
      [employee_id, phone]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'No employee found with this ID and mobile number combination.' });
    }

    const emp = employees[0];

    // Check if a pending request already exists
    const [existing] = await db.query(
      "SELECT id FROM password_reset_requests WHERE employee_code = ? AND status = 'Pending'",
      [employee_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'A password reset request is already pending. Please wait for admin approval.' });
    }

    // Create the request
    await db.query(
      'INSERT INTO password_reset_requests (employee_code, employee_db_id, phone) VALUES (?, ?, ?)',
      [employee_id, emp.id, phone]
    );

    res.status(201).json({ message: 'Password reset request submitted successfully. Please wait for admin approval.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing request.' });
  }
};

// Get Reset Requests
const getResetRequests = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT prr.*, e.full_name, e.email, e.employee_id as emp_code
      FROM password_reset_requests prr
      LEFT JOIN employees e ON prr.employee_db_id = e.id
      ORDER BY prr.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reset requests:', error);
    res.status(500).json({ message: 'Error fetching reset requests.' });
  }
};

// Approve Reset Request
const approveResetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    // Get the request
    const [requests] = await db.query('SELECT * FROM password_reset_requests WHERE id = ?', [id]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Reset request not found.' });
    }

    const request = requests[0];
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'This request has already been processed.' });
    }

    // Hash the new password and update the users table
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.query(
      'UPDATE users SET password = ? WHERE employee_id = ?',
      [hashedPassword, request.employee_code]
    );

    // Mark request as approved
    await db.query(
      "UPDATE password_reset_requests SET status = 'Approved' WHERE id = ?",
      [id]
    );

    res.json({ message: 'Password reset approved. Employee can now login with the new password.' });
  } catch (error) {
    console.error('Error approving reset request:', error);
    res.status(500).json({ message: 'Error approving reset request.' });
  }
};

// Reject Reset Request
const rejectResetRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await db.query('SELECT * FROM password_reset_requests WHERE id = ?', [id]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Reset request not found.' });
    }

    if (requests[0].status !== 'Pending') {
      return res.status(400).json({ message: 'This request has already been processed.' });
    }

    await db.query(
      "UPDATE password_reset_requests SET status = 'Rejected' WHERE id = ?",
      [id]
    );

    res.json({ message: 'Password reset request rejected.' });
  } catch (error) {
    console.error('Error rejecting reset request:', error);
    res.status(500).json({ message: 'Error rejecting reset request.' });
  }
};

module.exports = { adminLogin, employeeLogin, getMe, logout, forgotPassword, getResetRequests, approveResetRequest, rejectResetRequest };
