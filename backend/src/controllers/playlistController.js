const Playlist = require('../models/Playlist');
const Poem = require('../models/Poem');

// Get all playlists with pagination and filters
exports.getPlaylists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const isPublic = req.query.isPublic === 'true';
    const userId = req.query.user;

    let query = {};

    // Apply filters
    if (isPublic) query.isPublic = true;
    if (userId) query.user = userId;
    if (search) {
      query.$text = { $search: search };
    }

    const playlists = await Playlist.find(query)
      .populate('user', 'name')
      .populate('tracks', 'title category image duration')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Playlist.countDocuments(query);

    res.json({
      playlists,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single playlist by ID
exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('user', 'name')
      .populate({
        path: 'tracks',
        select: 'title text category hasAudio audio image duration views likes featured',
        options: { sort: { createdAt: -1 } }
      });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if playlist is private and user is not the owner
    if (!playlist.isPublic && playlist.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new playlist
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, image, tracks, isPublic } = req.body;

    const playlist = await Playlist.create({
      name,
      description,
      image,
      tracks,
      isPublic,
      user: req.user._id
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update playlist
exports.updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      playlist[key] = updates[key];
    });

    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete playlist
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await playlist.remove();
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add track to playlist
exports.addTrack = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { trackId } = req.body;

    // Check if track exists
    const track = await Poem.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Check if track is already in playlist
    if (playlist.tracks.includes(trackId)) {
      return res.status(400).json({ message: 'Track already in playlist' });
    }

    playlist.tracks.push(trackId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove track from playlist
exports.removeTrack = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { trackId } = req.body;

    playlist.tracks = playlist.tracks.filter(id => id.toString() !== trackId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle follow playlist
exports.toggleFollow = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if playlist is public
    if (!playlist.isPublic) {
      return res.status(403).json({ message: 'Cannot follow private playlist' });
    }

    const userId = req.user._id;
    const followIndex = playlist.followers.indexOf(userId);

    if (followIndex === -1) {
      playlist.followers.push(userId);
    } else {
      playlist.followers.splice(followIndex, 1);
    }

    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 