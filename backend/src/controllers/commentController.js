const Comment = require('../models/commentModel');
const Poem = require('../models/Poem');
const Album = require('../models/Album');
const Photo = require('../models/Photo');
const Video = require('../models/Video');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new comment
exports.createComment = catchAsync(async (req, res, next) => {
  const { poemId, albumId, photoId, videoId, content, replyTo } = req.body;
  const userId = req.user._id;

  // Validate that at least one target ID is provided
  if (!poemId && !albumId && !photoId && !videoId) {
    return next(new AppError('يجب تحديد القصيدة أو الألبوم أو الصورة أو الفيديو', 400));
  }

  const commentData = {
    user: userId,
    content,
    replyTo
  };

  // Add target reference
  if (poemId) {
    commentData.poem = poemId;
  } else if (albumId) {
    commentData.album = albumId;
  } else if (photoId) {
    commentData.photo = photoId;
  } else if (videoId) {
    commentData.video = videoId;
  }

  const comment = await Comment.create(commentData);

  // Update target's comments array
  if (poemId) {
    const poem = await Poem.findById(poemId);
    if (poem) {
      poem.comments.push(comment._id);
      await poem.save();
    }
  } else if (albumId) {
    const album = await Album.findById(albumId);
    if (album) {
      if (!album.comments) {
        album.comments = [];
      }
      album.comments.push(comment._id);
      await album.save();
    }
  } else if (photoId) {
    const photo = await Photo.findById(photoId);
    if (photo) {
      if (!photo.comments) {
        photo.comments = [];
      }
      photo.comments.push(comment._id);
      await photo.save();
    }
  } else if (videoId) {
    const video = await Video.findById(videoId);
    if (video) {
      if (!video.comments) {
        video.comments = [];
      }
      video.comments.push(comment._id);
      await video.save();
    }
  }

  // Populate user data
  await comment.populate('user', 'name username avatar photo');

  res.status(201).json({
    status: 'success',
    data: comment
  });
});

// Get all comments for a poem
exports.getPoemComments = catchAsync(async (req, res, next) => {
  const { poemId } = req.params;
  const userId = req.user._id;

  // Get all comments for the poem
  const comments = await Comment.find({ poem: poemId, isActive: true })
    .populate('user', 'name username avatar photo')
    .populate('likes', 'name username avatar photo')
    .sort({ createdAt: -1 });

  console.log('All comments:', comments); // Debug log

  // Organize comments and replies
  const mainComments = comments.filter(comment => !comment.replyTo);
  const replies = comments.filter(comment => comment.replyTo);

  console.log('Main comments:', mainComments); // Debug log
  console.log('Replies:', replies); // Debug log

  // Add replies to their parent comments
  const organizedComments = mainComments.map(comment => {
    const commentReplies = replies.filter(reply => 
      reply.replyTo && reply.replyTo.toString() === comment._id.toString()
    );

    return {
      ...comment.toObject(),
      replies: commentReplies.map(reply => ({
        ...reply.toObject(),
        isLiked: reply.likes.some(like => like._id.toString() === userId.toString())
      })),
      isLiked: comment.likes.some(like => like._id.toString() === userId.toString())
    };
  });

  console.log('Organized comments:', organizedComments); // Debug log

  // Calculate total comment count including replies
  const totalCommentCount = organizedComments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);

  res.status(200).json({
    status: 'success',
    data: organizedComments,
    totalCommentCount
  });
});

// Get all comments for an album
exports.getAlbumComments = catchAsync(async (req, res, next) => {
  const { albumId } = req.params;
  const userId = req.user._id;

  // Get all comments for the album
  const comments = await Comment.find({ album: albumId, isActive: true })
    .populate('user', 'name username avatar photo')
    .populate('likes', 'name username avatar photo')
    .sort({ createdAt: -1 });

  // Organize comments and replies
  const mainComments = comments.filter(comment => !comment.replyTo);
  const replies = comments.filter(comment => comment.replyTo);

  // Add replies to their parent comments
  const organizedComments = mainComments.map(comment => {
    const commentReplies = replies.filter(reply => 
      reply.replyTo && reply.replyTo.toString() === comment._id.toString()
    );

    return {
      ...comment.toObject(),
      replies: commentReplies.map(reply => ({
        ...reply.toObject(),
        isLiked: reply.likes.some(like => like._id.toString() === userId.toString())
      })),
      isLiked: comment.likes.some(like => like._id.toString() === userId.toString())
    };
  });

  // Calculate total comment count including replies
  const totalCommentCount = organizedComments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);

  res.status(200).json({
    status: 'success',
    data: organizedComments,
    totalCommentCount
  });
});

// Get all comments for a photo
exports.getPhotoComments = catchAsync(async (req, res, next) => {
  const { photoId } = req.params;
  const userId = req.user._id;

  // Get all comments for the photo
  const comments = await Comment.find({ photo: photoId, isActive: true })
    .populate('user', 'name username avatar photo')
    .populate('likes', 'name username avatar photo')
    .sort({ createdAt: -1 });

  // Organize comments and replies
  const mainComments = comments.filter(comment => !comment.replyTo);
  const replies = comments.filter(comment => comment.replyTo);

  // Add replies to their parent comments
  const organizedComments = mainComments.map(comment => {
    const commentReplies = replies.filter(reply => 
      reply.replyTo && reply.replyTo.toString() === comment._id.toString()
    );

    return {
      ...comment.toObject(),
      replies: commentReplies.map(reply => ({
        ...reply.toObject(),
        isLiked: reply.likes.some(like => like._id.toString() === userId.toString())
      })),
      isLiked: comment.likes.some(like => like._id.toString() === userId.toString())
    };
  });

  // Calculate total comment count including replies
  const totalCommentCount = organizedComments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);

  res.status(200).json({
    status: 'success',
    data: organizedComments,
    totalCommentCount
  });
});

// Get all comments for a video
exports.getVideoComments = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user ? req.user._id || req.user.id : null;

  try {
    // Get all comments for the video with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use lean() for better performance and only select needed fields
    const [comments, total] = await Promise.all([
      Comment.find({ 
        video: id, 
        isActive: true 
      })
      .select('user content createdAt likes replyTo')
      .populate('user', 'name username avatar photo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      Comment.countDocuments({ 
        video: id, 
        isActive: true 
      })
    ]);

    // Organize comments and replies efficiently
    const commentMap = new Map();
    const mainComments = [];
    const replies = [];

    comments.forEach(comment => {
      // Add isLiked property
      comment.isLiked = userId ? comment.likes?.some(like => 
        like.toString() === userId.toString()
      ) : false;

      if (comment.replyTo) {
        replies.push(comment);
      } else {
        comment.replies = [];
        commentMap.set(comment._id.toString(), comment);
        mainComments.push(comment);
      }
    });

    // Add replies to their parent comments
    replies.forEach(reply => {
      const parentComment = commentMap.get(reply.replyTo.toString());
      if (parentComment) {
        parentComment.replies.push(reply);
      }
    });

    res.status(200).json({
      status: 'success',
      data: mainComments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getVideoComments:', error);
    return next(new AppError('حدث خطأ أثناء جلب التعليقات', 500));
  }
});

// Toggle like on a comment
exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }

    const userIndex = comment.likes.indexOf(req.user._id);
    
    if (userIndex === -1) {
      // Add like
      comment.likes.push(req.user._id);
    } else {
      // Remove like
      comment.likes.splice(userIndex, 1);
    }

    await comment.save();

    // Return the updated comment with populated user and likes
    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'name photo')
      .populate('likes', 'name photo');

    res.status(200).json({
      status: 'success',
      data: {
        comment: updatedComment,
        isLiked: userIndex === -1
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error toggling like'
    });
  }
};

// Update a comment
exports.updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, user: req.user._id },
    { content },
    { new: true, runValidators: true }
  );

  if (!comment) {
    return next(new AppError('التعليق غير موجود أو ليس لديك صلاحية التعديل', 404));
  }

  res.status(200).json({
    status: 'success',
    data: comment
  });
});

// Delete a comment
exports.deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, user: req.user._id },
    { isActive: false },
    { new: true }
  );

  if (!comment) {
    return next(new AppError('التعليق غير موجود أو ليس لديك صلاحية الحذف', 404));
  }

  // Update target's comments count
  if (comment.poem) {
    await Poem.findByIdAndUpdate(comment.poem, {
      $inc: { commentsCount: -1 }
    });
  } else if (comment.album) {
    await Album.findByIdAndUpdate(comment.album, {
      $inc: { commentsCount: -1 }
    });
  } else if (comment.photo) {
    await Photo.findByIdAndUpdate(comment.photo, {
      $inc: { commentsCount: -1 }
    });
  } else if (comment.video) {
    await Video.findByIdAndUpdate(comment.video, {
      $inc: { commentsCount: -1 }
    });
  }

  res.status(200).json({
    status: 'success',
    data: null
  });
});

// Create a new video comment
exports.createVideoComment = async (req, res) => {
  try {
    console.log('CREATE VIDEO COMMENT REQUEST:', {
      body: req.body,
      user: req.user
    });

    // Check if user is authenticated and has an ID
    if (!req.user || (!req.user._id && !req.user.id)) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      });
    }

    const { content, videoId, replyTo } = req.body;
    const userId = req.user._id || req.user.id; // Handle both _id and id

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'يجب إدخال نص التعليق'
      });
    }

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفيديو مطلوب'
      });
    }

    // Create comment
    const comment = await Comment.create({
      content: content.trim(),
      user: userId,
      video: videoId,
      replyTo: replyTo || null
    });

    // Update video's comments array
    await Video.findByIdAndUpdate(
      videoId,
      { $push: { comments: comment._id } },
      { new: true }
    );

    // Populate user data
    await comment.populate('user', 'name username avatar photo');

    console.log('VIDEO COMMENT CREATED:', {
      id: comment._id,
      content: comment.content,
      user: comment.user
    });

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Error creating video comment:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة التعليق',
      error: error.message
    });
  }
};

// Get all comments for an audio recording
exports.getAudioRecordingComments = catchAsync(async (req, res, next) => {
  const { audioRecordingId } = req.params;
  const userId = req.user._id;

  try {
    // Get all comments for the audio recording with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use lean() for better performance and only select needed fields
    const [comments, total] = await Promise.all([
      Comment.find({ 
        audioRecording: audioRecordingId, 
        isActive: true 
      })
      .select('user content createdAt likes replyTo')
      .populate('user', 'name username photo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      Comment.countDocuments({ 
        audioRecording: audioRecordingId, 
        isActive: true 
      })
    ]);


    // Organize comments and replies efficiently
    const commentMap = new Map();
    const mainComments = [];
    const replies = [];

    comments.forEach(comment => {
      // Add isLiked property
      comment.isLiked = userId ? comment.likes?.some(like => 
        like.toString() === userId.toString()
      ) : false;

      if (comment.replyTo) {
        replies.push(comment);
      } else {
        comment.replies = [];
        commentMap.set(comment._id.toString(), comment);
        mainComments.push(comment);
      }
    });

    // Add replies to their parent comments
    replies.forEach(reply => {
      const parentComment = commentMap.get(reply.replyTo.toString());
      if (parentComment) {
        parentComment.replies.push(reply);
      }
    });

    res.status(200).json({
      status: 'success',
      data: mainComments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAudioRecordingComments:', error);
    return next(new AppError('حدث خطأ أثناء جلب التعليقات', 500));
  }
});
