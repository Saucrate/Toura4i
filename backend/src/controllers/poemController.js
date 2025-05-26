const Poem = require('../models/Poem');
const Poet = require('../models/Poet');
const Artist = require('../models/Artist');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const Like = require('../models/likeModel');
const User = require('../models/User');

// Get all poems with optional filters
exports.getAllPoems = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, poet, album, search, isFeatured } = req.query;
    const query = {};

    // Apply filters
    if (category) query.category = category;
    if (poet) query.poet = poet;
    if (album) query.album = album;
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const poems = await Poem.find(query)
      .populate('poet', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Poem.countDocuments(query);

    // Format the response
    const formattedPoems = poems.map(poem => ({
      ...poem.toObject(),
      likesCount: poem.likes,
      commentsCount: poem.comments
    }));

    res.json({
      poems: formattedPoems,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get poems error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// Get featured poems
exports.getFeaturedPoems = async (req, res) => {
  try {
    const poems = await Poem.find({ isFeatured: true })
      .populate('poet', 'name imageUrl')
      .populate('album', 'title imageUrl')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(poems);
  } catch (error) {
    console.error('Get featured poems error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// Get poem by ID
exports.getPoemById = async (req, res) => {
  try {
    console.log('Getting poem by ID:', req.params.id);
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);

    const poem = await Poem.findById(req.params.id)
      .populate('poet', 'name image bio')
      .populate('album', 'title image')
      .populate('comments.user', 'name avatar')
      .populate('comments.likes', 'name avatar')
      .populate('comments.replies.user', 'name avatar')
      .populate('comments.replies.likes', 'name avatar')
      .populate('likes', 'name avatar');

    if (!poem) {
      console.log('Poem not found:', req.params.id);
      return res.status(404).json({ message: 'القصيدة غير موجودة' });
    }

    // Convert to plain object to modify
    const poemObj = poem.toObject();

    // Initialize arrays if they don't exist
    poemObj.likes = poemObj.likes || [];
    poemObj.comments = poemObj.comments || [];

    // Get user ID from token if available
    const userId = req.user?.id || req.user?._id;
    console.log('User ID from token:', userId);

    if (userId) {
      console.log('User is authenticated:', userId);
      
      // Check if user has liked the poem
      poemObj.isLiked = poemObj.likes.some(like => 
        like._id?.toString() === userId.toString() || like.toString() === userId.toString()
      );
      
      // Get user's saved poems
      const user = await User.findById(userId);
      if (user) {
        poemObj.isSaved = user.savedPoems.some(savedId => 
          savedId.toString() === poem._id.toString()
        );
      }
      
      console.log('Save status check:', {
        userId,
        isSaved: poemObj.isSaved,
        savedPoems: user?.savedPoems
      });
      
      // Check if user has liked any comments
      poemObj.comments = poemObj.comments.map(comment => {
        // Initialize arrays if they don't exist
        comment.likes = comment.likes || [];
        comment.replies = comment.replies || [];
        
        // Check if user has liked the comment
        comment.isLiked = comment.likes.some(like => 
          like._id?.toString() === userId.toString() || like.toString() === userId.toString()
        );
        
        // Check if user has liked any replies
        comment.replies = comment.replies.map(reply => {
          reply.likes = reply.likes || [];
          reply.isLiked = reply.likes.some(like => 
            like._id?.toString() === userId.toString() || like.toString() === userId.toString()
          );
          return reply;
        });
        
        return comment;
      });
    } else {
      console.log('User is not authenticated');
      poemObj.isLiked = false;
      poemObj.isSaved = false;
      poemObj.comments = poemObj.comments.map(comment => {
        comment.isLiked = false;
        comment.replies = comment.replies.map(reply => {
          reply.isLiked = false;
          return reply;
        });
        return comment;
      });
    }

    // Increment view count if user hasn't viewed before
    const userIp = req.ip;
    if (!poem.viewedByIPs.includes(userIp)) {
      poem.viewedByIPs.push(userIp);
      poem.views += 1;
      await poem.save();
      console.log('View count updated for poem:', poem._id);
    }

    console.log('Returning poem data:', {
      id: poem._id,
      views: poem.views,
      likesCount: poem.likes.length,
      commentsCount: poem.comments.length,
      isLiked: poemObj.isLiked,
      isSaved: poemObj.isSaved
    });

    res.json(poemObj);
  } catch (error) {
    console.error('Get poem error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// Create new poem
exports.createPoem = async (req, res) => {
  try {
    console.log('Creating poem with data:', {
      body: req.body,
      files: req.files,
      fileFields: req.files ? Object.keys(req.files) : []
    });

    const { title, content, poet, category } = req.body;
    let imageUrl = '';
    let audioUrl = '';

    // Get image URL from Cloudinary upload
    if (req.files && req.files.image && req.files.image[0]) {
      console.log('Uploading image:', req.files.image[0]);
      const result = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: 'poems/images',
        resource_type: 'auto'
      });
      imageUrl = result.secure_url;
      console.log('Image uploaded:', imageUrl);
    } else {
      console.log('No image file found in request');
    }

    // Get audio URL from Cloudinary upload
    if (req.files && req.files.audio && req.files.audio[0]) {
      console.log('Uploading audio:', req.files.audio[0]);
      const result = await cloudinary.uploader.upload(req.files.audio[0].path, {
        folder: 'poems/audio',
        resource_type: 'auto'
      });
      audioUrl = result.secure_url;
      console.log('Audio uploaded:', audioUrl);
    } else {
      console.log('No audio file found in request');
    }

    const poem = new Poem({
      title,
      content,
      poet,
      category,
      image: imageUrl,
      audio: audioUrl
    });

    await poem.save();
    console.log('Poem created:', poem);
    res.status(201).json(poem);
  } catch (error) {
    console.error('Create poem error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// Update poem
exports.updatePoem = async (req, res) => {
  try {
    const { title, content, poet, category } = req.body;
    let imageUrl = req.body.image; // Keep existing image if no new one is uploaded
    let audioUrl = req.body.audio; // Keep existing audio if no new one is uploaded

    // Get new image URL from Cloudinary upload if provided
    if (req.files && req.files.image) {
      // Delete old image from Cloudinary if exists
      if (req.body.image) {
        const publicId = req.body.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`poems/images/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: 'poems/images',
        resource_type: 'auto'
      });
      imageUrl = result.secure_url;
      console.log('New image uploaded:', imageUrl);
    }

    // Get new audio URL from Cloudinary upload if provided
    if (req.files && req.files.audio) {
      // Delete old audio from Cloudinary if exists
      if (req.body.audio) {
        const publicId = req.body.audio.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`poems/audio/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(req.files.audio[0].path, {
        folder: 'poems/audio',
        resource_type: 'auto'
      });
      audioUrl = result.secure_url;
      console.log('New audio uploaded:', audioUrl);
    }

    const poem = await Poem.findByIdAndUpdate(
      req.params.id,
      { title, content, poet, category, image: imageUrl, audio: audioUrl },
      { new: true }
    ).populate('poet');

    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }
    console.log('Poem updated:', poem);
    res.json(poem);
  } catch (error) {
    console.error('Update poem error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// Delete poem
exports.deletePoem = async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    // Delete image from Cloudinary if exists
    if (poem.image) {
      const publicId = poem.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`poems/images/${publicId}`);
    }

    // Delete audio from Cloudinary if exists
    if (poem.audio) {
      const publicId = poem.audio.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`poems/audio/${publicId}`);
    }

    await Poem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Poem deleted successfully' });
  } catch (error) {
    console.error('Delete poem error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// Toggle like on poem
exports.toggleLike = async (req, res) => {
  try {
    console.log('Toggle like request for poem:', req.params.id);
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);

    // Get user ID from token
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      console.log('User not authenticated');
      return res.status(401).json({ message: 'يرجى تسجيل الدخول أولاً' });
    }

    console.log('User ID:', userId);

    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      console.log('Poem not found:', req.params.id);
      return res.status(404).json({ message: 'القصيدة غير موجودة' });
    }

    console.log('Found poem:', {
      id: poem._id,
      title: poem.title,
      likes: poem.likes
    });

    // Initialize likes array if it doesn't exist
    if (!poem.likes) {
      poem.likes = [];
    }

    // Check if user has already liked
    const hasLiked = poem.likes.some(like => 
      like._id?.toString() === userId.toString() || like.toString() === userId.toString()
    );

    console.log('User has liked:', hasLiked);

    if (hasLiked) {
      // Remove like
      poem.likes = poem.likes.filter(like => 
        like._id?.toString() !== userId.toString() && like.toString() !== userId.toString()
      );
      console.log('Like removed');
    } else {
      // Add like
      poem.likes.push(userId);
      console.log('Like added');
    }

    // Clean likes array (remove any null values)
    poem.likes = poem.likes.filter(like => like != null);

    await poem.save();
    console.log('Poem saved with updated likes');

    res.json({
      success: true,
      likes: poem.likes,
      isLiked: !hasLiked
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    console.log('Adding comment to poem:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);

    // Get user ID from request
    const userId = req.user ? req.user._id || req.user.id : null;
    if (!userId) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const { text, replyTo } = req.body;

    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      console.log('Poem not found');
      return res.status(404).json({ message: 'Poem not found' });
    }

    console.log('Found poem:', poem);

    const commentData = {
      user: userId,
      text,
      likes: [],
      replies: []
    };

    console.log('New comment data:', commentData);

    if (replyTo) {
      console.log('Adding reply to comment:', replyTo);
      const parentComment = poem.comments.id(replyTo);
      if (!parentComment) {
        console.log('Parent comment not found');
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      parentComment.replies.push(commentData);
    } else {
      console.log('Adding new comment');
      poem.comments.push(commentData);
    }

    await poem.save();
    console.log('Saved poem with new comment');

    // Get updated poem with populated user data
    const updatedPoem = await Poem.findById(req.params.id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    const newComment = replyTo 
      ? updatedPoem.comments.id(replyTo).replies[updatedPoem.comments.id(replyTo).replies.length - 1]
      : updatedPoem.comments[updatedPoem.comments.length - 1];

    console.log('Returning new comment:', newComment);
    res.json(newComment);
  } catch (error) {
    console.error('Error in addComment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Like/unlike comment or reply
exports.likeComment = async (req, res) => {
  try {
    console.log('Liking comment on poem:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);

    // Get user ID from request
    const userId = req.user ? req.user._id || req.user.id : null;
    if (!userId) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const { commentId, replyId } = req.body;

    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      console.log('Poem not found');
      return res.status(404).json({ message: 'Poem not found' });
    }

    console.log('Found poem:', poem);

    if (replyId) {
      console.log('Liking reply:', replyId, 'on comment:', commentId);
      const comment = poem.comments.id(commentId);
      if (!comment) {
        console.log('Comment not found');
        return res.status(404).json({ message: 'Comment not found' });
      }
      const reply = comment.replies.id(replyId);
      if (!reply) {
        console.log('Reply not found');
        return res.status(404).json({ message: 'Reply not found' });
      }

      const likeIndex = reply.likes.indexOf(userId);
      console.log('Current reply likes:', reply.likes);
      console.log('User ID:', userId);
      console.log('Like index:', likeIndex);

    if (likeIndex === -1) {
        console.log('Adding like to reply');
        reply.likes.push(userId);
      } else {
        console.log('Removing like from reply');
        reply.likes.splice(likeIndex, 1);
      }
    } else {
      console.log('Liking comment:', commentId);
      const comment = poem.comments.id(commentId);
      if (!comment) {
        console.log('Comment not found');
        return res.status(404).json({ message: 'Comment not found' });
      }

      const likeIndex = comment.likes.indexOf(userId);
      console.log('Current comment likes:', comment.likes);
      console.log('User ID:', userId);
      console.log('Like index:', likeIndex);

      if (likeIndex === -1) {
        console.log('Adding like to comment');
        comment.likes.push(userId);
      } else {
        console.log('Removing like from comment');
        comment.likes.splice(likeIndex, 1);
      }
    }

    await poem.save();
    console.log('Saved poem with updated likes');

    // Get updated poem with populated user data
    const updatedPoem = await Poem.findById(req.params.id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    const updatedComment = updatedPoem.comments.id(commentId);
    const isLiked = replyId 
      ? updatedComment.replies.id(replyId).likes.includes(userId)
      : updatedComment.likes.includes(userId);

    console.log('Final isLiked state:', isLiked);
    res.json({ isLiked });
  } catch (error) {
    console.error('Error in likeComment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error liking comment', error: error.message });
  }
};

exports.getPoemsByIds = async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    if (!ids.length) {
      return res.status(400).json({ message: 'No IDs provided' });
    }
    const poems = await Poem.find({ _id: { $in: ids } });
    res.json({ poems });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save poem
exports.savePoem = async (req, res) => {
  try {
    console.log('Save poem request for poem:', req.params.id);
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);

    // Get user ID from token
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      console.log('User not authenticated');
      return res.status(401).json({ message: 'يرجى تسجيل الدخول أولاً' });
    }

    console.log('User ID:', userId);

    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      console.log('Poem not found:', req.params.id);
      return res.status(404).json({ message: 'القصيدة غير موجودة' });
    }

    console.log('Found poem:', {
      id: poem._id,
      title: poem.title,
      savedBy: poem.savedBy
    });

    // Initialize savedBy array if it doesn't exist
    if (!poem.savedBy) {
      poem.savedBy = [];
    }

    // Convert userId to ObjectId for comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if user has already saved
    const hasSaved = poem.savedBy.some(savedId => 
      savedId.equals(userObjectId)
    );

    console.log('User has saved:', hasSaved);

    if (hasSaved) {
      // Remove save
      poem.savedBy = poem.savedBy.filter(savedId => 
        !savedId.equals(userObjectId)
      );
      console.log('Save removed');
    } else {
      // Add save
      poem.savedBy.push(userObjectId);
      console.log('Save added');
    }

    // Clean savedBy array (remove any null values)
    poem.savedBy = poem.savedBy.filter(saved => saved != null);

    await poem.save();
    console.log('Poem saved with updated savedBy');

    res.json({
      success: true,
      savedBy: poem.savedBy,
      isSaved: !hasSaved
    });
  } catch (error) {
    console.error('Save poem error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// Share poem
exports.sharePoem = async (req, res) => {
  try {
    console.log('Sharing poem:', {
      poemId: req.params.id,
      userId: req.user.id
    });

    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    // Increment share count
    poem.shares = (poem.shares || 0) + 1;
    await poem.save();

    res.json({
      success: true,
      shares: poem.shares
    });
  } catch (error) {
    console.error('Error sharing poem:', error);
    res.status(500).json({ message: 'Error sharing poem' });
  }
}; 