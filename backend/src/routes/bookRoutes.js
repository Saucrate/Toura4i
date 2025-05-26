const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  incrementViews,
  likeBook,
  addComment,
  likeComment,
  checkBookLike,
  getBookComments,
  addReply,
  likeReply,
  getBooksByIds
} = require('../controllers/bookController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes
router.get('/', getAllBooks);
router.get('/by-ids', getBooksByIds);
router.get('/:id', getBookById);
router.post('/:id/views', incrementViews);

// Protected routes
router.post('/', adminAuth, upload.single('cover'), createBook);
router.put('/:id', adminAuth, upload.single('cover'), updateBook);
router.delete('/:id', adminAuth, deleteBook);

// Interactive routes
router.get('/:id/like/check', auth, checkBookLike);
router.post('/:id/like', auth, likeBook);
router.get('/:id/comments', getBookComments);
router.post('/:id/comments', auth, addComment);
router.post('/:id/comments/:commentId/replies', auth, addReply);
router.post('/:id/comments/:commentId/replies/:replyId/like', auth, likeReply);
router.post('/:id/comments/:commentId/like', auth, likeComment);

module.exports = router; 