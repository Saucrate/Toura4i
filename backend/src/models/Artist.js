const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    trim: true
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poem'
  }],
  albums: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
artistSchema.index({ name: 'text', bio: 'text', description: 'text' });

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist; 