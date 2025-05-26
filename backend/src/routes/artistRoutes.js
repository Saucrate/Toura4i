const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', artistController.getArtists);
router.get('/featured', artistController.getFeaturedArtists);
router.get('/:id', artistController.getArtistById);

// Admin routes
router.post('/', adminAuth, upload.single('image'), artistController.createArtist);
router.put('/:id', adminAuth, upload.single('image'), artistController.updateArtist);
router.delete('/:id', adminAuth, artistController.deleteArtist);

module.exports = router; 