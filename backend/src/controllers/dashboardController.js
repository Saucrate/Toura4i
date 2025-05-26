const User = require('../models/User');
const Poem = require('../models/Poem');
const Poet = require('../models/Poet');
const Album = require('../models/Album');
const AudioRecording = require('../models/AudioRecording');
const Photo = require('../models/Photo');
const Video = require('../models/Video');
const Book = require('../models/Book');
const Place = require('../models/Place');

exports.getStats = async (req, res) => {
  try {
    // First get all the basic counts
    const [
      usersCount,
      poemsCount,
      poetsCount,
      albumsCount,
      audioRecordingsCount,
      photosCount,
      videosCount,
      booksCount,
      placesCount
    ] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Poem.countDocuments().catch(() => 0),
      Poet.countDocuments().catch(() => 0),
      Album.countDocuments().catch(() => 0),
      AudioRecording.countDocuments().catch(() => 0),
      Photo.countDocuments().catch(() => 0),
      Video.countDocuments().catch(() => 0),
      Book.countDocuments().catch(() => 0),
      Place.countDocuments().catch(() => 0)
    ]);

    // Then get views and likes separately with better error handling
    let totalViews = 0;
    let totalLikes = 0;

    try {
      const viewsResults = await Promise.all([
        Poem.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$views', 0] } } } }]),
        Album.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$playCount', 0] } } } }]),
        AudioRecording.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$views', 0] } } } }]),
        Photo.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$views', 0] } } } }]),
        Video.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$views', 0] } } } }]),
        Book.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$views', 0] } } } }]),
        Place.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$views', 0] } } } }])
      ]);
      totalViews = viewsResults.reduce((acc, curr) => acc + (curr[0]?.total || 0), 0);
    } catch (error) {
      console.error('Error calculating total views:', error);
      // Continue with totalViews as 0
    }

    try {
      const likesResults = await Promise.all([
        Poem.aggregate([{ $group: { _id: null, total: { $size: { $ifNull: ['$likes', []] } } } }]),
        Album.aggregate([{ $group: { _id: null, total: { $size: { $ifNull: ['$likes', []] } } } }]),
        AudioRecording.aggregate([{ $group: { _id: null, total: { $size: { $ifNull: ['$likes', []] } } } }]),
        Photo.aggregate([{ $group: { _id: null, total: { $size: { $ifNull: ['$likes', []] } } } }]),
        Video.aggregate([{ $group: { _id: null, total: { $size: { $ifNull: ['$likes', []] } } } }])
      ]);
      totalLikes = likesResults.reduce((acc, curr) => acc + (curr[0]?.total || 0), 0);
    } catch (error) {
      console.error('Error calculating total likes:', error);
      // Continue with totalLikes as 0
    }

    res.json({
      stats: {
        users: usersCount,
        poems: poemsCount,
        poets: poetsCount,
        albums: albumsCount,
        audioRecordings: audioRecordingsCount,
        photos: photosCount,
        videos: videosCount,
        books: booksCount,
        places: placesCount,
        totalViews,
        totalLikes
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ 
      message: 'Error getting dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const recentActivities = await Promise.all([
      // Son eklenen şiirler
      Poem.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('poet', 'name')
        .select('title createdAt poet'),
      // Son eklenen albümler
      Album.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('artist', 'name')
        .select('title createdAt artist'),
      // Son eklenen ses kayıtları
      AudioRecording.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('performer', 'name')
        .select('title createdAt performer'),
      // Son eklenen fotoğraflar
      Photo.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt'),
      // Son eklenen videolar
      Video.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt'),
      // Son eklenen kitaplar
      Book.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('poet', 'name')
        .select('title createdAt poet'),
      // Son eklenen yerler
      Place.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt')
    ]);

    // Tüm aktiviteleri birleştir ve tarihe göre sırala
    const allActivities = [
      ...recentActivities[0].map(poem => ({
        type: 'poem',
        title: poem.title,
        entity: poem,
        createdAt: poem.createdAt,
        user: poem.poet?.name
      })),
      ...recentActivities[1].map(album => ({
        type: 'album',
        title: album.title,
        entity: album,
        createdAt: album.createdAt,
        user: album.artist?.name
      })),
      ...recentActivities[2].map(audio => ({
        type: 'audio',
        title: audio.title,
        entity: audio,
        createdAt: audio.createdAt,
        user: audio.performer?.name
      })),
      ...recentActivities[3].map(photo => ({
        type: 'photo',
        title: photo.title,
        entity: photo,
        createdAt: photo.createdAt
      })),
      ...recentActivities[4].map(video => ({
        type: 'video',
        title: video.title,
        entity: video,
        createdAt: video.createdAt
      })),
      ...recentActivities[5].map(book => ({
        type: 'book',
        title: book.title,
        entity: book,
        createdAt: book.createdAt,
        user: book.poet?.name
      })),
      ...recentActivities[6].map(place => ({
        type: 'place',
        title: place.name,
        entity: place,
        createdAt: place.createdAt
      }))
    ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);

    res.json({ activities: allActivities });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({ message: 'Error getting recent activity' });
  }
}; 