const db = require('../config/db');

// ─── Indian Payroll Calculation Helpers ───────────────

const calcHRA = (basic, percent = 40) => (basic * percent) / 100;

const calcPF = (basic) => basic * 0.12;

const calcESI = (gross) => gross > 21000 ? 0 : gross * 0.0075;

const calcProfessionalTax = (gross) => {
  if (gross < 10000) return 0;
  if (gross <= 14999) return 150;
  return 200;
};

const calcTDS = (annualGross) => {
  let tax = 0;
  if (annualGross <= 300000) tax = 0;
  else if (annualGross <= 600000) tax = (annualGross - 300000) * 0.05;
  else if (annualGross <= 900000) tax = 15000 + (annualGross - 600000) * 0.10;
  else if (annualGross <= 1200000) tax = 45000 + (annualGross - 900000) * 0.15;
  else tax = 90000 + (annualGross - 1200000) * 0.20;
  return tax / 12;
};

// ─── Process Payroll for a month ─────────────────────

const processPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // 1. Get working days config
    const [wdRows] = await db.query(
      'SELECT total_working_days FROM monthly_working_days WHERE month = ? AND year = ?',
      [month, year]
    );
    const workingDays = wdRows.length > 0 ? wdRows[0].total_working_days : 26;

    // 2. Get all approved employees with salary structures
    const [employees] = await db.query(
      `SELECT e.id, e.employee_id, e.full_name, 
              ss.basic_pay, ss.hra_percent, ss.da_amount, ss.special_allowance, ss.overtime_rate
       FROM employees e
       JOIN salary_structure ss ON e.id = ss.employee_id
       WHERE e.status = 'Approved'`
    );

    if (employees.length === 0) {
      return res.status(400).json({ message: 'No approved employees with salary structures found' });
    }

    let processedCount = 0;
    let skippedCount = 0;

    for (const emp of employees) {
      // Check if already processed and locked
      const [existing] = await db.query(
        'SELECT id, status FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
        [emp.id, month, year]
      );
      if (existing.length > 0 && existing[0].status === 'Locked') {
        skippedCount++;
        continue;
      }

      // 3. Get attendance summary for this employee
      const [attRows] = await db.query(
        `SELECT 
           SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_full,
           SUM(CASE WHEN status = 'Half-day' THEN 1 ELSE 0 END) as half_days,
           SUM(CASE WHEN status = 'LOP' THEN 1 ELSE 0 END) as lop_days,
           SUM(overtime_hours) as total_overtime
         FROM attendance
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [emp.id, month, year]
      );

      const att = attRows[0] || {};
      const presentFull = Number(att.present_full) || 0;
      const halfDays = Number(att.half_days) || 0;
      const presentDays = presentFull + (halfDays * 0.5);
      const lopDays = Number(att.lop_days) || 0;
      const overtimeHours = Number(att.total_overtime) || 0;

      // 4. Calculate salary components
      const basicPay = Number(emp.basic_pay);
      const hra = calcHRA(basicPay, Number(emp.hra_percent));
      const da = Number(emp.da_amount) || 0;
      const specialAllowance = Number(emp.special_allowance) || 0;
      const overtimePay = overtimeHours * (Number(emp.overtime_rate) || 0);
      const bonus = 0;

      const grossSalary = basicPay + hra + da + specialAllowance + overtimePay + bonus;

      const pfEmployee = calcPF(basicPay);
      const esiEmployee = calcESI(grossSalary);
      const professionalTax = calcProfessionalTax(grossSalary);
      const tds = calcTDS(grossSalary * 12);
      const lopDeduction = workingDays > 0 && lopDays > 0 ? (grossSalary / workingDays) * lopDays : 0;

      const total_deductions = pfEmployee + esiEmployee + professionalTax + tds + lopDeduction;
      const netSalary = grossSalary - total_deductions;

      // 5. Upsert payroll record
      if (existing.length > 0) {
        await db.query(
          `UPDATE payroll SET 
            working_days=?, present_days=?, lop_days=?, overtime_hours=?,
            basic_pay=?, hra=?, da=?, special_allowance=?, overtime_pay=?, bonus=?,
            gross_salary=?, pf_employee=?, esi_employee=?, professional_tax=?, tds=?,
            lop_deduction=?, total_deductions=?, net_salary=?, status='Processed', processed_at=NOW()
           WHERE id = ?`,
          [workingDays, presentDays, lopDays, overtimeHours,
           basicPay, hra, da, specialAllowance, overtimePay, bonus,
           grossSalary, pfEmployee, esiEmployee, professionalTax, tds,
           lopDeduction, total_deductions, netSalary, existing[0].id]
        );
      } else {
        await db.query(
          `INSERT INTO payroll 
           (employee_id, month, year, working_days, present_days, lop_days, overtime_hours,
            basic_pay, hra, da, special_allowance, overtime_pay, bonus,
            gross_salary, pf_employee, esi_employee, professional_tax, tds,
            lop_deduction, total_deductions, net_salary, status, processed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processed', NOW())`,
          [emp.id, month, year, workingDays, presentDays, lopDays, overtimeHours,
           basicPay, hra, da, specialAllowance, overtimePay, bonus,
           grossSalary, pfEmployee, esiEmployee, professionalTax, tds,
           lopDeduction, total_deductions, netSalary]
        );
      }
      processedCount++;
    }

    res.json({
      message: `Payroll processed successfully`,
      processed: processedCount,
      skipped: skippedCount,
      total: employees.length
    });
  } catch (error) {
    console.error('Error processing payroll:', error);
    res.status(500).json({ message: 'Error processing payroll' });
  }
};

// Get Payroll Summary for a month
const getPayrollSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const [rows] = await db.query(
      `SELECT p.*, e.full_name, e.employee_id as emp_code,
              d.name as department_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE p.month = ? AND p.year = ?
       ORDER BY e.full_name ASC`,
      [month, year]
    );

    // Calculate totals
    const totals = rows.reduce((acc, r) => ({
      total_gross: acc.total_gross + Number(r.gross_salary),
      total_deductions: acc.total_deductions + Number(r.total_deductions),
      total_net: acc.total_net + Number(r.net_salary),
      total_pf: acc.total_pf + Number(r.pf_employee),
      total_esi: acc.total_esi + Number(r.esi_employee),
      total_tds: acc.total_tds + Number(r.tds)
    }), { total_gross: 0, total_deductions: 0, total_net: 0, total_pf: 0, total_esi: 0, total_tds: 0 });

    res.json({ records: rows, totals });
  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    res.status(500).json({ message: 'Error fetching payroll summary' });
  }
};

// Get single employee payroll detail
const getEmployeePayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    const [rows] = await db.query(
      `SELECT p.*, e.full_name, e.employee_id as emp_code, e.email, 
              ef.pan_number, ef.pf_number, ef.uan_number, ef.bank_account_number, ef.ifsc_code,
              d.name as department_name, des.name as designation_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN employee_finance ef ON e.id = ef.employee_id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       WHERE p.employee_id = ? AND p.month = ? AND p.year = ?`,
      [employeeId, month, year]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Authorization Check: Only Admin or the employee themselves can view the detailed payslip
    if (req.user.role !== 'admin' && String(req.user.employee_id) !== String(rows[0].emp_code)) {
      return res.status(403).json({ message: 'Access denied. You can only view your own payslip.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching employee payroll:', error);
    res.status(500).json({ message: 'Error fetching employee payroll' });
  }
};

// Lock payroll for a month
const lockPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    await db.query(
      `UPDATE payroll SET status = 'Locked' WHERE month = ? AND year = ? AND status = 'Processed'`,
      [month, year]
    );
    res.json({ message: 'Payroll locked for the month' });
  } catch (error) {
    console.error('Error locking payroll:', error);
    res.status(500).json({ message: 'Error locking payroll' });
  }
};

// Get employee's own payroll history
const getMyPayroll = async (req, res) => {
  try {
    const userId = req.user.employee_db_id || req.user.id;
    const { year } = req.query;
    
    let query = `SELECT * FROM payroll WHERE employee_id = ? ORDER BY year DESC, month DESC`;
    let params = [userId];
    
    if (year) {
      query = `SELECT * FROM payroll WHERE employee_id = ? AND year = ? ORDER BY month DESC`;
      params = [userId, year];
    }
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching payroll history:', error);
    res.status(500).json({ message: 'Error fetching your payroll history' });
  }
};

module.exports = { processPayroll, getPayrollSummary, getEmployeePayroll, lockPayroll, getMyPayroll };
