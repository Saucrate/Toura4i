const AudioRecording = require('../models/AudioRecording');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const { validateObjectId } = require('../utils/validation');

// Get all audio recordings
exports.getAllRecordings = async (req, res) => {
  try {
    const recordings = await AudioRecording.find()
      .populate('performer', 'name image bio')
      .populate('catalog', 'name')
      .populate('comments.user', 'name avatar')
      .populate('comments.likes', 'name avatar')
      .populate('comments.replies.user', 'name avatar')
      .populate('comments.replies.likes', 'name avatar')
      .populate('likes', 'name avatar')
      .sort({ createdAt: -1 });

    // If user is authenticated, add isLiked flag
    if (req.user) {
      const recordingsWithLikes = recordings.map(recording => {
        const recordingObj = recording.toObject();
        recordingObj.isLiked = recordingObj.likes.some(like => 
          like._id.toString() === req.user._id.toString()
        );
        return recordingObj;
      });
      res.json(recordingsWithLikes);
    } else {
      res.json(recordings);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single audio recording
exports.getRecording = async (req, res) => {
  try {
    const recording = await AudioRecording.findById(req.params.id)
      .populate('performer', 'name image bio')
      .populate('catalog', 'name')
      .populate('comments.user', 'name avatar')
      .populate('comments.likes', 'name avatar')
      .populate('comments.replies.user', 'name avatar')
      .populate('comments.replies.likes', 'name avatar')
      .populate('likes', 'name avatar');

    if (!recording) {
      return res.status(404).json({ message: 'التسجيل غير موجود' });
    }

    // Convert to plain object to modify
    const recordingObj = recording.toObject();

    // If user is authenticated, check if they've liked it
    if (req.user) {
      recordingObj.isLiked = recordingObj.likes.some(like => 
        like._id.toString() === req.user._id.toString()
      );
      
      // Check if user has liked any comments
      recordingObj.comments = recordingObj.comments.map(comment => {
        comment.isLiked = comment.likes.some(like => 
          like._id.toString() === req.user._id.toString()
        );
        
        comment.replies = comment.replies.map(reply => {
          reply.isLiked = reply.likes.some(like => 
            like._id.toString() === req.user._id.toString()
          );
          return reply;
        });
        
        return comment;
      });
    }

    // Increment view count if user hasn't viewed before
    const userIp = req.ip;
    if (!recording.viewedByIPs.includes(userIp)) {
      recording.viewedByIPs.push(userIp);
      recording.views += 1;
      await recording.save();
    }

    res.json(recordingObj);
  } catch (error) {
    console.error('Error getting recording:', error);
    res.status(500).json({ message: 'خطأ في جلب التسجيل' });
  }
};

// Create new audio recording
exports.createRecording = async (req, res) => {
  try {
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);
    
    // Dosya kontrolü
    if (!req.files) {
      console.error('No files in request');
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    if (!req.files.file) {
      console.error('No audio file in request');
      return res.status(400).json({ message: 'Audio file is required' });
    }
    
    const audioFile = req.files.file[0];
    console.log('Audio file details:', {
      originalname: audioFile.originalname,
      mimetype: audioFile.mimetype,
      size: audioFile.size,
      path: audioFile.path
    });

    // Check if image file exists
    if (!req.files.image || !req.files.image[0]) {
      console.error('No image file in request');
      return res.status(400).json({ message: 'Image file is required' });
    }

    console.log('Image file:', req.files.image[0]);

    // Upload image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
      folder: 'audio-recordings/images',
      resource_type: 'auto'
    });

    // Upload audio file to Cloudinary
    const audioResult = await cloudinary.uploader.upload(req.files.file[0].path, {
      folder: 'audio-recordings/files',
      resource_type: 'auto'
    });

    // Get audio duration from the uploaded file
    const audioDuration = req.body.duration || 0;

    const recording = new AudioRecording({
      title: req.body.title,
      performer: req.body.performer,
      catalog: req.body.catalog,
      category: req.body.category,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      lyrics: req.body.lyrics,
      isFeatured: req.body.isFeatured === 'true',
      image: imageResult.secure_url,
      file: audioResult.secure_url,
      duration: audioDuration
    });

    const newRecording = await recording.save();
    
    // Populate performer (poet) data before sending response
    const populatedRecording = await AudioRecording.findById(newRecording._id)
      .populate('performer', 'name image bio');
      
    res.status(201).json(populatedRecording);
  } catch (error) {
    console.error('Create recording error:', error);
    res.status(400).json({ 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update audio recording
exports.updateRecording = async (req, res) => {
  try {
    console.log('Update recording request:', {
      params: req.params,
      body: req.body,
      files: req.files ? {
        hasImage: !!req.files.image,
        hasFile: !!req.files.file,
        imageDetails: req.files.image ? {
          originalname: req.files.image[0].originalname,
          mimetype: req.files.image[0].mimetype,
          size: req.files.image[0].size
        } : null,
        fileDetails: req.files.file ? {
          originalname: req.files.file[0].originalname,
          mimetype: req.files.file[0].mimetype,
          size: req.files.file[0].size
        } : null
      } : 'No files'
    });

    const recording = await AudioRecording.findById(req.params.id);
    if (!recording) {
      console.log('Recording not found:', req.params.id);
      return res.status(404).json({ message: 'Recording not found' });
    }

    const updates = { ...req.body };

    // Handle image upload if new image is provided
    if (req.files?.image) {
      try {
        const imageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
          folder: 'audio-recordings/images',
          resource_type: 'auto'
        });
        updates.image = imageResult.secure_url;
        console.log('Image uploaded successfully:', imageResult.secure_url);
      } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(400).json({ message: 'Error uploading image', error: error.message });
      }
    }

    // Handle audio file upload if new file is provided
    if (req.files?.file) {
      try {
        const audioResult = await cloudinary.uploader.upload(req.files.file[0].path, {
          folder: 'audio-recordings/files',
          resource_type: 'auto'
        });
        updates.file = audioResult.secure_url;
        console.log('Audio file uploaded successfully:', audioResult.secure_url);
      } catch (error) {
        console.error('Error uploading audio file:', error);
        return res.status(400).json({ message: 'Error uploading audio file', error: error.message });
      }
    }

    const updatedRecording = await AudioRecording.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('performer', 'name image bio');

    console.log('Recording updated successfully:', updatedRecording._id);
    res.json(updatedRecording);
  } catch (error) {
    console.error('Error updating recording:', error);
    res.status(400).json({ 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Delete audio recording
exports.deleteRecording = async (req, res) => {
  try {
    const recording = await AudioRecording.findById(req.params.id);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Delete files from Cloudinary
    await cloudinary.uploader.destroy(recording.image.split('/').pop().split('.')[0]);
    await cloudinary.uploader.destroy(recording.file.split('/').pop().split('.')[0]);

    await AudioRecording.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recordings by catalog
exports.getRecordingsByCatalog = async (req, res) => {
  try {
    const recordings = await AudioRecording.find({ catalog: req.params.catalog })
      .sort({ createdAt: -1 });
    res.json(recordings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured recordings
exports.getFeaturedRecordings = async (req, res) => {
  try {
    const recordings = await AudioRecording.find({ isFeatured: true })
      .sort({ createdAt: -1 });
    res.json(recordings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike recording
exports.likeRecording = async (req, res) => {
  try {
    console.log('Liking recording:', req.params.id);
    console.log('Request user:', req.user);

    // Get user ID from request
    const userId = req.user ? req.user._id || req.user.id : null;
    if (!userId) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const recording = await AudioRecording.findById(req.params.id);
    if (!recording) {
      console.log('Recording not found');
      return res.status(404).json({ message: 'Recording not found' });
    }

    console.log('Found recording:', recording);

    const likeIndex = recording.likes.indexOf(userId);

    console.log('Current likes:', recording.likes);
    console.log('User ID:', userId);
    console.log('Like index:', likeIndex);

    if (likeIndex === -1) {
      console.log('Adding like');
      recording.likes.push(userId);
    } else {
      console.log('Removing like');
      recording.likes.splice(likeIndex, 1);
    }

    await recording.save();
    console.log('Saved recording with updated likes');

    res.json({
      success: true,
      isLiked: likeIndex === -1,
      likes: recording.likes,
      likesCount: recording.likes.length
    });
  } catch (error) {
    console.error('Error in likeRecording:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error liking recording', error: error.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    console.log('Adding comment to recording:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);

    // Get user ID from request
    const userId = req.user ? req.user._id || req.user.id : null;
    if (!userId) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const { text, replyTo } = req.body;

    const recording = await AudioRecording.findById(req.params.id);
    if (!recording) {
      console.log('Recording not found');
      return res.status(404).json({ message: 'Recording not found' });
    }

    console.log('Found recording:', recording);

    const commentData = {
      user: userId,
      text,
      likes: [],
      replies: []
    };

    console.log('New comment data:', commentData);

    if (replyTo) {
      console.log('Adding reply to comment:', replyTo);
      const parentComment = recording.comments.id(replyTo);
      if (!parentComment) {
        console.log('Parent comment not found');
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      parentComment.replies.push(commentData);
    } else {
      console.log('Adding new comment');
      recording.comments.push(commentData);
    }

    await recording.save();
    console.log('Saved recording with new comment');

    // Get updated recording with populated user data
    const updatedRecording = await AudioRecording.findById(req.params.id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    const newComment = replyTo 
      ? updatedRecording.comments.id(replyTo).replies[updatedRecording.comments.id(replyTo).replies.length - 1]
      : updatedRecording.comments[updatedRecording.comments.length - 1];

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
    console.log('Liking comment on recording:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);

    // Get user ID from request
    const userId = req.user ? req.user._id || req.user.id : null;
    if (!userId) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const { commentId, replyId } = req.body;

    const recording = await AudioRecording.findById(req.params.id);
    if (!recording) {
      console.log('Recording not found');
      return res.status(404).json({ message: 'Recording not found' });
    }

    console.log('Found recording:', recording);

    if (replyId) {
      console.log('Liking reply:', replyId, 'on comment:', commentId);
      const comment = recording.comments.id(commentId);
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
      const comment = recording.comments.id(commentId);
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

    await recording.save();
    console.log('Saved recording with updated likes');

    // Get updated recording with populated user data
    const updatedRecording = await AudioRecording.findById(req.params.id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    const updatedComment = updatedRecording.comments.id(commentId);
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

// Get audio recordings by IDs
exports.getRecordingsByIds = async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: 'Audio recording IDs are required' });
    }

    const recordingIds = ids.split(',').map(id => id.trim());
    
    // Validate all IDs
    const invalidIds = recordingIds.filter(id => !validateObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid audio recording ID(s)',
        invalidIds 
      });
    }

    const recordings = await AudioRecording.find({ _id: { $in: recordingIds } })
      .populate('performer', 'name image');

    res.json({ recordings });
  } catch (error) {
    console.error('Error in getRecordingsByIds:', error);
    res.status(500).json({ message: 'Error fetching audio recordings' });
  }
};

