const db = require('../config/db');

// Get salary structure for an employee
const getSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const [rows] = await db.query(
      `SELECT ss.*, e.full_name, e.employee_id as emp_code, e.email, d.name as department_name, des.name as designation_name
       FROM salary_structure ss
       JOIN employees e ON ss.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       WHERE ss.employee_id = ?`,
      [employeeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Salary structure not found for this employee' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching salary structure:', error);
    res.status(500).json({ message: 'Error fetching salary structure' });
  }
};

// Get all salary structures (Admin overview)
const getAllSalaryStructures = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ss.*, e.full_name, e.employee_id as emp_code,
              d.name as department_name, des.name as designation_name
       FROM salary_structure ss
       JOIN employees e ON ss.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       WHERE e.status = 'Approved'
       ORDER BY e.full_name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching salary structures:', error);
    res.status(500).json({ message: 'Error fetching salary structures' });
  }
};

// Update salary structure for an employee
const updateSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { basic_pay, hra_percent, da_amount, special_allowance, overtime_rate, effective_from } = req.body;

    // Upsert — insert if not exists, update if exists
    const [existing] = await db.query('SELECT id FROM salary_structure WHERE employee_id = ?', [employeeId]);

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO salary_structure (employee_id, basic_pay, hra_percent, da_amount, special_allowance, overtime_rate, effective_from)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employeeId, basic_pay, hra_percent || 40, da_amount || 0, special_allowance || 0, overtime_rate || 0, effective_from || new Date()]
      );
    } else {
      await db.query(
        `UPDATE salary_structure 
         SET basic_pay = ?, hra_percent = ?, da_amount = ?, special_allowance = ?, overtime_rate = ?, effective_from = ?
         WHERE employee_id = ?`,
        [basic_pay, hra_percent || 40, da_amount || 0, special_allowance || 0, overtime_rate || 0, effective_from || new Date(), employeeId]
      );
    }

    res.json({ message: 'Salary structure updated successfully' });
  } catch (error) {
    console.error('Error updating salary structure:', error);
    res.status(500).json({ message: 'Error updating salary structure' });
  }
};

module.exports = { getSalaryStructure, getAllSalaryStructures, updateSalaryStructure };
