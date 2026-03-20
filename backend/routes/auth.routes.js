const express = require('express');
const router = express.Router();
const { adminLogin, employeeLogin, getMe, logout } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/admin-login', adminLogin);
router.post('/employee-login', employeeLogin);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);

module.exports = router;
