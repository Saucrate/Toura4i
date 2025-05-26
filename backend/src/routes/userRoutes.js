const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, adminAuth } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  getUsers,
  toggleUserBlock,
  deleteUser,
  sendNotification,
  changePassword,
  toggleSavePoem,
  getSavedPoems,
  toggleSaveAlbum,
  getSavedAlbums,
  toggleSavePhoto,
  getSavedPhotos,
  toggleSaveVideo,
  getSavedVideos,
  toggleSaveAudio,
  getSavedAudios,
  toggleSavePlace,
  getSavedPlaces,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  getNotifications,
  toggleFollow,
  getFollowers,
  getFollowing,
  getUserById,
  updateOnlineStatus,
  getOnlineStatus
} = require('../controllers/userController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.get('/notifications', auth, getNotifications);
router.get('/notifications/unread', auth, getUnreadNotificationsCount);
router.put('/notifications/:id/read', auth, markNotificationAsRead);
router.put('/profile', auth, upload.fields([
  { name: 'avatar', maxCount: 1 }
]), updateProfile);
router.put('/change-password', auth, changePassword);

// Following routes - these must come before /:userId routes
router.get('/following', auth, getFollowing);
router.post('/toggle-follow', auth, toggleFollow);
router.get('/followers/:userId', auth, getFollowers);

// User routes
router.get('/:userId', auth, getUserById);

// Admin routes
router.get('/', adminAuth, getUsers);
router.put('/:userId/toggle-block', adminAuth, toggleUserBlock);
router.delete('/:userId', adminAuth, deleteUser);
router.post('/send-notification', adminAuth, sendNotification);

// Save routes
router.post('/poems/:id/toggle-save', auth, toggleSavePoem);
router.get('/users/:id/saved-poems', auth, getSavedPoems);
router.post('/albums/:id/toggle-save', auth, toggleSaveAlbum);
router.get('/users/:id/saved-albums', auth, getSavedAlbums);
router.post('/photos/:id/toggle-save', auth, toggleSavePhoto);
router.get('/users/:id/saved-photos', auth, getSavedPhotos);
router.post('/videos/:id/toggle-save', auth, toggleSaveVideo);
router.get('/users/:id/saved-videos', auth, getSavedVideos);
router.post('/audio-recordings/:id/toggle-save', auth, toggleSaveAudio);
router.get('/users/:id/saved-audios', auth, getSavedAudios);
router.post('/places/:id/toggle-save', auth, toggleSavePlace);
router.get('/users/:id/saved-places', auth, getSavedPlaces);

// Online status routes
router.put('/online-status', auth, updateOnlineStatus);
router.get('/:userId/online-status', auth, getOnlineStatus);

module.exports = router; 