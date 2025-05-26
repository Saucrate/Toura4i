const Place = require('../models/Place');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { validateObjectId } = require('../utils/validation');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Get all places
exports.getAllPlaces = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const places = await Place.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add likesCount and views to each place
    const placesWithStats = places.map(place => {
      const placeObj = place.toObject();
      placeObj.likesCount = placeObj.likes ? placeObj.likes.length : 0;
      placeObj.views = placeObj.views || 0;
      
      // If user is authenticated, check if they've liked it
      if (req.user) {
        placeObj.isLiked = placeObj.likes.some(like => 
          like._id.toString() === req.user._id.toString()
        );
      }
      
      return placeObj;
    });

    const total = await Place.countDocuments(query);

    res.json({
      places: placesWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllPlaces:', error);
    res.status(500).json({ message: 'Error fetching places' });
  }
};

// Get a single place by ID
exports.getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid place ID' });
    }

    // Get user ID from token if available
    let userId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        console.log('Decoded user ID from token:', userId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    const place = await Place.findById(id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar')
      .populate('likes', 'name avatar');

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Convert to plain object to modify
    const placeObj = place.toObject();

    // Add likesCount and views
    placeObj.likesCount = placeObj.likes ? placeObj.likes.length : 0;
    placeObj.views = placeObj.views || 0;

    // Check like and save statuses if user is authenticated
    if (userId) {
      console.log('Checking likes and saves for user:', userId);
      
      // Check place like status
      placeObj.isLiked = placeObj.likes.some(like => 
        like._id.toString() === userId || like.toString() === userId
      );

      // Check if place is saved by user
      const user = await User.findById(userId);
      if (user) {
        placeObj.isSaved = user.savedPlaces.some(savedId => 
          savedId.toString() === id
        );
        console.log('Place save status:', { placeId: id, isSaved: placeObj.isSaved });
      }
      
      // Check comment and reply like statuses
      placeObj.comments = placeObj.comments.map(comment => {
        const commentObj = {
          ...comment,
          likesCount: comment.likes ? comment.likes.length : 0,
          isLiked: comment.likes.some(like => 
            like.toString() === userId || (like._id && like._id.toString() === userId)
          ),
          replies: comment.replies.map(reply => ({
            ...reply,
            likesCount: reply.likes ? reply.likes.length : 0,
            isLiked: reply.likes.some(like => 
              like.toString() === userId || (like._id && like._id.toString() === userId)
            )
          }))
        };
        return commentObj;
      });
    } else {
      // If user is not authenticated, set all like and save statuses to false
      placeObj.isLiked = false;
      placeObj.isSaved = false;
      placeObj.comments = placeObj.comments.map(comment => ({
        ...comment,
        likesCount: comment.likes ? comment.likes.length : 0,
        isLiked: false,
        replies: comment.replies.map(reply => ({
          ...reply,
          likesCount: reply.likes ? reply.likes.length : 0,
          isLiked: false
        }))
      }));
    }

    // Increment view count if user hasn't viewed before
    const userIp = req.ip;
    if (!place.viewedByIPs.includes(userIp)) {
      place.viewedByIPs.push(userIp);
      place.views += 1;
      await place.save();
      placeObj.views = place.views;
    }

    // Log the response data for debugging
    console.log('Sending place response:', {
      id: placeObj._id,
      isLiked: placeObj.isLiked,
      isSaved: placeObj.isSaved,
      likesCount: placeObj.likesCount,
      userId: userId,
      likes: placeObj.likes.map(like => like._id.toString()),
      comments: placeObj.comments.map(c => ({
        id: c._id,
        isLiked: c.isLiked,
        likesCount: c.likesCount,
        likes: c.likes.map(l => l.toString()),
        replies: c.replies.map(r => ({
          id: r._id,
          isLiked: r.isLiked,
          likesCount: r.likesCount,
          likes: r.likes.map(l => l.toString())
        }))
      }))
    });

    res.json(placeObj);
  } catch (error) {
    console.error('Error in getPlaceById:', error);
    res.status(500).json({ message: 'Error fetching place' });
  }
};

// Create a new place
exports.createPlace = async (req, res) => {
  try {
    console.log('Received files:', req.files);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Media files are required' });
    }

    const mediaFiles = req.files;
    const media = [];

    for (const file of mediaFiles) {
      try {
        console.log('Processing file:', {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });

        // Validate file type
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        
        if (!isImage && !isVideo) {
          console.error('Invalid file type:', file.mimetype);
          continue;
        }

        let result;
        if (isVideo) {
          // Video upload with explicit video handling
          const uploadOptions = {
            resource_type: 'video',
            folder: 'places',
            chunk_size: 6000000,
            eager: [
              { format: 'mp4', quality: 'auto' }
            ],
            eager_async: true,
            eager: [
              { format: 'mp4', quality: 'auto' },
              { 
                format: 'jpg',
                width: 300,
                height: 200,
                crop: 'fill',
                resource_type: 'image'
              }
            ]
          };

          console.log('Uploading video with options:', uploadOptions);
          result = await cloudinary.uploader.upload(file.path, uploadOptions);
          console.log('Video upload result:', result);

          // Get the thumbnail URL from the eager transformations
          const thumbnailUrl = result.eager.find(t => t.format === 'jpg')?.secure_url;

          media.push({
            type: 'video',
            url: result.secure_url,
            thumbnail: thumbnailUrl || result.secure_url // Fallback to video URL if thumbnail generation fails
          });
        } else {
          // Image upload
          result = await cloudinary.uploader.upload(file.path, {
            folder: 'places',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
          });

          media.push({
            type: 'image',
            url: result.secure_url
          });
        }

        console.log('Successfully uploaded:', media[media.length - 1]);

        // Delete the uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (uploadError) {
        console.error('Error uploading media:', {
          error: uploadError,
          file: {
            name: file.originalname,
            type: file.mimetype,
            size: file.size
          }
        });
        // Continue with other files even if one fails
      }
    }

    if (media.length === 0) {
      return res.status(400).json({ 
        message: 'Failed to upload any media files',
        details: 'Please check if your files are valid images or videos'
      });
    }

    const place = new Place({
      name: req.body.name,
      location: req.body.location,
      type: req.body.type,
      year: req.body.year,
      description: req.body.description,
      media
    });

    const newPlace = await place.save();
    console.log('Place created successfully:', newPlace);
    res.status(201).json(newPlace);
  } catch (error) {
    console.error('Error in createPlace:', error);
    res.status(500).json({ 
      message: error.message || 'Error creating place',
      details: error.stack
    });
  }
};

// Update a place
exports.updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid place ID' });
    }

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Handle media upload if new media is provided
    if (req.files?.media) {
      const mediaFiles = Array.isArray(req.files.media) ? req.files.media : [req.files.media];
      const newMedia = [];

      for (const file of mediaFiles) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'places',
          resource_type: 'auto'
        });

        let mediaItem = {
          type: result.resource_type === 'video' ? 'video' : 'image',
          url: result.secure_url
        };

        if (result.resource_type === 'video') {
          // Generate thumbnail for video
          const thumbnailResult = await cloudinary.uploader.upload(file.path, {
            folder: 'places/thumbnails',
            resource_type: 'image',
            transformation: [
              { width: 300, height: 200, crop: 'fill' }
            ]
          });
          mediaItem.thumbnail = thumbnailResult.secure_url;
        }

        newMedia.push(mediaItem);

        // Delete the uploaded file
        fs.unlinkSync(file.path);
      }

      // Delete old media from Cloudinary
      for (const media of place.media) {
        const publicId = media.url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`places/${publicId}`);
        if (media.thumbnail) {
          const thumbnailPublicId = media.thumbnail.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`places/thumbnails/${thumbnailPublicId}`);
        }
      }

      place.media = newMedia;
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'media') {
        place[key] = req.body[key];
      }
    });

    const updatedPlace = await place.save();
    res.json(updatedPlace);
  } catch (error) {
    console.error('Error in updatePlace:', error);
    res.status(500).json({ message: 'Error updating place' });
  }
};

// Delete a place
exports.deletePlace = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid place ID' });
    }

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Delete media from Cloudinary
    for (const media of place.media) {
      const publicId = media.url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`places/${publicId}`);
      if (media.thumbnail) {
        const thumbnailPublicId = media.thumbnail.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`places/thumbnails/${thumbnailPublicId}`);
      }
    }

    await Place.findByIdAndDelete(id);
    res.json({ message: 'Place deleted successfully' });
  } catch (error) {
    console.error('Error in deletePlace:', error);
    res.status(500).json({ message: 'Error deleting place' });
  }
};

// Like/unlike place
exports.likePlace = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const userId = req.user.id;
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const likeIndex = place.likes.indexOf(userId);

    if (likeIndex === -1) {
      place.likes.push(userId);
    } else {
      place.likes.splice(likeIndex, 1);
    }

    await place.save();

    res.json({
      success: true,
      isLiked: likeIndex === -1,
      likes: place.likes,
      likesCount: place.likes.length
    });
  } catch (error) {
    console.error('Error in likePlace:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Error liking place' });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const userId = req.user.id;
    const { text, parentCommentId } = req.body;

    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const commentData = {
      user: userId,
      text,
      likes: [],
      replies: [],
      createdAt: new Date()
    };

    if (parentCommentId) {
      // This is a reply
      const parentComment = place.comments.id(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      
      const replyData = {
        ...commentData,
        user: userId,
        isReply: true
      };
      
      parentComment.replies.push(replyData);
    } else {
      // This is a new comment
      place.comments.push(commentData);
    }

    await place.save();

    // Get updated place with populated user data
    const updatedPlace = await Place.findById(req.params.id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    const newComment = parentCommentId 
      ? updatedPlace.comments.id(parentCommentId).replies[updatedPlace.comments.id(parentCommentId).replies.length - 1]
      : updatedPlace.comments[updatedPlace.comments.length - 1];

    // Add likesCount and isLiked
    const commentObj = newComment.toObject();
    commentObj.likesCount = commentObj.likes ? commentObj.likes.length : 0;
    commentObj.isLiked = false;
    commentObj.isReply = !!parentCommentId;

    res.json(commentObj);
  } catch (error) {
    console.error('Error in addComment:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// Like/unlike comment or reply
exports.likeComment = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const userId = req.user.id;
    const { id: placeId, commentId } = req.params;
    const { replyId } = req.body;

    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const comment = place.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (replyId) {
      // Handle reply like
      const reply = comment.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      const likeIndex = reply.likes.indexOf(userId);
      if (likeIndex === -1) {
        reply.likes.push(userId);
      } else {
        reply.likes.splice(likeIndex, 1);
      }

      await place.save();

      // Get updated place with populated user data
      const updatedPlace = await Place.findById(placeId)
        .populate('comments.user', 'name avatar')
        .populate('comments.replies.user', 'name avatar');

      const updatedComment = updatedPlace.comments.id(commentId);
      const updatedReply = updatedComment.replies.id(replyId);

      res.json({
        success: true,
        isLiked: likeIndex === -1,
        likes: updatedReply.likes,
        likesCount: updatedReply.likes.length,
        isReply: true
      });
    } else {
      // Handle comment like
      const likeIndex = comment.likes.indexOf(userId);
      if (likeIndex === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes.splice(likeIndex, 1);
      }

      await place.save();

      // Get updated place with populated user data
      const updatedPlace = await Place.findById(placeId)
        .populate('comments.user', 'name avatar')
        .populate('comments.replies.user', 'name avatar');

      const updatedComment = updatedPlace.comments.id(commentId);

      res.json({
        success: true,
        isLiked: likeIndex === -1,
        likes: updatedComment.likes,
        likesCount: updatedComment.likes.length,
        isReply: false
      });
    }
  } catch (error) {
    console.error('Error in likeComment:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Error liking comment' });
  }
};

// Check if user liked a place
exports.checkPlaceLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const placeId = req.params.id;

    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const isLiked = place.likes.includes(userId);
    res.json({ isLiked });
  } catch (error) {
    console.error('Error in checkPlaceLike:', error);
    res.status(500).json({ message: 'Error checking like status' });
  }
};

// Get place comments with replies
exports.getPlaceComments = async (req, res) => {
  try {
    const placeId = req.params.id;
    const userId = req.user?._id;

    const place = await Place.findById(placeId)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Convert to plain object to modify
    const comments = place.comments.map(comment => {
      const commentObj = comment.toObject();
      
      // Check if user liked the comment
      if (userId) {
        commentObj.isLiked = commentObj.likes.includes(userId);
        
        // Check likes for replies
        commentObj.replies = commentObj.replies.map(reply => {
          const replyObj = reply;
          replyObj.isLiked = replyObj.likes.includes(userId);
          return replyObj;
        });
      }
      
      return commentObj;
    });

    res.json(comments);
  } catch (error) {
    console.error('Error in getPlaceComments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
}; 