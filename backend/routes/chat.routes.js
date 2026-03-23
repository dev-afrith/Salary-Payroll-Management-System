const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, handleChat);

module.exports = router;
