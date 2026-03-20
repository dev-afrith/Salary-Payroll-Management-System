const express = require('express');
const router = express.Router();
const { getSalaryStructure, getAllSalaryStructures, updateSalaryStructure } = require('../controllers/salary.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdmin, getAllSalaryStructures);
router.get('/:employeeId', verifyToken, isAdmin, getSalaryStructure);
router.put('/:employeeId', verifyToken, isAdmin, updateSalaryStructure);

module.exports = router;
