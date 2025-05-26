const Like = require('../models/likeModel');
const User = require('../models/User');
const Poem = require('../models/Poem');
const Comment = require('../models/commentModel');
const Album = require('../models/Album');
const Photo = require('../models/Photo');
const Video = require('../models/Video');

// Toggle like status
exports.toggleLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user._id;

    console.error('=== LIKE REQUEST START ===');
    console.error('Request details:', {
      targetType,
      targetId,
      userId: userId ? userId.toString() : 'undefined'
    });

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'يجب تسجيل الدخول أولاً'
      });
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
      user: userId,
      targetType,
      targetId
    });

    console.error('Existing like check:', existingLike ? {
      id: existingLike._id.toString(),
      user: existingLike.user.toString(),
      targetType: existingLike.targetType,
      targetId: existingLike.targetId.toString()
    } : 'No existing like found');

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      console.error('Like removed:', existingLike._id.toString());
      
      // Update target's likes array
      if (targetType === 'poem') {
        const poem = await Poem.findById(targetId);
        if (poem && Array.isArray(poem.likes)) {
          poem.likes = poem.likes.filter(id => id && id.toString() !== userId.toString());
          await poem.save();
        }
      } else if (targetType === 'album') {
        const album = await Album.findById(targetId);
        if (album) {
          console.error('Album before unlike:', {
            id: album._id.toString(),
            likesCount: album.likes ? album.likes.length : 0,
            likes: album.likes ? album.likes.map(id => id ? id.toString() : 'null') : []
          });

          if (!Array.isArray(album.likes)) {
            album.likes = [];
          }
          album.likes = album.likes.filter(id => id && id.toString() !== userId.toString());
          await album.save();

          console.error('Album after unlike:', {
            id: album._id.toString(),
            likesCount: album.likes.length,
            likes: album.likes.map(id => id.toString())
          });
        }
      } else if (targetType === 'photo') {
        const photo = await Photo.findById(targetId);
        if (photo) {
          console.error('Photo before unlike:', {
            id: photo._id.toString(),
            likesCount: photo.likes ? photo.likes.length : 0,
            likes: photo.likes ? photo.likes.map(id => id ? id.toString() : 'null') : []
          });

          if (!Array.isArray(photo.likes)) {
            photo.likes = [];
          }
          photo.likes = photo.likes.filter(id => id && id.toString() !== userId.toString());
          await photo.save();

          console.error('Photo after unlike:', {
            id: photo._id.toString(),
            likesCount: photo.likes.length,
            likes: photo.likes.map(id => id.toString())
          });
        }
      } else if (targetType === 'video') {
        const video = await Video.findById(targetId);
        if (video) {
          console.error('Video before unlike:', {
            id: video._id.toString(),
            likesCount: video.likes ? video.likes.length : 0,
            likes: video.likes ? video.likes.map(id => id ? id.toString() : 'null') : []
          });

          if (!Array.isArray(video.likes)) {
            video.likes = [];
          }
          video.likes = video.likes.filter(id => id && id.toString() !== userId.toString());
          await video.save();

          console.error('Video after unlike:', {
            id: video._id.toString(),
            likesCount: video.likes.length,
            likes: video.likes.map(id => id.toString())
          });
        }
      }

      console.error('=== LIKE REMOVED SUCCESSFULLY ===');
      return res.status(200).json({
        status: 'success',
        message: 'تم إزالة الإعجاب بنجاح',
        isLiked: false
      });
    }

    // For albums, first check if the album exists and clean its likes array
    if (targetType === 'album') {
      const album = await Album.findById(targetId);
      if (album) {
        console.error('Album before cleaning:', {
          id: album._id.toString(),
          likesCount: album.likes ? album.likes.length : 0,
          likes: album.likes ? album.likes.map(id => id ? id.toString() : 'null') : []
        });

        if (!Array.isArray(album.likes)) {
          album.likes = [];
        }
        album.likes = album.likes.filter(id => id);
        await album.save();

        console.error('Album after cleaning:', {
          id: album._id.toString(),
          likesCount: album.likes.length,
          likes: album.likes.map(id => id.toString())
        });
      }
    }
    
    // For photos, first check if the photo exists and clean its likes array
    if (targetType === 'photo') {
      const photo = await Photo.findById(targetId);
      if (photo) {
        console.error('Photo before cleaning:', {
          id: photo._id.toString(),
          likesCount: photo.likes ? photo.likes.length : 0,
          likes: photo.likes ? photo.likes.map(id => id ? id.toString() : 'null') : []
        });

        if (!Array.isArray(photo.likes)) {
          photo.likes = [];
        }
        photo.likes = photo.likes.filter(id => id);
        await photo.save();

        console.error('Photo after cleaning:', {
          id: photo._id.toString(),
          likesCount: photo.likes.length,
          likes: photo.likes.map(id => id.toString())
        });
      }
    }

    // For videos, first check if the video exists and clean its likes array
    if (targetType === 'video') {
      const video = await Video.findById(targetId);
      if (video) {
        console.error('Video before cleaning:', {
          id: video._id.toString(),
          likesCount: video.likes ? video.likes.length : 0,
          likes: video.likes ? video.likes.map(id => id ? id.toString() : 'null') : []
        });

        if (!Array.isArray(video.likes)) {
          video.likes = [];
        }
        video.likes = video.likes.filter(id => id);
        await video.save();

        console.error('Video after cleaning:', {
          id: video._id.toString(),
          likesCount: video.likes.length,
          likes: video.likes.map(id => id.toString())
        });
      }
    }

    // Create new like
    const newLike = await Like.create({
      user: userId,
      targetType,
      targetId
    });

    console.error('New like created:', {
      id: newLike._id.toString(),
      user: newLike.user.toString(),
      targetType: newLike.targetType,
      targetId: newLike.targetId.toString()
    });

    // Update target's likes array
    if (targetType === 'poem') {
      const poem = await Poem.findById(targetId);
      if (poem) {
        if (!Array.isArray(poem.likes)) {
          poem.likes = [];
        }
        poem.likes.push(userId);
        await poem.save();
      }
    } else if (targetType === 'album') {
      const album = await Album.findById(targetId);
      if (album) {
        if (!Array.isArray(album.likes)) {
          album.likes = [];
        }
        album.likes.push(userId);
        await album.save();
      }
    } else if (targetType === 'photo') {
      const photo = await Photo.findById(targetId);
      if (photo) {
        if (!Array.isArray(photo.likes)) {
          photo.likes = [];
        }
        photo.likes.push(userId);
        await photo.save();
      }
    } else if (targetType === 'video') {
      const video = await Video.findById(targetId);
      if (video) {
        if (!Array.isArray(video.likes)) {
          video.likes = [];
        }
        video.likes.push(userId);
        await video.save();
      }
    }

    console.error('=== LIKE ADDED SUCCESSFULLY ===');
    return res.status(201).json({
      status: 'success',
      message: 'تم الإعجاب بنجاح',
      isLiked: true
    });
  } catch (error) {
    console.error('Error in toggleLike:', error);
    return res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء معالجة الإعجاب'
    });
  }
};

// Get all likes for a target
exports.getLikes = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const likes = await Like.find({ targetType, targetId })
      .populate('user', 'name username photo')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: likes.length,
      data: likes
    });
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء جلب الإعجابات'
    });
  }
};

// Check if user has liked a target
exports.checkLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'يجب تسجيل الدخول أولاً'
      });
    }

    // Check if like exists
    const like = await Like.findOne({
      user: userId,
      targetType,
      targetId
    });

    // If targetType is album, also check the album's likes array
    if (targetType === 'album') {
      const album = await Album.findById(targetId);
      if (album && Array.isArray(album.likes)) {
        // Null değerleri temizle
        album.likes = album.likes.filter(id => id);
        await album.save();

        const isLikedInAlbum = album.likes.some(id => id.toString() === userId.toString());
        
        // If there's a mismatch between Like model and album.likes array, fix it
        if (isLikedInAlbum && !like) {
          // Create a new like record
          await Like.create({
            user: userId,
            targetType,
            targetId
          });
          return res.status(200).json({
            status: 'success',
            isLiked: true
          });
        } else if (!isLikedInAlbum && like) {
          // Remove the like record
          await Like.findByIdAndDelete(like._id);
          return res.status(200).json({
            status: 'success',
            isLiked: false
          });
        }
      }
    }

    res.status(200).json({
      status: 'success',
      isLiked: !!like
    });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء التحقق من الإعجاب'
    });
  }
}; 