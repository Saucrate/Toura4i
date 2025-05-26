const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllRecordings,
  getRecording,
  createRecording,
  updateRecording,
  deleteRecording,
  getRecordingsByCatalog,
  getFeaturedRecordings,
  likeRecording,
  addComment,
  likeComment,
  getRecordingsByIds
} = require('../controllers/audioRecordingController');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllRecordings);
router.get('/featured', getFeaturedRecordings);
router.get('/catalog/:catalog', getRecordingsByCatalog);
router.get('/by-ids', getRecordingsByIds);
router.get('/:id', getRecording);
router.post('/:id/view', getRecording);

// Protected routes
router.post('/', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), createRecording);

router.put('/:id', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), updateRecording);

router.delete('/:id', adminAuth, deleteRecording);

// Like and comment routes
router.post('/:id/like', auth, likeRecording);
router.post('/:id/comments', auth, addComment);
router.post('/:id/comments/like', auth, likeComment);

module.exports = router; 