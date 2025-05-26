const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      if (file.fieldname === 'image') {
        // Check if this is a poet upload
        if (req.baseUrl.includes('/poets')) {
          return 'poets';
        }
        // Check if this is an album upload
        if (req.baseUrl.includes('/albums')) {
          return 'albums/images';
        }
        // Check if this is an audio recording upload
        if (req.baseUrl.includes('/audio-recordings')) {
          return 'audio-recordings/images';
        }
        return 'poems/images';
      } else if (file.fieldname === 'audio' || file.fieldname === 'file') {
        // Check if this is an audio recording upload
        if (req.baseUrl.includes('/audio-recordings')) {
          return 'audio-recordings/files';
        }
        return 'poems/audio';
      } else if (file.fieldname === 'trackFiles') {
        return 'albums/tracks';
      } else if (file.fieldname === 'video') {
        return 'videos';
      } else if (file.fieldname === 'thumbnail') {
        return 'videos/thumbnails';
      }
      return 'uploads';
    },
    resource_type: (req, file) => {
      if (file.fieldname === 'audio' || file.fieldname === 'file') {
        return 'auto';
      } else if (file.fieldname === 'trackFiles') {
        // For track files, detect if it's audio or video
        if (file.mimetype.startsWith('video/')) {
          return 'video';
        }
        return 'auto';
      } else if (file.fieldname === 'video') {
        return 'video';
      }
      return 'image';
    },
    format: (req, file) => {
      if (file.fieldname === 'trackFiles') {
        return file.mimetype.startsWith('video/') ? 'mp4' : 'mp3';
      }
      return undefined;
    },
    transformation: (req, file) => {
      if (file.fieldname === 'image') {
        // Different transformations for poets vs poems vs albums
        if (req.baseUrl.includes('/poets')) {
          return [
            { width: 500, height: 500, crop: 'fill' },
            { quality: 'auto:good' }
          ];
        } else if (req.baseUrl.includes('/albums')) {
          return [
            { width: 800, height: 800, crop: 'fill' },
            { quality: 'auto:good' }
          ];
        }
        return [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto:good' }
        ];
      } else if (file.fieldname === 'thumbnail') {
        return [
          { width: 320, height: 180, crop: 'fill' },
          { quality: 'auto:good' }
        ];
      }
      return [];
    }
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  } else if (file.fieldname === 'audio' || file.fieldname === 'file') {
    // Accept only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an audio file! Please upload an audio file.'), false);
    }
  } else if (file.fieldname === 'trackFiles') {
    // Accept both audio and video files for tracks
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Not a valid media file! Please upload an audio or video file.'), false);
    }
  } else if (file.fieldname === 'video') {
    // Accept only video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Not a video file! Please upload a video file.'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    // Accept only image files for thumbnails
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image for thumbnail.'), false);
    }
  } else {
    cb(new Error('Invalid file type!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2MB limit for videos
  }
});

module.exports = upload; 