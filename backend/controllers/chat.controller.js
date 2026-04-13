const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

// Initialize Gemini client directly using the environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userRole = req.user.role;
    let contextData = '';

    if (userRole === 'admin') {
      // Gather some high-level admin context
      const [empCount] = await db.query('SELECT count(*) as count FROM employees WHERE status != "Rejected"');
      const [deptCount] = await db.query('SELECT count(*) as count FROM departments');
      contextData = `You are a helpful HR and Payroll AI Assistant for the Administrator at AstraX Technologies. 
Current Company Stats: 
- Total Employees: ${empCount[0].count}
- Total Departments: ${deptCount[0].count}

CRITICAL INSTRUCTIONS:
Answer the admin's query concisely and courteously. 
Do NOT use ANY markdown formatting (no asterisks, no hashtags, no bold text). 
Keep your answer extremely short and to the point. Provide short instructions using simple dashes (-) if listing items.`;
    } else {
      // It's an employee. Gather their specific data from normalized tables
      const empId = req.user.employee_db_id || req.user.id;
      
      const [empInfo] = await db.query(`
        SELECT e.full_name, e.employee_id, e.date_of_joining, 
               ef.bank_account_number, 
               d.name as department, des.name as designation,
               s.basic_pay
        FROM employees e
        LEFT JOIN employee_finance ef ON e.id = ef.employee_id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN designations des ON e.designation_id = des.id
        LEFT JOIN salary_structure s ON e.id = s.employee_id
        WHERE e.id = ?
      `, [empId]);

      const [leaveBalance] = await db.query(`
        SELECT lt.name, (COALESCE(lb.allocated, 0) - COALESCE(lb.used, 0)) as remaining 
        FROM leave_balance lb
        JOIN leave_types lt ON lb.leave_type_id = lt.id
        WHERE lb.employee_id = ?
      `, [empId]);

      const emp = empInfo[0] || {};
      const leaveDetails = leaveBalance.map(l => `${l.name}: ${l.remaining}`).join(', ') || 'N/A';

      contextData = `You are a helpful HR and Payroll AI Assistant for an employee at AstraX Technologies.
You have secure access to their data:
- Name: ${emp.full_name || 'N/A'}
- Employee ID: ${emp.employee_id || 'N/A'}
- Department: ${emp.department || 'N/A'}
- Designation: ${emp.designation || 'N/A'}
- Bank Account: ${emp.bank_account_number ? 'Verified (' + emp.bank_account_number.slice(-4) + ')' : 'Not Linked'}
- Basic Pay: ₹${emp.basic_pay || 0}
- Leaves Remaining: ${leaveDetails}

CRITICAL INSTRUCTIONS:
Answer the employee's query concisely and courteously. 
Do NOT use ANY markdown formatting (no asterisks, no hashtags, no bold text). 
Keep your answer extremely short and to the point. Provide short instructions using simple dashes (-) if listing items.`;
    }

    const result = await model.generateContent(`${contextData}\n\nUser Message: "${message}"\n\nAI Response:`);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Chat AI Error:', error);
    res.status(500).json({ message: 'Error processing your message with AI', error: error.message });
  }
};

module.exports = { handleChat };
