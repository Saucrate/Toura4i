const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'manuscripts',      // مخطوطة - İlmi Belgeler
      'instruments',      // الآلات الموسيقية القديمة - Eski Müzik Aletleri
      'historical',       // الآثار التاريخية - Tarihsel Yapıtlar
      'mosques',         // المساجد - Camiler
      'architecture',    // العمارة - Mimari
      'artifacts',       // القطع الأثرية - Arkeolojik Eserler
      'calligraphy',     // الخط العربي - Hat Sanatı
      'manuscripts',     // المخطوطات - El Yazmaları
      'cultural',        // التراث الثقافي - Kültürel Miras
      'events',          // المناسبات - Etkinlikler
      'people',          // الشخصيات - Önemli Kişiler
      'landmarks',       // المعالم - Önemli Yerler
      'traditions',      // التقاليد - Gelenekler
      'ceremonies',      // الاحتفالات - Törenler
      'performances',    // العروض - Gösteriler
      'recitations',     // التلاوات - Okumalar
      'lectures',        // المحاضرات - Konferanslar
      'workshops',       // الورش - Atölyeler
      'documentaries',   // الأفلام الوثائقية - Belgeseller
      'other'           // أخرى - Diğer
    ],
    default: 'other'
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: false,
    trim: true
  },
  video: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  duration: {
    type: Number,  // Duration in seconds
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
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
    type: String,
    default: []
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: []
  }],
  commentsCount: {
    type: Number,
    default: 0,
    get: function() {
      return this.comments.length;
    }
  },
  metadata: {
    format: String,
    size: Number,
    resolution: {
      width: Number,
      height: Number
    },
    bitrate: Number,
    codec: String
  },
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poet',
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual field for likes count
videoSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Update the updatedAt timestamp before saving
videoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add post-save middleware to update poet's videos array
videoSchema.post('save', async function(doc, next) {
  try {
    if (doc.person) {
      const Poet = mongoose.model('Poet');
      await Poet.findByIdAndUpdate(
        doc.person,
        { $addToSet: { videos: doc._id } }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video; 