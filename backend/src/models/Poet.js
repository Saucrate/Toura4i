const mongoose = require('mongoose');

const poetSchema = new mongoose.Schema({
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
  period: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: '',
    trim: true
  },
  awards: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  followers: {
    type: Number,
    default: 0
  },
  followerUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  poems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poem'
  }],
  albums: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  audioRecordings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AudioRecording'
  }],
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }]
}, {
  timestamps: true
});

// Add text index for search functionality
poetSchema.index({ name: 'text', bio: 'text' });

// Middleware to automatically update poet's content arrays
poetSchema.pre('save', async function(next) {
  try {
    // Get all models
    const Poem = mongoose.model('Poem');
    const Album = mongoose.model('Album');
    const Photo = mongoose.model('Photo');
    const Video = mongoose.model('Video');
    const AudioRecording = mongoose.model('AudioRecording');
    const Book = mongoose.model('Book');

    // Update poems array
    const poems = await Poem.find({ poet: this._id });
    this.poems = poems.map(poem => poem._id);

    // Update albums array
    const albums = await Album.find({ artist: this._id });
    this.albums = albums.map(album => album._id);

    // Update photos array
    const photos = await Photo.find({ person: this._id });
    this.photos = photos.map(photo => photo._id);

    // Update videos array
    const videos = await Video.find({ person: this._id });
    this.videos = videos.map(video => video._id);

    // Update audioRecordings array
    const audioRecordings = await AudioRecording.find({ performer: this._id });
    this.audioRecordings = audioRecordings.map(audio => audio._id);

    // Update books array
    const books = await Book.find({ poet: this._id });
    this.books = books.map(book => book._id);

    next();
  } catch (error) {
    next(error);
  }
});

const Poet = mongoose.model('Poet', poetSchema);

module.exports = Poet; 