const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllPhotos,
  getPhotoById,
  createPhoto,
  updatePhoto,
  deletePhoto,
  getFeaturedPhotos,
  getSavedPhotos,
  getPhotosByIds
} = require('../controllers/photoController');
const likeController = require('../controllers/likeController');
const { addComment, getPhotoComments } = require('../controllers/commentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Public routes
router.get('/', getAllPhotos);
router.get('/featured', getFeaturedPhotos);
router.get('/by-ids', getPhotosByIds);

// Protected routes
router.get('/saved', auth, getSavedPhotos);
router.get('/:id', getPhotoById);
router.get('/:id/comments', getPhotoComments);

// Protected routes (admin only)
router.post('/', adminAuth, upload.array('images', 10), createPhoto);
router.put('/:id', adminAuth, upload.array('images', 10), updatePhoto);
router.delete('/:id', adminAuth, deletePhoto);

// Like route
router.post('/:id/like', auth, async (req, res) => {
  try {
    req.body.targetType = 'photo';
    req.body.targetId = req.params.id;
    await likeController.toggleLike(req, res);
  } catch (error) {
    console.error('Error in photo like route:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء معالجة الإعجاب'
    });
  }
});

// Comment route
router.post('/:id/comments', auth, async (req, res) => {
  try {
    req.body.photoId = req.params.id;
    await addComment(req, res);
  } catch (error) {
    console.error('Error in photo comment route:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء إضافة التعليق'
    });
  }
});

module.exports = router; 