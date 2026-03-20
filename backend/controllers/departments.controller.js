const db = require('../config/db');

// Get all departments
const getDepartments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM departments ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments' });
  }
};

// Create a department
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const [result] = await db.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Department name already exists' });
    }
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Error creating department' });
  }
};

// Update a department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    await db.query(
      'UPDATE departments SET name = ?, description = ?, is_active = ? WHERE id = ?',
      [name, description, is_active, id]
    );
    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Error updating department' });
  }
};

// Delete a department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if any employees belong to this department
    const [employees] = await db.query('SELECT id FROM employees WHERE department_id = ? LIMIT 1', [id]);
    if (employees.length > 0) {
      return res.status(400).json({ message: 'Cannot delete department with assigned employees' });
    }

    await db.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Error deleting department' });
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
