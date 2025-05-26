const Video = require('../models/Video');
const cloudinary = require('../config/cloudinary');
const { validateObjectId } = require('../utils/validation');
const mongoose = require('mongoose');
const Like = require('../models/likeModel');

// Get all videos with optional filtering
exports.getAllVideos = async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 12 } = req.query;
    const query = {};

    // Apply filters
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get videos with pagination and populate person field
    const videos = await Video.find(query)
      .populate('person', 'name image')  // Populate person field with name and image
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Video.countDocuments(query);

    res.json({
      videos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllVideos:', error);
    res.status(500).json({ message: 'Error fetching videos' });
  }
};

// Get featured videos
exports.getFeaturedVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(videos);
  } catch (error) {
    console.error('Error in getFeaturedVideos:', error);
    res.status(500).json({ message: 'Error fetching featured videos' });
  }
};

// Get a single video by ID
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user._id || req.user.id : null;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    console.log('Video view request:', {
      videoId: id,
      userId: userId,
      clientIP: clientIP,
      timestamp: new Date().toISOString()
    });
    
    if (!validateObjectId(id)) {
      console.log('Invalid video ID:', id);
      return res.status(400).json({ message: 'Invalid video ID' });
    }

    // Get video with essential data and populate person field
    let video = await Video.findById(id)
      .populate('person', 'name image')  // Populate person field with name and image
      .select('title description category date location video thumbnail views viewedByIPs likes comments person')
      .lean();

    if (!video) {
      console.log('Video not found:', id);
      return res.status(404).json({ message: 'Video not found' });
    }

    console.log('Initial video data:', {
      videoId: video._id,
      currentViews: video.views,
      viewedByIPsCount: video.viewedByIPs?.length || 0
    });

    // Clean up arrays and ensure they exist
    video.likes = Array.isArray(video.likes) ? video.likes.filter(like => like) : [];
    video.comments = Array.isArray(video.comments) ? video.comments.filter(comment => comment) : [];
    video.viewedByIPs = Array.isArray(video.viewedByIPs) ? video.viewedByIPs.filter(ip => ip) : [];

    // Check if the current user has liked the video
    video.isLiked = userId ? video.likes.some(like => like.toString() === userId.toString()) : false;
    video.likesCount = video.likes.length;
    video.commentsCount = video.comments.length;

    // Increment view count only if IP hasn't viewed before
    const hasViewed = video.viewedByIPs.includes(clientIP);
    console.log('View check:', {
      clientIP: clientIP,
      hasViewed: hasViewed,
      viewedByIPs: video.viewedByIPs
    });

    if (!hasViewed) {
      console.log('Incrementing view count for video:', id, 'by IP:', clientIP);
      
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        
        const result = await Video.findByIdAndUpdate(
          id,
          {
            $inc: { views: 1 },
            $addToSet: { viewedByIPs: clientIP }
          },
          { new: true, session }
        );
        
        if (result) {
          await session.commitTransaction();
          video.views = result.views;
          video.viewedByIPs = result.viewedByIPs;
          console.log('View count updated successfully:', {
            videoId: id,
            newViews: result.views,
            viewedByIPsCount: result.viewedByIPs.length,
            updatedAt: new Date().toISOString()
          });
        } else {
          await session.abortTransaction();
          console.error('Failed to update view count for video:', id);
        }
      } catch (error) {
        await session.abortTransaction();
        console.error('Transaction error:', error);
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      console.log('IP has already viewed this video:', {
        videoId: id,
        clientIP: clientIP,
        currentViews: video.views
      });
    }

    console.log('Final video data:', {
      videoId: video._id,
      views: video.views,
      viewedByIPsCount: video.viewedByIPs.length,
      likesCount: video.likesCount,
      commentsCount: video.commentsCount
    });

    res.json(video);
  } catch (error) {
    console.error('Error in getVideoById:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: 'Error fetching video' });
  }
};

// Create a new video
exports.createVideo = async (req, res) => {
  try {
    console.log('Creating video with data:', req.body);
    console.log('Files:', req.files);

    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).json({ message: 'Video and thumbnail files are required' });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(videoFile.path, {
      resource_type: "video",
      folder: "videos",
      format: "mp4"
    });

    // Upload thumbnail to Cloudinary
    const thumbnailResult = await cloudinary.uploader.upload(thumbnailFile.path, {
      folder: "videos/thumbnails",
      format: "jpg"
    });

    const newVideo = new Video({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      date: req.body.date,
      location: req.body.location,
      video: videoResult.secure_url,
      thumbnail: thumbnailResult.secure_url,
      duration: req.body.duration || 0,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      isFeatured: req.body.isFeatured === 'true',
      metadata: {
        format: videoFile.mimetype,
        size: videoFile.size,
        resolution: {
          width: 1920, // Default values, should be updated with actual video metadata
          height: 1080
        },
        bitrate: 5000, // Default value, should be updated with actual video metadata
        codec: 'h264' // Default value, should be updated with actual video metadata
      },
      person: req.body.person || null
    });

    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Error creating video', error: error.message });
  }
};

// Update a video
exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Handle file uploads if new files are provided
    if (req.files) {
      if (req.files.video) {
        // Delete old video from Cloudinary
        const oldVideoPublicId = video.video.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(oldVideoPublicId, { resource_type: "video" });

        // Upload new video
        const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
          resource_type: "video",
          folder: "videos",
          format: "mp4"
        });
        video.video = videoResult.secure_url;
      }

      if (req.files.thumbnail) {
        // Delete old thumbnail from Cloudinary
        const oldThumbnailPublicId = video.thumbnail.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(oldThumbnailPublicId);

        // Upload new thumbnail
        const thumbnailResult = await cloudinary.uploader.upload(req.files.thumbnail[0].path, {
          folder: "videos/thumbnails",
          format: "jpg"
        });
        video.thumbnail = thumbnailResult.secure_url;
      }
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key === 'tags') {
        video[key] = req.body[key].split(',').map(tag => tag.trim());
      } else if (key === 'metadata') {
        video[key] = JSON.parse(req.body[key]);
      } else if (key === 'person') {
        video[key] = req.body[key] || null;
      } else {
        video[key] = req.body[key];
      }
    });

    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
};

// Delete a video
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'معرف الفيديو غير صالح' });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'الفيديو غير موجود' });
    }

    // Delete video and thumbnail from Cloudinary if they exist
    if (video.video) {
      const publicId = video.video.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }
    if (video.thumbnail) {
      const publicId = video.thumbnail.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete the video document
    await Video.findByIdAndDelete(id);

    res.json({ message: 'تم حذف الفيديو بنجاح' });
  } catch (error) {
    console.error('Error in deleteVideo:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// Toggle like for a video
exports.toggleLike = async (req, res) => {
  try {
    console.log('VIDEO TOGGLE LIKE REQUEST:', {
      videoId: req.params.id,
      user: req.user
    });
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log('USER NOT AUTHENTICATED');
      return res.status(401).json({ 
        success: false, 
        message: 'يجب تسجيل الدخول أولاً' 
      });
    }
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      console.log('VIDEO NOT FOUND:', req.params.id);
      return res.status(404).json({ message: 'Video not found' });
    }

    console.log('VIDEO BEFORE LIKE TOGGLE:', {
      id: video._id,
      likes: video.likes
    });

    // Check if like exists in Like model
    const existingLike = await Like.findOne({
      user: req.user.id,
      targetType: 'video',
      targetId: video._id
    });

    console.log('EXISTING LIKE IN MODEL:', existingLike);

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      console.log('LIKE REMOVED FROM MODEL:', existingLike._id);
      
      // Remove from video's likes array
      const userIndex = video.likes.indexOf(req.user.id);
      if (userIndex !== -1) {
        video.likes.splice(userIndex, 1);
      }
    } else {
      // Create new like
      const newLike = await Like.create({
        user: req.user.id,
        targetType: 'video',
        targetId: video._id
      });
      console.log('NEW LIKE CREATED IN MODEL:', newLike._id);
      
      // Add to video's likes array
      if (!video.likes.includes(req.user.id)) {
        video.likes.push(req.user.id);
      }
    }

    // Clean null values from likes array
    video.likes = video.likes.filter(id => id);
    
    await video.save();
    
    console.log('VIDEO AFTER LIKE TOGGLE:', {
      id: video._id,
      likes: video.likes
    });

    res.status(200).json({
      success: true,
      likes: video.likes,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error toggling like', 
      error: error.message 
    });
  }
};

// Get videos by IDs
exports.getVideosByIds = async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: 'Video IDs are required' });
    }

    const videoIds = ids.split(',').map(id => id.trim());
    
    // Validate all IDs
    const invalidIds = videoIds.filter(id => !validateObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid video ID(s)',
        invalidIds 
      });
    }

    const videos = await Video.find({ _id: { $in: videoIds } })
      .select('title description category date location video thumbnail views viewedByIPs likes comments person duration')
      .populate('person', 'name image');

    res.json({ videos });
  } catch (error) {
    console.error('Error in getVideosByIds:', error);
    res.status(500).json({ message: 'Error fetching videos' });
  }
}; 