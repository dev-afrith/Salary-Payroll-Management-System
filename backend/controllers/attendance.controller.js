const db = require('../config/db');

// --- Employee Self-Service ---

// Mark Check-in or Check-out
const markAttendance = async (req, res) => {
  try {
    const userId = req.user.employee_db_id || req.user.id; // from auth token
    const localDate = new Date();
    const lYear = localDate.getFullYear();
    const lMonth = String(localDate.getMonth() + 1).padStart(2, '0');
    const lDay = String(localDate.getDate()).padStart(2, '0');
    const today = `${lYear}-${lMonth}-${lDay}`;
    const now = new Date().toLocaleTimeString('en-US', { hourCycle: 'h23', hour: '2-digit', minute:'2-digit', second:'2-digit' });

    // Check if record exists for today
    const [existing] = await db.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [userId, today]);

    if (existing.length === 0) {
      // Check-in
      await db.query(
        `INSERT INTO attendance (employee_id, date, status, check_in) 
         VALUES (?, ?, 'Present', ?)`,
        [userId, today, now]
      );
      res.status(201).json({ message: 'Checked in successfully', time: now });
    } else {
      // Check-out
      const record = existing[0];
      if (record.check_out) {
        return res.status(400).json({ message: 'Already checked out for today' });
      }

      // Calculate overtime (assuming standard 9 hours shift with 1 hour break = 8 hours working)
      // This is a basic calculation. It can be enhanced based on shift timings.
      let overtime = 0;
      const checkInTime = new Date(`${today}T${record.check_in}`);
      const checkOutTime = new Date(`${today}T${now}`);
      const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      
      if (diffHours > 9) {
        overtime = (diffHours - 9).toFixed(2);
      }

      await db.query(
        `UPDATE attendance SET check_out = ?, overtime_hours = ? WHERE id = ?`,
        [now, overtime, record.id]
      );
      res.json({ message: 'Checked out successfully', time: now, overtime_hours: overtime });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Error marking attendance' });
  }
};

// Get Employee's own attendance for a specific month
const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.employee_db_id || req.user.id;
    const { year, month } = req.query; // expecting month 1-12

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const [rows] = await db.query(
      `SELECT * FROM attendance 
       WHERE employee_id = ? AND YEAR(date) = ? AND MONTH(date) = ? 
       ORDER BY date DESC`,
      [userId, year, month]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance history' });
  }
};

// --- Admin Endpoints ---

// Get Daily Attendance
const getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    // We want to list all active employees and their attendance for the date
    // If no record exists, they are functionally 'Not Marked' or 'Absent'
    const [rows] = await db.query(
      `SELECT e.id as employee_id, e.employee_id as emp_code, e.full_name, e.status as emp_status,
              a.id as attendance_id, a.status, a.check_in, a.check_out, a.remarks, a.overtime_hours
       FROM employees e
       LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = ?
       WHERE e.status = 'Approved'
       ORDER BY e.full_name ASC`,
      [date]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching daily attendance:', error);
    res.status(500).json({ message: 'Error fetching daily attendance' });
  }
};

// Update Attendance Status Manually (Admin)
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params; // attendance record id, or "new" if creating manually
    const { employee_id, date, status, check_in, check_out, remarks } = req.body;

    if (id === 'new') {
      await db.query(
        `INSERT INTO attendance (employee_id, date, status, check_in, check_out, remarks) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, date, status, check_in || null, check_out || null, remarks || null]
      );
    } else {
      await db.query(
        `UPDATE attendance SET status = ?, check_in = ?, check_out = ?, remarks = ? 
         WHERE id = ?`,
        [status, check_in || null, check_out || null, remarks || null, id]
      );
    }
    
    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Error updating attendance manually' });
  }
};

// Get Monthly Working Days settings
const getWorkingDays = async (req, res) => {
  try {
    const { year } = req.query;
    let query = 'SELECT * FROM monthly_working_days ORDER BY year DESC, month desc';
    let params = [];
    if (year) {
      query = 'SELECT * FROM monthly_working_days WHERE year = ? ORDER BY month DESC';
      params.push(year);
    }
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error config:', error);
    res.status(500).json({ message: 'Error fetching working days config' });
  }
};

// Set Monthly Working Days (Admin)
const setWorkingDays = async (req, res) => {
  try {
    const { month, year, total_working_days } = req.body;
    
    if (!month || !year || !total_working_days) {
      return res.status(400).json({ message: 'Month, year, and total working days are required' });
    }

    await db.query(
      `INSERT INTO monthly_working_days (month, year, total_working_days) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE total_working_days = ?`,
      [month, year, total_working_days, total_working_days]
    );

    res.json({ message: 'Working days saved successfully' });
  } catch (error) {
    console.error('Error saving working days:', error);
    res.status(500).json({ message: 'Error saving working days' });
  }
};

// Get Monthly Attendance Summary (Admin)
const getMonthlySummary = async (req, res) => {
  try {
     const { month, year } = req.query;
     if (!month || !year) return res.status(400).json({ message: 'Month and year are required' });

     const [rows] = await db.query(
       `SELECT e.id, e.employee_id, e.full_name,
          SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
          SUM(CASE WHEN a.status = 'Half-day' THEN 0.5 ELSE 0 END) as half_days,
          SUM(CASE WHEN a.status = 'LOP' THEN 1 ELSE 0 END) as lop_days,
          SUM(CASE WHEN a.status = 'On-Leave' THEN 1 ELSE 0 END) as leave_days,
          SUM(a.overtime_hours) as total_overtime
       FROM employees e
       LEFT JOIN attendance a ON e.id = a.employee_id AND MONTH(a.date) = ? AND YEAR(a.date) = ?
       WHERE e.status = 'Approved'
       GROUP BY e.id, e.employee_id, e.full_name
       ORDER BY e.full_name ASC`,
       [month, year]
     );

     // Get total working days for calculation context
     const [wd] = await db.query('SELECT total_working_days FROM monthly_working_days WHERE month = ? AND year = ?', [month, year]);
     const totalWorkingDays = wd.length > 0 ? wd[0].total_working_days : 26; // Default to 26

     res.json({
       summary: rows,
       total_working_days: totalWorkingDays
     });
  } catch(error) {
     console.error('Error calculating monthly summary:', error);
     res.status(500).json({ message: 'Error calculating summary' });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getDailyAttendance,
  updateAttendance,
  getWorkingDays,
  setWorkingDays,
  getMonthlySummary
};
