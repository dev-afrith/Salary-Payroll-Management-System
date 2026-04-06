const db = require('../config/db');

// ─── Leave Types (Admin & Shared) ─────────────────────────────────

const getLeaveTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM leave_types ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({ message: 'Error fetching leave types' });
  }
};

const createLeaveType = async (req, res) => {
  try {
    const { name, max_days_per_year, is_paid, color } = req.body;
    await db.query(
      `INSERT INTO leave_types (name, max_days_per_year, is_paid, color) VALUES (?, ?, ?, ?)`,
      [name, max_days_per_year, is_paid, color || '#3B82F6']
    );
    res.status(201).json({ message: 'Leave type created successfully' });
  } catch (error) {
    console.error('Error creating leave type:', error);
    res.status(500).json({ message: 'Error creating leave type' });
  }
};

const updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, max_days_per_year, is_paid, color } = req.body;
    await db.query(
      `UPDATE leave_types SET name=?, max_days_per_year=?, is_paid=?, color=? WHERE id=?`,
      [name, max_days_per_year, is_paid, color, id]
    );
    res.json({ message: 'Leave type updated successfully' });
  } catch (error) {
    console.error('Error updating leave type:', error);
    res.status(500).json({ message: 'Error updating leave type' });
  }
};

// ─── Leave Balances (Admin & Employee) ─────────────────────────────

const getAllocateBalances = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: 'Year is required' });

    // Fetch employees and their balances
    const [rows] = await db.query(
      `SELECT e.id as employee_id, e.employee_id as emp_code, e.full_name,
              lb.id as balance_id, lb.leave_type_id, lt.name as leave_name,
              lb.allocated, lb.used, (COALESCE(lb.allocated, 0) - COALESCE(lb.used, 0)) as remaining
       FROM employees e
       JOIN leave_types lt
       LEFT JOIN leave_balance lb ON e.id = lb.employee_id AND lb.leave_type_id = lt.id AND lb.year = ?
       WHERE e.status = 'Approved'
       ORDER BY e.full_name, lt.name`,
      [year]
    );

    // Group by employee
    const employeesMap = {};
    rows.forEach(r => {
      if (!employeesMap[r.employee_id]) {
        employeesMap[r.employee_id] = {
          employee_id: r.employee_id,
          emp_code: r.emp_code,
          full_name: r.full_name,
          balances: []
        };
      }
      if (r.leave_type_id) {
        employeesMap[r.employee_id].balances.push({
          balance_id: r.balance_id,
          leave_type_id: r.leave_type_id,
          leave_name: r.leave_name,
          allocated: r.allocated || 0,
          used: r.used || 0,
          remaining: r.remaining || 0
        });
      }
    });

    res.json(Object.values(employeesMap));
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ message: 'Error fetching leave balances' });
  }
};

const allocateLeaves = async (req, res) => {
  try {
    const { year, type_id, days, employee_id } = req.body;
    // If employee_id is "all", allocate to all approved employees
    
    let employeesToAllocate = [];
    if (employee_id === 'all') {
      const [emps] = await db.query("SELECT id FROM employees WHERE status = 'Approved'");
      employeesToAllocate = emps.map(e => e.id);
    } else {
      employeesToAllocate = [employee_id];
    }

    for (const empId of employeesToAllocate) {
      await db.query(
        `INSERT INTO leave_balance (employee_id, leave_type_id, year, allocated, used)
         VALUES (?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE allocated = ?`,
        [empId, type_id, year, days, days]
      );
    }

    res.json({ message: 'Leaves allocated successfully' });
  } catch (error) {
    console.error('Error allocating leaves:', error);
    res.status(500).json({ message: 'Error allocating leaves' });
  }
};

const getMyBalances = async (req, res) => {
  try {
    const userId = req.user.employee_db_id || req.user.id;
    const { year } = req.query;
    
    const [rows] = await db.query(
      `SELECT lt.id as leave_type_id, lt.name as leave_name, lt.color, lt.is_paid,
              COALESCE(lb.allocated, 0) as allocated,
              COALESCE(lb.used, 0) as used,
              (COALESCE(lb.allocated, 0) - COALESCE(lb.used, 0)) as remaining
       FROM leave_types lt
       LEFT JOIN leave_balance lb ON lt.id = lb.leave_type_id AND lb.employee_id = ? AND lb.year = ?
       ORDER BY lt.name ASC`,
      [userId, year || new Date().getFullYear()]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your balances' });
  }
};

// ─── Leave Applications ──────────────────────────────────────────

const applyForLeave = async (req, res) => {
  try {
    const userId = req.user.employee_db_id || req.user.id;
    const { leave_type_id, from_date, to_date, total_days, reason } = req.body;
    const year = new Date(from_date).getFullYear();

    // Verify balance
    const [balanceRows] = await db.query(
      `SELECT (COALESCE(allocated, 0) - COALESCE(used, 0)) as remaining FROM leave_balance WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
      [userId, leave_type_id, year]
    );

    if (balanceRows.length === 0 || Number(balanceRows[0].remaining) < Number(total_days)) {
      return res.status(400).json({ message: 'Insufficient leave balance for this type' });
    }

    await db.query(
      `INSERT INTO leave_applications (employee_id, leave_type_id, from_date, to_date, total_days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, leave_type_id, from_date, to_date, total_days, reason]
    );

    res.status(201).json({ message: 'Leave application submitted successfully' });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Error submitting leave application' });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.employee_db_id || req.user.id;
    const [rows] = await db.query(
      `SELECT la.*, lt.name as leave_name, lt.color 
       FROM leave_applications la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.employee_id = ?
       ORDER BY la.applied_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your applications' });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT la.*, e.full_name, e.employee_id as emp_code, lt.name as leave_name, lt.color
       FROM leave_applications la
       JOIN employees e ON la.employee_id = e.id
       JOIN leave_types lt ON la.leave_type_id = lt.id
       ORDER BY la.status ASC, la.applied_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;

    // Get the application
    const [apps] = await db.query('SELECT * FROM leave_applications WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ message: 'Application not found' });
    const app = apps[0];

    // Check if it's already processed to avoid double deduction
    if (app.status !== 'Pending') {
      return res.status(400).json({ message: 'Application has already been processed' });
    }

    // Begin transaction for safe balance deduct
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update status
      await connection.query(
        `UPDATE leave_applications SET status = ?, admin_remarks = ? WHERE id = ?`,
        [status, admin_remarks || null, id]
      );

      // If approved, deduct balance
      if (status === 'Approved') {
        const year = new Date(app.from_date).getFullYear();
        await connection.query(
          `UPDATE leave_balance SET used = used + ?
           WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
          [app.total_days, app.employee_id, app.leave_type_id, year]
        );
      }

      await connection.commit();
      res.json({ message: `Leave ${status.toLowerCase()} successfully` });
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
};

module.exports = {
  getLeaveTypes, createLeaveType, updateLeaveType,
  getAllocateBalances, allocateLeaves, getMyBalances,
  applyForLeave, getMyApplications,
  getAllApplications, updateApplicationStatus
};
