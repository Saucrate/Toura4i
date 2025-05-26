const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  poet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poet',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['أدب', 'تاريخ', 'علوم', 'فلسفة'],
    default: 'أدب'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  cover: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
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
    ref: 'User'
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
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add post-save middleware to update poet's books array
bookSchema.post('save', async function(doc, next) {
  try {
    if (doc.poet) {
      const Poet = mongoose.model('Poet');
      await Poet.findByIdAndUpdate(
        doc.poet,
        { $addToSet: { books: doc._id } }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add text index for search
bookSchema.index({ title: 'text', description: 'text' });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book; 