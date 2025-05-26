const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', playlistController.getPlaylists);
router.get('/:id', auth, playlistController.getPlaylistById);

// Protected routes (require authentication)
router.post('/', [auth, upload.single('image')], playlistController.createPlaylist);
router.put('/:id', [auth, upload.single('image')], playlistController.updatePlaylist);
router.delete('/:id', auth, playlistController.deletePlaylist);
router.post('/:id/tracks', auth, playlistController.addTrack);
router.delete('/:id/tracks', auth, playlistController.removeTrack);
router.post('/:id/follow', auth, playlistController.toggleFollow);

module.exports = router; 