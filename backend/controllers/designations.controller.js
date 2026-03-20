const db = require('../config/db');

// Get all designations
const getDesignations = async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = 'SELECT des.*, d.name as department_name FROM designations des LEFT JOIN departments d ON des.department_id = d.id';
    let params = [];
    
    if (department_id) {
      query += ' WHERE des.department_id = ?';
      params.push(department_id);
    }
    
    query += ' ORDER BY des.id DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching designations:', error);
    res.status(500).json({ message: 'Error fetching designations' });
  }
};

// Create a designation
const createDesignation = async (req, res) => {
  try {
    const { name, department_id } = req.body;
    if (!name || !department_id) {
      return res.status(400).json({ message: 'Name and Department ID are required' });
    }

    const [result] = await db.query(
      'INSERT INTO designations (name, department_id) VALUES (?, ?)',
      [name, department_id]
    );
    res.status(201).json({ id: result.insertId, name, department_id });
  } catch (error) {
    console.error('Error creating designation:', error);
    res.status(500).json({ message: 'Error creating designation' });
  }
};

// Update a designation
const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department_id, is_active } = req.body;

    await db.query(
      'UPDATE designations SET name = ?, department_id = ?, is_active = ? WHERE id = ?',
      [name, department_id, is_active, id]
    );
    res.json({ message: 'Designation updated successfully' });
  } catch (error) {
    console.error('Error updating designation:', error);
    res.status(500).json({ message: 'Error updating designation' });
  }
};

// Delete a designation
const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if any employees have this designation
    const [employees] = await db.query('SELECT id FROM employees WHERE designation_id = ? LIMIT 1', [id]);
    if (employees.length > 0) {
      return res.status(400).json({ message: 'Cannot delete designation assigned to employees' });
    }

    await db.query('DELETE FROM designations WHERE id = ?', [id]);
    res.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    console.error('Error deleting designation:', error);
    res.status(500).json({ message: 'Error deleting designation' });
  }
};

module.exports = { getDesignations, createDesignation, updateDesignation, deleteDesignation };
