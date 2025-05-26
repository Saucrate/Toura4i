const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
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
  images: [{
    url: {
      type: String,
      required: true
    },
    isMain: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    metadata: {
      dimensions: {
        width: Number,
        height: Number
      },
      size: Number,
      format: String,
      camera: String,
      settings: {
        aperture: String,
        shutterSpeed: String,
        iso: Number
      }
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
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
    dimensions: {
      width: Number,
      height: Number
    },
    size: Number,
    format: String,
    camera: String,
    settings: {
      aperture: String,
      shutterSpeed: String,
      iso: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poet',
    required: false
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
photoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add post-save middleware to update poet's photos array
photoSchema.post('save', async function(doc, next) {
  try {
    if (doc.person) {
      const Poet = mongoose.model('Poet');
      await Poet.findByIdAndUpdate(
        doc.person,
        { $addToSet: { photos: doc._id } }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add text index for search
photoSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo; 