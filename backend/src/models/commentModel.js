const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  poem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poem'
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  },
  audioRecording: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AudioRecording'
  },
  content: {
    type: String,
    required: [true, 'الرجاء إدخال محتوى التعليق'],
    trim: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add text index for search
commentSchema.index({ content: 'text' });

module.exports = mongoose.model('Comment', commentSchema); 