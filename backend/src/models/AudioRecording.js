const mongoose = require('mongoose');

const audioRecordingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  performer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poet',
    required: false
  },
  catalog: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['khutbah', 'lectures', 'poetry', 'speeches', 'interviews'],
    default: 'lectures'
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  file: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  lyrics: {
    type: String,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
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
});

// Update the updatedAt timestamp before saving
audioRecordingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add post-save middleware to update poet's audioRecordings array
audioRecordingSchema.post('save', async function(doc, next) {
  try {
    if (doc.performer) {
      const Poet = mongoose.model('Poet');
      await Poet.findByIdAndUpdate(
        doc.performer,
        { $addToSet: { audioRecordings: doc._id } }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

const AudioRecording = mongoose.model('AudioRecording', audioRecordingSchema);

module.exports = AudioRecording; 