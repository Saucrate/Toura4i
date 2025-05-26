const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const auth = require('../middleware/auth');

// Arama endpoint'i - auth middleware'i kaldırıldı çünkü arama public olmalı
router.get('/', searchController.search);

module.exports = router; 