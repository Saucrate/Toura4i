const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { adminAuth } = require('../middleware/auth');

router.get('/stats', adminAuth, dashboardController.getStats);
router.get('/recent-activity', adminAuth, dashboardController.getRecentActivity);

module.exports = router; 