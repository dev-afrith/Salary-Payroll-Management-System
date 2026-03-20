const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getMyAttendance,
  getDailyAttendance,
  updateAttendance,
  getWorkingDays,
  setWorkingDays,
  getMonthlySummary
} = require('../controllers/attendance.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Employee Routes
router.post('/mark', verifyToken, markAttendance);
router.get('/my', verifyToken, getMyAttendance);

// Admin Routes
router.get('/daily', verifyToken, isAdmin, getDailyAttendance);
router.get('/monthly-summary', verifyToken, isAdmin, getMonthlySummary);
router.put('/:id', verifyToken, isAdmin, updateAttendance);

// Settings
router.get('/settings/working-days', verifyToken, isAdmin, getWorkingDays);
router.post('/settings/working-days', verifyToken, isAdmin, setWorkingDays);

module.exports = router;
