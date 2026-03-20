const db = require('../config/db');

// Get monthly payroll summary for charts and overview
const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const [rows] = await db.query(
      `SELECT 
        SUM(gross_salary) as total_gross,
        SUM(total_deductions) as total_deductions,
        SUM(net_salary) as total_net,
        SUM(pf_employee) as total_pf,
        SUM(esi_employee) as total_esi,
        SUM(professional_tax) as total_pt,
        SUM(tds) as total_tds,
        COUNT(id) as employee_count
      FROM payroll
      WHERE month = ? AND year = ?`,
      [month, year]
    );

    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ message: 'Error fetching monthly report' });
  }
};

// Get department-wise cost distribution
const getDepartmentWiseReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const [rows] = await db.query(
      `SELECT 
        d.name as department_name,
        SUM(p.gross_salary) as total_gross_salary,
        SUM(p.total_deductions) as total_deductions,
        SUM(p.net_salary) as total_net_salary,
        COUNT(p.id) as employee_count
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      WHERE p.month = ? AND p.year = ?
      GROUP BY d.id`,
      [month, year]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching department report:', error);
    res.status(500).json({ message: 'Error fetching department report' });
  }
};

// Get payroll trends (last 6 months)
const getPayrollTrends = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        month, year,
        SUM(gross_salary) as total_gross,
        SUM(net_salary) as total_net
      FROM payroll
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 6`
    );
    res.json(rows.reverse());
  } catch (error) {
    console.error('Error fetching payroll trends:', error);
    res.status(500).json({ message: 'Error fetching payroll trends' });
  }
};

// Get specific employee payroll history
const getEmployeeHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM payroll 
       WHERE employee_id = ? 
       ORDER BY year DESC, month DESC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employee history:', error);
    res.status(500).json({ message: 'Error fetching employee history' });
  }
};

module.exports = {
  getMonthlyReport,
  getDepartmentWiseReport,
  getPayrollTrends,
  getEmployeeHistory
};
