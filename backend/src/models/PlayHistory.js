const mongoose = require('mongoose');

const playHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // IP bazlı takip için opsiyonel
  },
  ip: {
    type: String,
    required: true
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  track: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  type: {
    type: String,
    enum: ['album', 'track'],
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// IP ve track/album için unique index
playHistorySchema.index({ ip: 1, album: 1, type: 1 }, { unique: true });
playHistorySchema.index({ ip: 1, track: 1, type: 1 }, { unique: true });

const PlayHistory = mongoose.model('PlayHistory', playHistorySchema);

module.exports = PlayHistory; 