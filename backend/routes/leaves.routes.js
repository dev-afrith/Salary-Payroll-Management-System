const express = require('express');
const router = express.Router();
const {
  getLeaveTypes, createLeaveType, updateLeaveType,
  getAllocateBalances, allocateLeaves, getMyBalances,
  applyForLeave, getMyApplications,
  getAllApplications, updateApplicationStatus
} = require('../controllers/leaves.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Types (Shared read, Admin write)
router.get('/types', verifyToken, getLeaveTypes);
router.post('/types', verifyToken, isAdmin, createLeaveType);
router.put('/types/:id', verifyToken, isAdmin, updateLeaveType);

// Balances
router.get('/balance/all', verifyToken, isAdmin, getAllocateBalances);
router.post('/balance/allocate', verifyToken, isAdmin, allocateLeaves);
router.get('/balance/my', verifyToken, getMyBalances);

// Applications
router.post('/apply', verifyToken, applyForLeave);
router.get('/my-applications', verifyToken, getMyApplications);
router.get('/applications', verifyToken, isAdmin, getAllApplications);
router.put('/applications/:id/status', verifyToken, isAdmin, updateApplicationStatus);

module.exports = router;
