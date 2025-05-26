const express = require('express');
const router = express.Router();
const poetController = require('../controllers/poetController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', poetController.getPoets);
router.get('/featured', poetController.getFeaturedPoets);
router.get('/:id', poetController.getPoetById);
router.get('/:id/followers', poetController.getFollowers);

// Protected routes (requires authentication)
router.post('/toggle-follow', auth, poetController.toggleFollow);

// Admin routes
router.post('/', adminAuth, upload.single('image'), poetController.createPoet);
router.put('/:id', adminAuth, upload.single('image'), poetController.updatePoet);
router.delete('/:id', adminAuth, poetController.deletePoet);

// Sync poems with poet
router.post('/:poetId/sync-poems', poetController.syncPoems);

module.exports = router; 