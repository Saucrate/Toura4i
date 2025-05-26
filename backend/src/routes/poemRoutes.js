const express = require('express');
const router = express.Router();
const poemController = require('../controllers/poemController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', poemController.getAllPoems);
router.get('/by-ids', poemController.getPoemsByIds);
router.get('/featured', poemController.getFeaturedPoems);
router.get('/:id', auth, poemController.getPoemById);

// Protected routes (Admin only)
router.post('/', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), poemController.createPoem);

router.put('/:id', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), poemController.updatePoem);

router.delete('/:id', adminAuth, poemController.deletePoem);

// Like and comment routes
router.post('/:id/like', auth, poemController.toggleLike);
router.post('/:id/comments', auth, poemController.addComment);
router.post('/:id/comments/like', auth, poemController.likeComment);

// Save poem
router.post('/:id/save', auth, poemController.savePoem);

// Share poem
router.post('/:id/share', auth, poemController.sharePoem);

module.exports = router; 