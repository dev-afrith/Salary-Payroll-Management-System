const express = require('express');
const router = express.Router();
const { getDesignations, createDesignation, updateDesignation, deleteDesignation } = require('../controllers/designations.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, getDesignations);
router.post('/', verifyToken, isAdmin, createDesignation);
router.put('/:id', verifyToken, isAdmin, updateDesignation);
router.delete('/:id', verifyToken, isAdmin, deleteDesignation);

module.exports = router;
