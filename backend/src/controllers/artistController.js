const Artist = require('../models/Artist');
const Poem = require('../models/Poem');
const Album = require('../models/Album');

// Get all artists with pagination and filters
exports.getArtists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const featured = req.query.featured === 'true';

    let query = {};

    // Apply filters
    if (featured) query.featured = true;
    if (search) {
      query.$text = { $search: search };
    }

    const artists = await Artist.find(query)
      .populate('tracks', 'title category image')
      .populate('albums', 'title image')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Artist.countDocuments(query);

    res.json({
      artists,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single artist by ID
exports.getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
      .populate({
        path: 'tracks',
        select: 'title text category hasAudio audio image duration views likes featured',
        options: { sort: { createdAt: -1 } }
      })
      .populate({
        path: 'albums',
        select: 'title description image releaseDate',
        options: { sort: { releaseDate: -1 } }
      });

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new artist (Admin only)
exports.createArtist = async (req, res) => {
  try {
    const { name, bio, image, description } = req.body;

    const artist = await Artist.create({
      name,
      bio,
      image,
      description
    });

    res.status(201).json(artist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update artist (Admin only)
exports.updateArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      artist[key] = updates[key];
    });

    await artist.save();
    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete artist (Admin only)
exports.deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Remove artist reference from all poems
    await Poem.updateMany(
      { performer: artist.name },
      { $unset: { performer: 1 } }
    );

    // Remove artist reference from all albums
    await Album.updateMany(
      { artist: artist._id },
      { $unset: { artist: 1 } }
    );

    await artist.remove();
    res.json({ message: 'Artist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get featured artists
exports.getFeaturedArtists = async (req, res) => {
  try {
    const artists = await Artist.find({ featured: true })
      .populate('tracks', 'title category image')
      .populate('albums', 'title image')
      .limit(10);

    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 