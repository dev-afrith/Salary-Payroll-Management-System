const express = require('express');
const router = express.Router();
const { processPayroll, getPayrollSummary, getEmployeePayroll, lockPayroll, getMyPayroll } = require('../controllers/payroll.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Admin and Self
router.post('/process', verifyToken, isAdmin, processPayroll);
router.get('/summary', verifyToken, isAdmin, getPayrollSummary);
router.get('/employee/:employeeId', verifyToken, getEmployeePayroll); // Role check inside controller
router.post('/lock', verifyToken, isAdmin, lockPayroll);

// Employee self-service
router.get('/my', verifyToken, getMyPayroll);

module.exports = router;
