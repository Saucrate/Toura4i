const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  sendMessage,
  getMessagesWithUser,
  markAsRead,
  getConversations,
  getUnreadCount,
  shareContent,
  getMessageStats,
  getSharedContent
} = require('../controllers/messageController');

// Specific routes first
router.get('/conversations', auth, getConversations);
router.get('/unread-count', auth, getUnreadCount);
router.get('/stats', auth, getMessageStats);
router.get('/shared-content', auth, getSharedContent);
router.post('/share', auth, shareContent);

// Parameter routes last
router.post('/', auth, sendMessage);
router.get('/:userId', auth, getMessagesWithUser);
router.post('/:userId/read', auth, markAsRead);

module.exports = router; 