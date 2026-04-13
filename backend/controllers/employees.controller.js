/**
 * Employee Controller - Module 2 (3NF Normalized)
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Get all employees (Search, Filter, Pagination)
const getEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, d.name as department_name, des.name as designation_name,
             ef.bank_account_number, ef.ifsc_code, ef.pan_number, ef.pf_number, ef.uan_number
      FROM employees e
      LEFT JOIN employee_finance ef ON e.id = ef.employee_id
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
             ef.bank_account_number, ef.ifsc_code, ef.pan_number, ef.pf_number, ef.uan_number,
             s.basic_pay, s.hra_percent, s.da_amount, s.special_allowance, s.overtime_rate
      FROM employees e
      LEFT JOIN employee_finance ef ON e.id = ef.employee_id
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
      full_name, email, phone, gender, date_of_birth, date_of_joining, address,
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

    // 1. Insert into employees (Identity)
    const [empResult] = await connection.query(`
      INSERT INTO employees (
        employee_id, full_name, email, phone, gender, date_of_birth, date_of_joining, address,
        department_id, designation_id, employment_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `, [
      nextId, full_name, email, phone, gender, date_of_birth, date_of_joining, address,
      department_id, designation_id, employment_type
    ]);

    const employeeDbId = empResult.insertId;

    // 2. Insert into employee_finance (Sensitive Data)
    await connection.query(`
      INSERT INTO employee_finance (
        employee_id, bank_account_number, ifsc_code, pan_number, pf_number, uan_number
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [employeeDbId, bank_account_number, ifsc_code, pan_number, pf_number, uan_number]);

    // 3. Insert into users (Auth)
    const hashedPassword = await bcrypt.hash(password || 'Emp@123', 10);
    await connection.query(`
      INSERT INTO users (employee_id, password, role, is_active)
      VALUES (?, ?, 'employee', FALSE)
    `, [nextId, hashedPassword]);

    // 4. Insert into salary_structure
    await connection.query(`
      INSERT INTO salary_structure (employee_id, basic_pay)
      VALUES (?, ?)
    `, [employeeDbId, basic_pay || 0]);

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
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const updateData = req.body;

    // Verify employee exists
    const [existing] = await connection.query('SELECT employee_id FROM employees WHERE id = ?', [id]);
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Employee not found' });
    }

    // 1. Update Core Employee Identity
    const coreFields = [
      'full_name', 'email', 'phone', 'gender', 'date_of_birth', 'date_of_joining',
      'department_id', 'designation_id', 'employment_type', 'address'
    ];
    const coreClauses = [];
    const coreParams = [];
    for (const key of coreFields) {
      if (updateData[key] !== undefined) {
        coreClauses.push(`${key} = ?`);
        coreParams.push(updateData[key]);
      }
    }
    if (coreClauses.length > 0) {
      coreParams.push(id);
      await connection.query(`UPDATE employees SET ${coreClauses.join(', ')} WHERE id = ?`, coreParams);
    }

    // 2. Update Financial Details
    const financeFields = ['bank_account_number', 'ifsc_code', 'pan_number', 'pf_number', 'uan_number'];
    const financeClauses = [];
    const financeParams = [];
    for (const key of financeFields) {
      if (updateData[key] !== undefined) {
        financeClauses.push(`${key} = ?`);
        financeParams.push(updateData[key]);
      }
    }
    if (financeClauses.length > 0) {
      financeParams.push(id);
      await connection.query(`UPDATE employee_finance SET ${financeClauses.join(', ')} WHERE employee_id = ?`, financeParams);
    }

    // 3. Update Salary Structure
    if (updateData.basic_pay !== undefined) {
      await connection.query('UPDATE salary_structure SET basic_pay = ? WHERE employee_id = ?', [updateData.basic_pay, id]);
    }

    await connection.commit();
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists for another employee' });
    }
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
  } finally {
    connection.release();
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

    // Cascading deletes handled by DB but we manually clean users for clarity
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
