const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departments.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, getDepartments);
router.post('/', verifyToken, isAdmin, createDepartment);
router.put('/:id', verifyToken, isAdmin, updateDepartment);
router.delete('/:id', verifyToken, isAdmin, deleteDepartment);

module.exports = router;
