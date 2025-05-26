const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const likeController = require('../controllers/likeController');
const commentController = require('../controllers/commentController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', videoController.getAllVideos);
router.get('/featured', videoController.getFeaturedVideos);
router.get('/by-ids', videoController.getVideosByIds);
router.get('/:id', videoController.getVideoById);
router.get('/:id/comments', commentController.getVideoComments);

// Protected routes
router.post('/', adminAuth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), videoController.createVideo);

router.put('/:id', adminAuth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), videoController.updateVideo);

router.delete('/:id', adminAuth, videoController.deleteVideo);

// Like route
router.post('/:id/like', auth, videoController.toggleLike);

// Comment route
router.post('/:id/comments', auth, async (req, res) => {
  try {
    req.body.videoId = req.params.id;
    await commentController.createVideoComment(req, res);
  } catch (error) {
    console.error('Error in video comment route:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة التعليق'
    });
  }
});

module.exports = router; 