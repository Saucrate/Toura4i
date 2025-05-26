const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const authController = require('../controllers/authController');

// Protect all routes
router.use(authController.protect);

// Toggle like status
router.post('/toggle', likeController.toggleLike);

// Get likes for a target
router.get('/:targetType/:targetId', likeController.getLikes);

// Check if user has liked a target
router.get('/check/:targetType/:targetId', likeController.checkLike);

module.exports = router; 