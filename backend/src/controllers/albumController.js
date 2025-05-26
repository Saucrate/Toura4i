const Album = require('../models/Album');
const Poet = require('../models/Poet');
const Poem = require('../models/Poem');
const cloudinary = require('../config/cloudinary');
const Comment = require('../models/commentModel');
const Like = require('../models/likeModel');
const PlayHistory = require('../models/PlayHistory');
const User = require('../models/User');

// Get all albums with pagination and filters
exports.getAlbums = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const featured = req.query.featured === 'true';
    const artistId = req.query.artist;

    let query = {};

    // Apply filters
    if (featured) query.featured = true;
    if (artistId) query.artist = artistId;
    if (search) {
      query.$text = { $search: search };
    }

    const albums = await Album.find(query)
      .populate('artist', 'name image')
      .populate('tracks', 'title category image duration')
      .sort({ releaseDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Album.countDocuments(query);

    res.json({
      albums,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single album by ID
exports.getAlbum = async (req, res) => {
  try {
    console.log('Getting album with ID:', req.params.id);
    
    const album = await Album.findById(req.params.id)
      .populate('artist', 'name image bio photo')
      .populate('comments.user', 'name avatar photo')
      .populate('comments.likes', 'name avatar photo')
      .populate('comments.replies.user', 'name avatar photo')
      .populate('comments.replies.likes', 'name avatar photo')
      .populate('likes', 'name avatar photo');

    if (!album) {
      console.log('Album not found:', req.params.id);
      return res.status(404).json({ message: 'Album not found' });
    }

    console.log('Album data:', {
      id: album._id,
      title: album.title,
      artist: album.artist ? {
        id: album.artist._id,
        name: album.artist.name,
        image: album.artist.image,
        photo: album.artist.photo
      } : null,
      tracks: album.tracks ? album.tracks.length : 0,
      views: album.views,
      likes: album.likes ? album.likes.length : 0
    });

    // Convert to plain object to modify
    const albumObj = album.toObject();

    // If user is authenticated, check if they've liked it
    if (req.user) {
      try {
        albumObj.isLiked = albumObj.likes.some(like => 
          like._id.toString() === req.user._id.toString()
        );
        
        // Check if user has liked any comments
        albumObj.comments = albumObj.comments.map(comment => {
          comment.isLiked = comment.likes.some(like => 
            like._id.toString() === req.user._id.toString()
          );
          
          comment.replies = comment.replies.map(reply => {
            reply.isLiked = reply.likes.some(like => 
              like._id.toString() === req.user._id.toString()
            );
            return reply;
          });
          
          return comment;
        });
      } catch (error) {
        console.error('Error checking likes:', error);
        // Continue without like information if there's an error
        albumObj.isLiked = false;
      }
    }

    // Increment view count if IP hasn't viewed before
    try {
      const userIp = req.ip;
      if (!album.viewedByIPs.includes(userIp)) {
        album.viewedByIPs.push(userIp);
        album.views += 1;
        await album.save();
      }
    } catch (error) {
      console.error('Error updating view count:', error);
      // Continue without updating view count if there's an error
    }

    res.json(albumObj);
  } catch (error) {
    console.error('Error getting album:', error);
    res.status(500).json({ message: 'Error fetching album' });
  }
};

// Create a new album
exports.createAlbum = async (req, res) => {
  try {
    console.log('Creating album with data:', {
      title: req.body.title,
      description: req.body.description,
      artist: req.body.artist,
      hasImage: !!req.files?.image,
      trackCount: req.body.tracks ? JSON.parse(req.body.tracks).length : 0,
      files: req.files,
      fileFields: req.files ? Object.keys(req.files) : [],
      trackFiles: req.files?.trackFiles?.map(f => ({
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        path: f.path
      }))
    });

    // Handle image upload
    let imageUrl = '';
    if (req.files?.image?.[0]) {
      imageUrl = req.files.image[0].path;
    }

    // Check if poet exists
    const poet = await Poet.findById(req.body.artist);
    if (!poet) {
      return res.status(404).json({ message: 'Poet not found' });
    }

    // Parse tracks data
    let tracks = [];
    if (req.body.tracks) {
      try {
        const tracksData = JSON.parse(req.body.tracks);
        console.log('Processing tracks:', tracksData);

        // Process each track
        for (let i = 0; i < tracksData.length; i++) {
          const trackData = tracksData[i];
          const trackFile = req.files?.trackFiles?.[i];

          if (!trackFile) {
            console.log('No file found for track:', trackData);
            continue;
          }

          console.log('Processing track file:', {
            originalname: trackFile.originalname,
            mimetype: trackFile.mimetype,
            size: trackFile.size,
            path: trackFile.path
          });

          // Convert duration from "MM:SS" to seconds
          const [minutes, seconds] = trackData.duration.split(':').map(Number);
          const durationInSeconds = (minutes * 60) + seconds;

          tracks.push({
            title: trackData.title || trackFile.originalname,
            file: trackFile.path,
            duration: durationInSeconds
          });
        }
      } catch (error) {
        console.error('Error processing tracks:', error);
        return res.status(400).json({ message: 'Invalid tracks data format' });
      }
    }

    // Create album
    const album = new Album({
      title: req.body.title,
      description: req.body.description,
      artist: req.body.artist,
      image: imageUrl,
      tracks
    });

    await album.save();

    // Update poet's albums array
    poet.albums.push(album._id);
    await poet.save();

    res.status(201).json(album);
  } catch (error) {
    console.error('Error creating album:', error);
    res.status(500).json({ 
      message: 'Error creating album',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update album (Admin only)
exports.updateAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const { title, description, artist, tracks } = req.body;
    let imageUrl = album.image; // Keep existing image if no new one is uploaded

    // Get new image URL from Cloudinary upload if provided
    if (req.files && req.files.image) {
      // Delete old image from Cloudinary if exists
      if (album.image) {
        const publicId = album.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`albums/images/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: 'albums/images',
        resource_type: 'auto'
      });
      imageUrl = result.secure_url;
      console.log('New album image uploaded:', imageUrl);
    }

    // Parse tracks data
    let parsedTracks = album.tracks;
    if (tracks) {
      try {
        parsedTracks = JSON.parse(tracks);
        
        // Process each track
        parsedTracks = await Promise.all(parsedTracks.map(async (track, index) => {
          let fileUrl = track.file; // Keep existing file if no new one is uploaded
          
          // Check if there's a new file for this track
          if (req.files && req.files.trackFiles && req.files.trackFiles[index]) {
            // Delete old track file from Cloudinary if exists
            if (track.file) {
              const publicId = track.file.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(`albums/tracks/${publicId}`);
            }
            
            // Upload new track file to Cloudinary
            const result = await cloudinary.uploader.upload(req.files.trackFiles[index].path, {
              folder: 'albums/tracks',
              resource_type: 'auto'
            });
            fileUrl = result.secure_url;
            console.log('New track file uploaded:', fileUrl);
          }

          return {
            title: track.title,
            file: fileUrl,
            duration: track.duration
          };
        }));
      } catch (error) {
        console.error('Error parsing tracks:', error);
        return res.status(400).json({ message: 'Invalid tracks data format' });
      }
    }

    // Update album fields
    album.title = title;
    album.description = description;
    album.image = imageUrl;
    album.artist = artist;
    album.tracks = parsedTracks;

    await album.save();
    console.log('Album updated successfully:', {
      id: album._id,
      title: album.title,
      artist: album.artist,
      tracks: album.tracks
    });
    res.json(album);
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete album (Admin only)
exports.deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Delete image from Cloudinary if exists
    if (album.image) {
      const publicId = album.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`albums/images/${publicId}`);
    }

    // Remove album from poet's albums array
    const poet = await Poet.findById(album.artist);
    if (poet) {
      poet.albums = poet.albums.filter(id => id.toString() !== album._id.toString());
      await poet.save();
    }

    await Album.findByIdAndDelete(req.params.id);
    res.json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get featured albums
exports.getFeaturedAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ featured: true })
      .populate('artist', 'name image')
      .populate('tracks', 'title category image duration')
      .limit(10);

    res.json(albums);
  } catch (error) {
    console.error('Get featured albums error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle like for an album
exports.toggleLike = async (req, res) => {
  try {
    console.log('ALBUM TOGGLE LIKE REQUEST:', {
      albumId: req.params.id,
      user: req.user
    });
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log('USER NOT AUTHENTICATED');
      return res.status(401).json({ 
        success: false, 
        message: 'يجب تسجيل الدخول أولاً' 
      });
    }
    
    const album = await Album.findById(req.params.id);
    
    if (!album) {
      console.log('ALBUM NOT FOUND:', req.params.id);
      return res.status(404).json({ message: 'Album not found' });
    }

    console.log('ALBUM BEFORE LIKE TOGGLE:', {
      id: album._id,
      likes: album.likes
    });

    // Check if like exists in Like model
    const existingLike = await Like.findOne({
      user: req.user.id,
      targetType: 'album',
      targetId: album._id
    });

    console.log('EXISTING LIKE IN MODEL:', existingLike);

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      console.log('LIKE REMOVED FROM MODEL:', existingLike._id);
      
      // Remove from album's likes array
      const userIndex = album.likes.indexOf(req.user.id);
      if (userIndex !== -1) {
        album.likes.splice(userIndex, 1);
      }
    } else {
      // Create new like
      const newLike = await Like.create({
        user: req.user.id,
        targetType: 'album',
        targetId: album._id
      });
      console.log('NEW LIKE CREATED IN MODEL:', newLike._id);
      
      // Add to album's likes array
      if (!album.likes.includes(req.user.id)) {
        album.likes.push(req.user.id);
      }
    }

    // Clean null values from likes array
    album.likes = album.likes.filter(id => id);
    
    await album.save();
    
    console.log('ALBUM AFTER LIKE TOGGLE:', {
      id: album._id,
      likes: album.likes
    });

    res.status(200).json({
      success: true,
      likes: album.likes,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error toggling like', 
      error: error.message 
    });
  }
};

// Increment track view count
exports.incrementTrackViewCount = async (req, res) => {
  try {
    const { albumId, trackId } = req.params;
    const userIp = req.ip;

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const track = album.tracks.id(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Check if IP has already viewed this track
    if (!track.viewedByIPs.includes(userIp)) {
      // Update track view count
      track.viewedByIPs.push(userIp);
      track.views += 1;

      // Update album view count
      if (!album.viewedByIPs.includes(userIp)) {
        album.viewedByIPs.push(userIp);
        album.views += 1;
      }

      await album.save();
      res.json({ 
        success: true, 
        message: "View count incremented",
        views: track.views,
        totalViews: album.views
      });
    } else {
      res.json({ 
        success: true, 
        message: "Track already viewed from this IP",
        views: track.views,
        totalViews: album.views
      });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ message: 'Error incrementing view count' });
  }
};

exports.getAlbumsByIds = async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    if (!ids.length) {
      return res.status(400).json({ message: 'No IDs provided' });
    }
    const albums = await Album.find({ _id: { $in: ids } })
      .populate('artist', 'name image')
      .populate('tracks', 'title category image duration');
    res.json({ albums });
  } catch (error) {
    console.error('Get albums by IDs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSavedAlbums = async (req, res) => {
  try {
    console.log('getSavedAlbums called for user:', req.user?.id);
    
    // Kullanıcı kimliğini güvenli bir şekilde al
    const userId = req.user?.id;
    
    if (!userId) {
      console.log('User ID not found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found, savedAlbums:', user.savedAlbums);
    
    // Albüm ID'lerini string'e dönüştür
    const albumIds = user.savedAlbums.map(id => id.toString());
    console.log('Album IDs to search:', albumIds);
    
    // Tüm albümleri bul (isActive kontrolü olmadan)
    const albums = await Album.find({
      _id: { $in: user.savedAlbums }
    })
    .populate('artist', 'name image')
    .populate('tracks', 'title duration');

    console.log('Found albums count:', albums.length);
    
    res.json({ albums });
  } catch (error) {
    console.error('Error in getSavedAlbums:', error);
    res.status(500).json({ message: 'Error fetching saved albums', error: error.message });
  }
};

// Tekil track upload
exports.uploadTrack = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No track file uploaded' });
  }
  const file = req.file;
  // Cloudinary'ye yükle
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'albums/tracks',
    resource_type: 'auto'
  });
  // Süreyi frontend gönderebilir veya burada hesaplanabilir (isteğe bağlı)
  res.json({
    url: result.secure_url,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
};