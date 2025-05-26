const mongoose = require('mongoose');

const poemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  poet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poet',
    required: true
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  },
  category: {
    type: String,
    enum: ['مدح', 'حكمة', 'غزل', 'أخرى'],
    default: 'أخرى'
  },
  image: {
    type: String,
    default: ''
  },
  audio: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  viewedByIPs: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add text index for search
poemSchema.index({ title: 'text', content: 'text' });

// Add post-save middleware to update poet's poems array
poemSchema.post('save', async function(doc, next) {
  try {
    if (doc.poet) {
      const Poet = mongoose.model('Poet');
      await Poet.findByIdAndUpdate(
        doc.poet,
        { $addToSet: { poems: doc._id } }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Poem', poemSchema); 