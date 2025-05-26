const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');

// Protect all routes
router.use(authController.protect);

// Create a new comment
router.post('/', commentController.createComment);

// Get comments for a poem
router.get('/poem/:poemId', commentController.getPoemComments);

// Get comments for an album
router.get('/album/:albumId', commentController.getAlbumComments);

// Get comments for a photo
router.get('/photo/:photoId', commentController.getPhotoComments);
router.get('/video/:videoId', commentController.getVideoComments);
router.get('/audioRecording/:audioRecordingId', commentController.getAudioRecordingComments);
// Toggle like on a comment
router.post('/:commentId/like', commentController.toggleLike);

// Update a comment
router.patch('/:commentId', commentController.updateComment);

// Delete a comment
router.delete('/:commentId', commentController.deleteComment);

module.exports = router; 