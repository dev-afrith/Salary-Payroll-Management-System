const express = require('express');
const router = express.Router();
const { 
  getMonthlyReport, 
  getDepartmentWiseReport, 
  getPayrollTrends,
  getEmployeeHistory
} = require('../controllers/report.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/monthly', verifyToken, isAdmin, getMonthlyReport);
router.get('/departments', verifyToken, isAdmin, getDepartmentWiseReport);
router.get('/trends', verifyToken, isAdmin, getPayrollTrends);
router.get('/employee/:id', verifyToken, isAdmin, getEmployeeHistory);

module.exports = router;
