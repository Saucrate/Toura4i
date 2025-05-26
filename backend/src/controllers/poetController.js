const Poet = require('../models/Poet');
const Poem = require('../models/Poem');
const cloudinary = require('../config/cloudinary');

// Get all poets with pagination and filters
exports.getPoets = async (req, res) => {
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

    const poets = await Poet.find(query)
      .populate('poems', 'title category image')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Poet.countDocuments(query);

    res.json({
      poets,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single poet by ID
exports.getPoetById = async (req, res) => {
  try {
    const poet = await Poet.findById(req.params.id)
      .populate({
        path: 'poems',
        select: 'title text category hasAudio audio image duration performer views likes featured',
        options: { sort: { createdAt: -1 } }
      })
      .populate('followerUsers', '_id name image')
      .populate('albums', 'title image likes views')
      .populate('photos', 'title images likes views')
      .populate('videos', 'title thumbnail likes views')
      .populate('audioRecordings', 'title image likes views')
      .populate('books', 'title cover likes views');

    if (!poet) {
      return res.status(404).json({ message: 'الشاعر غير موجود' });
    }

    // Ensure followerUsers is an array
    if (!poet.followerUsers) {
      poet.followerUsers = [];
    }

    // Check which content types the poet has
    const contentTypes = {
      hasPoems: poet.poems && poet.poems.length > 0,
      hasAlbums: poet.albums && poet.albums.length > 0,
      hasPhotos: poet.photos && poet.photos.length > 0,
      hasVideos: poet.videos && poet.videos.length > 0,
      hasAudioRecordings: poet.audioRecordings && poet.audioRecordings.length > 0,
      hasBooks: poet.books && poet.books.length > 0
    };

    res.json({
      poet,
      contentTypes
    });
  } catch (error) {
    console.error('Get poet error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات الشاعر' });
  }
};

// Create new poet (Admin only)
exports.createPoet = async (req, res) => {
  try {
    const { name, bio, period, location, website, awards } = req.body;
    let imageUrl = '';

    // Get image URL from multer-storage-cloudinary
    if (req.file) {
      imageUrl = req.file.path;
    }

    const poet = new Poet({
      name,
      bio,
      period,
      location,
      website,
      awards: awards || 0,
      image: imageUrl
    });

    await poet.save();
    res.status(201).json(poet);
  } catch (error) {
    console.error('Error in createPoet:', error);
    res.status(500).json({ message: 'Something went wrong!', error: error.message });
  }
};

// Update poet (Admin only)
exports.updatePoet = async (req, res) => {
  try {
    const { name, bio, period, location, website, awards } = req.body;
    let imageUrl = req.body.image; // Keep existing image if no new one is uploaded

    // Get new image URL from multer-storage-cloudinary if provided
    if (req.file) {
      imageUrl = req.file.path;
    }

    const poet = await Poet.findByIdAndUpdate(
      req.params.id,
      {
        name,
        bio,
        period,
        location,
        website,
        awards: awards || 0,
        image: imageUrl
      },
      { new: true }
    );

    if (!poet) {
      return res.status(404).json({ message: 'Poet not found' });
    }

    res.json(poet);
  } catch (error) {
    console.error('Error in updatePoet:', error);
    res.status(500).json({ message: 'Something went wrong!', error: error.message });
  }
};

// Delete poet (Admin only)
exports.deletePoet = async (req, res) => {
  try {
    const poet = await Poet.findById(req.params.id);
    if (!poet) {
      return res.status(404).json({ message: 'Poet not found' });
    }

    // Delete image from Cloudinary if exists
    if (poet.image) {
      const publicId = poet.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`poets/${publicId}`);
    }

    // Remove poet reference from all poems
    await Poem.updateMany(
      { poet: poet._id },
      { $unset: { poet: 1 } }
    );

    await Poet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Poet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured poets
exports.getFeaturedPoets = async (req, res) => {
  try {
    const poets = await Poet.find({ featured: true })
      .populate('poems', 'title category image')
      .limit(10);

    res.json(poets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Sync poems with poet
exports.syncPoems = async (req, res) => {
  try {
    const { poetId } = req.params;
    const poet = await Poet.findById(poetId);
    
    if (!poet) {
      return res.status(404).json({ message: 'الشاعر غير موجود' });
    }

    // Find all poems by this poet
    const poems = await Poem.find({ poet: poetId });
    
    // Update poet's poems array
    poet.poems = poems.map(poem => poem._id);
    await poet.save();

    res.json({ 
      message: 'تم تحديث قصائد الشاعر بنجاح',
      poet: poet
    });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث القصائد', error: error.message });
  }
};

// Toggle follow status for a poet
exports.toggleFollow = async (req, res) => {
  try {
    console.log('Toggle follow started');
    
    const { poetId } = req.body;
    const userId = req.user.id;

    console.log('Request data:', {
      poetId,
      userId: userId ? userId.toString() : 'undefined',
      body: req.body
    });

    if (!poetId) {
      console.log('Missing poetId');
      return res.status(400).json({ message: 'معرف الشاعر مطلوب' });
    }

    if (!userId) {
      console.log('Missing userId');
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    // Find the poet and check if user is following
    const poet = await Poet.findById(poetId);
    console.log('Found poet:', {
      exists: !!poet,
      poetId: poet?._id?.toString(),
      followers: poet?.followers,
      followerUsers: poet?.followerUsers?.length
    });

    if (!poet) {
      console.log('Poet not found');
      return res.status(404).json({ message: 'الشاعر غير موجود' });
    }

    // Initialize followerUsers if not exists
    if (!poet.followerUsers) {
      console.log('Initializing empty followerUsers array');
      poet.followerUsers = [];
    }

    // Ensure followerUsers is an array
    if (!Array.isArray(poet.followerUsers)) {
      console.log('Converting followerUsers to array');
      poet.followerUsers = [];
    }

    // Filter out invalid values
    poet.followerUsers = poet.followerUsers.filter(id => {
      const isValid = id != null;
      if (!isValid) {
        console.log('Filtered out invalid follower ID');
      }
      return isValid;
    });

    console.log('Current followerUsers:', poet.followerUsers.map(id => id?.toString()));

    // Check if user is already following
    const isFollowing = poet.followerUsers.some(follower => {
      const isMatch = follower && follower.toString() === userId.toString();
      console.log('Checking follower:', {
        follower: follower?.toString(),
        userId: userId.toString(),
        isMatch
      });
      return isMatch;
    });

    console.log('Is user following:', isFollowing);

    let update;
    if (isFollowing) {
      // Unfollow
      update = {
        $pull: { followerUsers: userId },
        $inc: { followers: -1 }
      };
      console.log('Unfollow update:', update);
    } else {
      // Follow
      update = {
        $push: { followerUsers: userId },
        $inc: { followers: 1 }
      };
      console.log('Follow update:', update);
    }

    // Update the poet
    console.log('Updating poet with:', update);
    const updatedPoet = await Poet.findOneAndUpdate(
      { _id: poetId },
      update,
      { new: true }
    ).populate('followerUsers', '_id name image');

    console.log('Update result:', {
      success: !!updatedPoet,
      followers: updatedPoet?.followers,
      followerUsersCount: updatedPoet?.followerUsers?.length
    });

    if (!updatedPoet) {
      console.log('Failed to update poet');
      return res.status(500).json({ message: 'فشل تحديث بيانات الشاعر' });
    }

    // Ensure followerUsers is an array in the updated document
    if (!Array.isArray(updatedPoet.followerUsers)) {
      console.log('Initializing followerUsers in updated document');
      updatedPoet.followerUsers = [];
    }

    // Get the current follow state
    const currentUserFollowing = updatedPoet.followerUsers.some(
      follower => follower && follower._id && follower._id.toString() === userId.toString()
    );

    console.log('Final state:', {
      isFollowing: currentUserFollowing,
      followers: updatedPoet.followers,
      followerUsersCount: updatedPoet.followerUsers.length
    });

    res.json({
      status: 'success',
      isFollowing: currentUserFollowing,
      followers: updatedPoet.followers,
      followerUsers: updatedPoet.followerUsers || []
    });
  } catch (error) {
    console.error('Toggle follow error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'حدث خطأ أثناء محاولة المتابعة' });
  }
};

// Get poet's followers
exports.getFollowers = async (req, res) => {
  try {
    const { poetId } = req.params;
    const poet = await Poet.findById(poetId)
      .populate('followerUsers', 'name image')
      .select('followerUsers');

    if (!poet) {
      return res.status(404).json({ message: 'الشاعر غير موجود' });
    }

    res.json(poet.followerUsers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المتابعين' });
  }
}; 