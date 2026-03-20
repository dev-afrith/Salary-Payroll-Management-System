const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  approveEmployee,
  rejectEmployee,
  deleteEmployee
} = require('../controllers/employees.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdmin, getEmployees);
router.get('/:id', verifyToken, getEmployeeById);
router.post('/', verifyToken, isAdmin, createEmployee);
router.put('/:id', verifyToken, isAdmin, updateEmployee);
router.put('/:id/approve', verifyToken, isAdmin, approveEmployee);
router.put('/:id/reject', verifyToken, isAdmin, rejectEmployee);
router.delete('/:id', verifyToken, isAdmin, deleteEmployee);

module.exports = router;
