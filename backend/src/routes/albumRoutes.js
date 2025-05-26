const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', albumController.getAlbums);
router.get('/by-ids', albumController.getAlbumsByIds);
router.get('/saved-albums', auth, albumController.getSavedAlbums);
router.get('/featured', albumController.getFeaturedAlbums);
router.get('/:id', albumController.getAlbum);

// Like routes
router.post('/:id/like', auth, albumController.toggleLike);

// View count route
router.post('/:albumId/tracks/:trackId/view', albumController.incrementTrackViewCount);

// Admin routes
router.post('/', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'trackFiles', maxCount: 10 }
]), (req, res, next) => {
  console.log('Upload middleware processed files:', {
    files: req.files,
    body: req.body,
    fileFields: req.files ? Object.keys(req.files) : [],
    trackFiles: req.files?.trackFiles?.map(f => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      path: f.path
    }))
  });
  next();
}, albumController.createAlbum);

router.put('/:id', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'trackFiles', maxCount: 10 }
]), (req, res, next) => {
  console.log('Upload middleware processed files:', {
    files: req.files,
    body: req.body,
    fileFields: req.files ? Object.keys(req.files) : [],
    trackFiles: req.files?.trackFiles?.map(f => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      path: f.path
    }))
  });
  next();
}, albumController.updateAlbum);

router.delete('/:id', adminAuth, albumController.deleteAlbum);

router.post('/upload-track', adminAuth, upload.single('track'), albumController.uploadTrack);

module.exports = router; 