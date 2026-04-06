const express = require('express');
const router = express.Router();
const { adminLogin, employeeLogin, getMe, logout, forgotPassword, getResetRequests, approveResetRequest, rejectResetRequest } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/admin-login', adminLogin);
router.post('/employee-login', employeeLogin);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);

// Forgot password - public (no token needed)
router.post('/forgot-password', forgotPassword);

// Admin-only reset request management
router.get('/reset-requests', verifyToken, getResetRequests);
router.put('/reset-requests/:id/approve', verifyToken, approveResetRequest);
router.put('/reset-requests/:id/reject', verifyToken, rejectResetRequest);

module.exports = router;
