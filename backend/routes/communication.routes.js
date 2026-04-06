const express = require('express');
const router = express.Router();
const { getPublicMessages, getPrivateChatHistory, getContacts, getUnreadMessages, markAsRead } = require('../controllers/communication.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/public', getPublicMessages);
router.get('/contacts', getContacts);
router.get('/unread', getUnreadMessages);
router.get('/private/:contactRole/:contactId', getPrivateChatHistory);
router.put('/read/:contactRole/:contactId', markAsRead);

module.exports = router;
