/**
 * Employee Controller - Module 2
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Get all employees (Search, Filter, Pagination)
const getEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, d.name as department_name, des.name as designation_name 
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations des ON e.designation_id = des.id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (e.full_name LIKE ? OR e.employee_id LIKE ? OR e.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      query += ' AND e.department_id = ?';
      params.push(department);
    }

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    // Get total count for pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);
    const total = countResult[0].total;

    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    res.json({
      employees: rows,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

// Get single employee profile
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT e.*, d.name as department_name, des.name as designation_name,
             s.basic_pay, s.hra_percent, s.da_amount, s.special_allowance, s.overtime_rate
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations des ON e.designation_id = des.id
      LEFT JOIN salary_structure s ON e.id = s.employee_id
      WHERE e.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
};

// Create employee
const createEmployee = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      full_name, email, phone, gender, date_of_birth, date_of_joining,
      department_id, designation_id, employment_type,
      bank_account_number, ifsc_code, pan_number, pf_number, uan_number,
      basic_pay, password // Admin sets initial password
    } = req.body;

    // Auto-generate employee ID
    const [lastEmp] = await connection.query('SELECT employee_id FROM employees ORDER BY id DESC LIMIT 1');
    let nextId = 'EMP001';
    if (lastEmp.length > 0) {
      const num = parseInt(lastEmp[0].employee_id.replace('EMP', '')) + 1;
      nextId = 'EMP' + num.toString().padStart(3, '0');
    }

    // 1. Insert into employees
    const [empResult] = await connection.query(`
      INSERT INTO employees (
        employee_id, full_name, email, phone, gender, date_of_birth, date_of_joining,
        department_id, designation_id, employment_type, bank_account_number, ifsc_code,
        pan_number, pf_number, uan_number, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `, [
      nextId, full_name, email, phone, gender, date_of_birth, date_of_joining,
      department_id, designation_id, employment_type, bank_account_number, ifsc_code,
      pan_number, pf_number, uan_number
    ]);

    const employeeId = empResult.insertId;

    // 2. Insert into users (Auth)
    const hashedPassword = await bcrypt.hash(password || 'Emp@123', 10);
    await connection.query(`
      INSERT INTO users (employee_id, email, password, role, is_active)
      VALUES (?, ?, ?, 'employee', FALSE)
    `, [nextId, email, hashedPassword]);

    // 3. Insert into salary_structure
    await connection.query(`
      INSERT INTO salary_structure (employee_id, basic_pay)
      VALUES (?, ?)
    `, [employeeId, basic_pay || 0]);

    await connection.commit();
    res.status(201).json({ message: 'Employee registered successfully', employee_id: nextId });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email or Employee ID already exists' });
    }
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee' });
  } finally {
    connection.release();
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Clean data for update
    const allowedFields = [
      'full_name', 'phone', 'gender', 'date_of_birth', 'date_of_joining',
      'department_id', 'designation_id', 'employment_type',
      'bank_account_number', 'ifsc_code', 'pan_number', 'pf_number', 'uan_number'
    ];
    
    let query = 'UPDATE employees SET ';
    let params = [];
    Object.keys(updateData).forEach((key, index) => {
      if (allowedFields.includes(key)) {
        query += `${key} = ?${index === allowedFields.length - 1 ? '' : ', '}`;
        params.push(updateData[key]);
      }
    });

    // Remove trailing comma if any
    query = query.replace(/,\s*$/, '');
    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
};

// Approve Employee
const approveEmployee = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    const [employees] = await connection.query('SELECT employee_id FROM employees WHERE id = ?', [id]);
    if (employees.length === 0) return res.status(404).json({ message: 'Employee not found' });

    const empCode = employees[0].employee_id;

    // Update employee status
    await connection.query("UPDATE employees SET status = 'Approved' WHERE id = ?", [id]);
    // Activate user login
    await connection.query("UPDATE users SET is_active = TRUE WHERE employee_id = ?", [empCode]);

    await connection.commit();
    res.json({ message: 'Employee approved and login activated' });
  } catch (error) {
    await connection.rollback();
    console.error('Error approving employee:', error);
    res.status(500).json({ message: 'Error approving employee' });
  } finally {
    connection.release();
  }
};

// Reject Employee
const rejectEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE employees SET status = 'Rejected' WHERE id = ?", [id]);
    res.json({ message: 'Employee rejected' });
  } catch (error) {
    console.error('Error rejecting employee:', error);
    res.status(500).json({ message: 'Error rejecting employee' });
  }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    const [employees] = await connection.query('SELECT employee_id FROM employees WHERE id = ?', [id]);
    if (employees.length === 0) return res.status(404).json({ message: 'Employee not found' });

    const empCode = employees[0].employee_id;

    // Delete from users, salary_structure, then employees
    await connection.query('DELETE FROM users WHERE employee_id = ?', [empCode]);
    await connection.query('DELETE FROM employees WHERE id = ?', [id]);

    await connection.commit();
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  approveEmployee,
  rejectEmployee,
  deleteEmployee
};
