const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  likePlace,
  addComment,
  likeComment,
  checkPlaceLike,
  getPlaceComments
} = require('../controllers/placeController');

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
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image and video files are allowed!'));
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Public routes
router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);

// Protected routes (require authentication)
router.post('/', adminAuth, upload.array('media', 10), createPlace);
router.put('/:id', adminAuth, upload.array('media', 10), updatePlace);
router.delete('/:id', adminAuth, deletePlace);

// Interactive routes
router.get('/:id/like/check', auth, checkPlaceLike);
router.post('/:id/like', auth, likePlace);
router.get('/:id/comments', getPlaceComments);
router.post('/:id/comments', auth, addComment);
router.post('/:id/comments/:commentId/like', auth, likeComment);

module.exports = router; 