const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');
const Poem = require('../models/Poem');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('savedAlbums savedPoems favorites playlists');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle avatar upload if new avatar is provided
    if (req.files?.avatar) {
      // Delete old avatar from Cloudinary if exists
      if (user.avatar) {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
      }
      
      // Upload new avatar to Cloudinary
      const avatarResult = await cloudinary.uploader.upload(req.files.avatar[0].path, {
        folder: 'avatars',
        resource_type: 'auto'
      });
      user.avatar = avatarResult.secure_url;
    }

    // Update other fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('followerUsers', 'name avatar')
      .populate('followingUsers', 'name avatar');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle user block status
exports.toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send notification to users
exports.sendNotification = async (req, res) => {
  try {
    const { userIds, message } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one user' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a notification message' });
    }

    // Create notifications for each user
    const notifications = await Promise.all(
      userIds.map(userId => 
        new Notification({
          userId,
          message
        }).save()
      )
    );

    res.json({ message: 'Notifications sent successfully', notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleSavePoem = async (req, res) => {
  try {
    console.log('=== toggleSavePoem START ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    
    const user = await User.findById(req.user.id);
    console.log('Found user:', user ? {
      _id: user._id,
      savedPoems: user.savedPoems
    } : 'User not found');
    
    if (!user) {
      console.log('User not found, returning 404');
      return res.status(404).json({ error: 'User not found' });
    }

    const poemId = req.params.id;
    console.log('Poem ID to toggle:', poemId);
    
    // Check if poem exists
    const poem = await Poem.findById(poemId);
    if (!poem) {
      console.log('Poem not found, returning 404');
      return res.status(404).json({ error: 'Poem not found' });
    }

    const index = user.savedPoems.indexOf(poemId);
    console.log('Current index in savedPoems:', index);
    
    let isSaved;
    if (index === -1) {
      user.savedPoems.push(poemId);
      isSaved = true;
      console.log('Poem added to savedPoems');
    } else {
      user.savedPoems.splice(index, 1);
      isSaved = false;
      console.log('Poem removed from savedPoems');
    }
    
    console.log('New savedPoems array:', user.savedPoems);
    await user.save();
    console.log('User saved successfully');
    console.log('=== toggleSavePoem END ===');
    
    res.json({ isSaved });
  } catch (error) {
    console.error('=== toggleSavePoem ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('=== toggleSavePoem ERROR END ===');
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.getSavedPoems = async (req, res) => {
  try {
    console.log('=== getSavedPoems START ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    
    const user = await User.findById(req.params.id);
    console.log('Found user:', user ? {
      _id: user._id,
      savedPoems: user.savedPoems
    } : 'User not found');
    
    if (!user) {
      console.log('User not found, returning 404');
      return res.status(404).json({ message: 'User not found' });
    }

    // First, verify that the poems exist
    const poemIds = user.savedPoems.map(id => id.toString());
    console.log('Saved poem IDs:', poemIds);

    const existingPoems = await Poem.find({ _id: { $in: poemIds } });
    console.log('Found existing poems:', existingPoems.length);

    // Update user's savedPoems to only include existing poems
    const validPoemIds = existingPoems.map(poem => poem._id);
    if (validPoemIds.length !== poemIds.length) {
      console.log('Some saved poems no longer exist, updating user');
      user.savedPoems = validPoemIds;
      await user.save();
    }

    // Now populate the poems with their details
    const populatedPoems = await Poem.find({ _id: { $in: validPoemIds } })
      .populate('poet', 'name image')
      .lean();

    console.log('Populated poems:', populatedPoems.length);
    console.log('=== getSavedPoems END ===');
    
    res.json({ poems: populatedPoems });
  } catch (error) {
    console.error('=== getSavedPoems ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('=== getSavedPoems ERROR END ===');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPoemsByIds = async (req, res) => {
  try {
    console.log('Raw query ids:', req.query.ids);
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    console.log('Parsed ids array:', ids);
    
    if (!ids.length) {
      return res.status(400).json({ message: 'No IDs provided' });
    }

    // Validate each ID is a valid ObjectId
    const validIds = ids.filter(id => {
      try {
        return mongoose.Types.ObjectId.isValid(id);
      } catch (err) {
        console.log('Invalid ID:', id, err);
        return false;
      }
    });
    console.log('Valid ObjectIds:', validIds);

    const poems = await Poem.find({ _id: { $in: validIds } });
    console.log('Found poems:', poems.length);
    res.json({ poems });
  } catch (error) {
    console.error('Error in getPoemsByIds:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Albüm kaydet/çıkar (toggle)
exports.toggleSaveAlbum = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const albumId = req.params.id;
    const index = user.savedAlbums.indexOf(albumId);
    let isSaved;
    if (index === -1) {
      user.savedAlbums.push(albumId);
      isSaved = true;
    } else {
      user.savedAlbums.splice(index, 1);
      isSaved = false;
    }
    await user.save();
    res.json({ isSaved });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Kullanıcının kayıtlı albümleri
exports.getSavedAlbums = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('savedAlbums');
    res.json({ albums: user.savedAlbums });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleSavePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const photoId = req.params.id;
    const index = user.savedPhotos.indexOf(photoId);
    let isSaved;
    if (index === -1) {
      user.savedPhotos.push(photoId);
      isSaved = true;
    } else {
      user.savedPhotos.splice(index, 1);
      isSaved = false;
    }
    await user.save();
    res.json({ isSaved });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.getSavedPhotos = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('savedPhotos');
    res.json({ photos: user.savedPhotos });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleSaveVideo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const videoId = req.params.id;
    const index = user.savedVideos.indexOf(videoId);
    let isSaved;
    if (index === -1) {
      user.savedVideos.push(videoId);
      isSaved = true;
    } else {
      user.savedVideos.splice(index, 1);
      isSaved = false;
    }
    await user.save();
    res.json({ isSaved });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.getSavedVideos = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'savedVideos',
        select: 'title description category date location video thumbnail views viewedByIPs likes comments person duration',
        populate: {
          path: 'person',
          select: 'name image'
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ videos: user.savedVideos });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleSaveAudio = async (req, res) => {
  try {
    console.log('=== toggleSaveAudio START ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);
    
    const user = await User.findById(req.user.id);
    console.log('Found user:', user ? {
      _id: user._id,
      savedAudios: user.savedAudios
    } : 'User not found');
    
    if (!user) {
      console.log('User not found, returning 404');
      return res.status(404).json({ error: 'User not found' });
    }
    
    const audioId = req.params.id;
    console.log('Audio ID to toggle:', audioId);
    
    const index = user.savedAudios.indexOf(audioId);
    console.log('Current index in savedAudios:', index);
    
    let isSaved;
    if (index === -1) {
      user.savedAudios.push(audioId);
      isSaved = true;
      console.log('Audio added to savedAudios');
    } else {
      user.savedAudios.splice(index, 1);
      isSaved = false;
      console.log('Audio removed from savedAudios');
    }
    
    console.log('New savedAudios array:', user.savedAudios);
    await user.save();
    console.log('User saved successfully');
    console.log('=== toggleSaveAudio END ===');
    
    res.json({ isSaved });
  } catch (error) {
    console.error('=== toggleSaveAudio ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('=== toggleSaveAudio ERROR END ===');
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.getSavedAudios = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'savedAudios',
        populate: {
          path: 'performer',
          select: 'name image'
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ audios: user.savedAudios });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleSavePlace = async (req, res) => {
  try {
    console.log('=== toggleSavePlace START ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);
    
    const user = await User.findById(req.user.id);
    console.log('Found user:', user ? {
      _id: user._id,
      savedPlaces: user.savedPlaces
    } : 'User not found');
    
    if (!user) {
      console.log('User not found, returning 404');
      return res.status(404).json({ error: 'User not found' });
    }
    
    const placeId = req.params.id;
    console.log('Place ID to toggle:', placeId);
    
    const index = user.savedPlaces.indexOf(placeId);
    console.log('Current index in savedPlaces:', index);
    
    let isSaved;
    if (index === -1) {
      user.savedPlaces.push(placeId);
      isSaved = true;
      console.log('Place added to savedPlaces');
    } else {
      user.savedPlaces.splice(index, 1);
      isSaved = false;
      console.log('Place removed from savedPlaces');
    }
    
    console.log('New savedPlaces array:', user.savedPlaces);
    await user.save();
    console.log('User saved successfully');
    console.log('=== toggleSavePlace END ===');
    
    res.json({ isSaved });
  } catch (error) {
    console.error('=== toggleSavePlace ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('=== toggleSavePlace ERROR END ===');
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.getSavedPlaces = async (req, res) => {
  try {
    console.log('=== getSavedPlaces START ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);
    
    const user = await User.findById(req.params.id).populate('savedPlaces');
    console.log('Found user:', user ? {
      _id: user._id,
      savedPlaces: user.savedPlaces
    } : 'User not found');
    
    if (!user) {
      console.log('User not found, returning 404');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Returning saved places:', user.savedPlaces);
    console.log('=== getSavedPlaces END ===');
    res.json({ places: user.savedPlaces });
  } catch (error) {
    console.error('=== getSavedPlaces ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('=== getSavedPlaces ERROR END ===');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread notifications count
exports.getUnreadNotificationsCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all notifications for user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle follow status for a user
exports.toggleFollow = async (req, res) => {
  try {
    console.log('Toggle follow started');
    
    const { userId } = req.body;
    const currentUserId = req.user.id;

    console.log('Request data:', {
      userId,
      currentUserId: currentUserId ? currentUserId.toString() : 'undefined',
      body: req.body
    });

    if (!userId) {
      console.log('Missing userId');
      return res.status(400).json({ message: 'معرف المستخدم مطلوب' });
    }

    if (!currentUserId) {
      console.log('Missing currentUserId');
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    // Find the user to follow and check if current user is following
    const userToFollow = await User.findById(userId);
    console.log('Found user to follow:', {
      exists: !!userToFollow,
      userId: userToFollow?._id?.toString(),
      followers: userToFollow?.followers,
      followerUsers: userToFollow?.followerUsers?.length
    });

    if (!userToFollow) {
      console.log('User not found');
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // Initialize followerUsers if not exists
    if (!userToFollow.followerUsers) {
      console.log('Initializing empty followerUsers array');
      userToFollow.followerUsers = [];
    }

    // Ensure followerUsers is an array
    if (!Array.isArray(userToFollow.followerUsers)) {
      console.log('Converting followerUsers to array');
      userToFollow.followerUsers = [];
    }

    // Filter out invalid values
    userToFollow.followerUsers = userToFollow.followerUsers.filter(id => {
      const isValid = id != null;
      if (!isValid) {
        console.log('Filtered out invalid follower ID');
      }
      return isValid;
    });

    console.log('Current followerUsers:', userToFollow.followerUsers.map(id => id?.toString()));

    // Check if current user is already following
    const isFollowing = userToFollow.followerUsers.some(follower => {
      const isMatch = follower && follower.toString() === currentUserId.toString();
      console.log('Checking follower:', {
        follower: follower?.toString(),
        currentUserId: currentUserId.toString(),
        isMatch
      });
      return isMatch;
    });

    console.log('Is user following:', isFollowing);

    let update;
    if (isFollowing) {
      // Unfollow
      update = {
        $pull: { followerUsers: currentUserId },
        $inc: { followers: -1 }
      };
      console.log('Unfollow update:', update);
    } else {
      // Follow
      update = {
        $push: { followerUsers: currentUserId },
        $inc: { followers: 1 }
      };
      console.log('Follow update:', update);
    }

    // Update the user to follow
    console.log('Updating user with:', update);
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      update,
      { new: true }
    ).populate('followerUsers', '_id name avatar');

    // Update current user's following count
    const currentUserUpdate = isFollowing
      ? { $pull: { followingUsers: userId }, $inc: { following: -1 } }
      : { $push: { followingUsers: userId }, $inc: { following: 1 } };

    await User.findByIdAndUpdate(currentUserId, currentUserUpdate);

    console.log('Update result:', {
      success: !!updatedUser,
      followers: updatedUser?.followers,
      followerUsersCount: updatedUser?.followerUsers?.length
    });

    if (!updatedUser) {
      console.log('Failed to update user');
      return res.status(500).json({ message: 'فشل تحديث بيانات المستخدم' });
    }

    // Ensure followerUsers is an array in the updated document
    if (!Array.isArray(updatedUser.followerUsers)) {
      console.log('Initializing followerUsers in updated document');
      updatedUser.followerUsers = [];
    }

    // Get the current follow state
    const currentUserFollowing = updatedUser.followerUsers.some(
      follower => follower && follower._id && follower._id.toString() === currentUserId.toString()
    );

    console.log('Final state:', {
      isFollowing: currentUserFollowing,
      followers: updatedUser.followers,
      followerUsersCount: updatedUser.followerUsers.length
    });

    res.json({
      status: 'success',
      isFollowing: currentUserFollowing,
      followers: updatedUser.followers,
      followerUsers: updatedUser.followerUsers || []
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

// Get user's followers
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('followerUsers', 'name avatar')
      .select('followerUsers');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json(user.followerUsers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المتابعين' });
  }
};

// Get user's following
exports.getFollowing = async (req, res) => {
  try {
    console.log('Getting following for user:', req.user.id);
    
    const user = await User.findById(req.user.id)
      .populate('followingUsers', 'name avatar username photo')
      .select('followingUsers');

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ 
        status: 'error',
        message: 'المستخدم غير موجود' 
      });
    }

    console.log('Found following users:', user.followingUsers?.length || 0);

    res.json({
      status: 'success',
      data: user.followingUsers || []
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'حدث خطأ أثناء جلب المتابَعين',
      error: error.message 
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting user details for ID:', userId);

    const user = await User.findById(userId)
      .select('-password')
      .populate('savedPoems savedAlbums savedVideos')
      .populate('followerUsers', 'name avatar')
      .populate('followingUsers', 'name avatar');

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    console.log('User found:', {
      id: user._id,
      name: user.name,
      followers: user.followers,
      following: user.following
    });

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات المستخدم' });
  }
};

// Update user's online status
exports.updateOnlineStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isOnline } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isOnline,
        lastSeen: isOnline ? Date.now() : Date.now()
      },
      { new: true }
    ).select('isOnline lastSeen');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة الاتصال' });
  }
};

// Get user's online status
exports.getOnlineStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('isOnline lastSeen');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // If user was last seen more than 5 minutes ago, consider them offline
    const isActuallyOnline = user.isOnline && 
      (Date.now() - new Date(user.lastSeen).getTime()) < 5 * 60 * 1000;

    res.json({
      isOnline: isActuallyOnline,
      lastSeen: user.lastSeen
    });
  } catch (error) {
    console.error('Get online status error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب حالة الاتصال' });
  }
}; 