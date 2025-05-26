const Photo = require('../models/Photo');
const cloudinary = require('../config/cloudinary');
const { validateObjectId } = require('../utils/validation');
const User = require('../models/User');
const fs = require('fs');
const mongoose = require('mongoose');

// Get all photos with optional filtering
exports.getAllPhotos = async (req, res) => {
  console.log('[PhotoController] getAllPhotos called with query:', req.query);
  try {
    const { category, search, featured, page = 1, limit = 12 } = req.query;
    const query = {};

    // Apply filters
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('[PhotoController] Query constructed:', query);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get photos with pagination and populate person details
    const photos = await Photo.find(query)
      .populate('person', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Photo.countDocuments(query);

    console.log(`[PhotoController] Found ${photos.length} photos out of ${total} total`);

    res.json({
      photos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[PhotoController] Error in getAllPhotos:', error);
    res.status(500).json({ message: 'Error fetching photos' });
  }
};

// Get featured photos
exports.getFeaturedPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ isFeatured: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: photos.length,
      data: photos
    });
  } catch (error) {
    console.error('Error in getFeaturedPhotos:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء جلب الصور المميزة'
    });
  }
};

// Get a single photo by ID
exports.getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;
    
    console.log('[PhotoController] getPhotoById called for ID:', id);
    console.log('[PhotoController] Request user:', req.user);
    console.log('[PhotoController] User ID from token:', userId);
    console.log('[PhotoController] Request headers:', req.headers);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('[PhotoController] Invalid photo ID:', id);
      return res.status(400).json({ 
        status: 'error',
        message: 'معرف الصورة غير صالح'
      });
    }

    const photo = await Photo.findById(id)
      .populate('person', 'name image')
      .populate('likes', '_id')
      .populate('comments');

    if (!photo) {
      console.log('[PhotoController] Photo not found:', id);
      return res.status(404).json({ 
        status: 'error',
        message: 'الصورة غير موجودة'
      });
    }

    // Increment view count
    photo.views = (photo.views || 0) + 1;
    await photo.save();
    console.log('[PhotoController] View count incremented for photo', id);

    // Check if photo is liked by user
    const isLiked = userId ? photo.likes.some(like => 
      like._id.toString() === userId.toString()
    ) : false;

    // Check if photo is saved by user
    let isSaved = false;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        isSaved = user.savedPhotos.some(savedPhoto => 
          savedPhoto.toString() === id
        );
      }
    }

    console.log('[PhotoController] Photo status:', {
      id: photo._id,
      isLiked,
      isSaved,
      likesCount: photo.likes.length,
      userId,
      likes: photo.likes.map(like => like._id)
    });

    const response = {
      status: 'success',
      data: {
        ...photo.toObject(),
        isLiked,
        isSaved,
        likes: photo.likes.map(like => like._id),
        commentsCount: photo.comments?.length || 0
      }
    };

    console.log('[PhotoController] Sending response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
  } catch (error) {
    console.error('[PhotoController] Error in getPhotoById:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'حدث خطأ أثناء جلب بيانات الصورة'
    });
  }
};

// Create a new photo
exports.createPhoto = async (req, res) => {
  try {
    // Log incoming request data
    console.log('Creating photo with data:', {
      body: req.body,
      files: req.files ? {
        fieldnames: req.files.map(f => f.fieldname),
        images: req.files.filter(f => f.fieldname === 'images').map(f => ({
          filename: f.filename,
          mimetype: f.mimetype,
          size: f.size,
          path: f.path
        }))
      } : null
    });

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      console.log('No files found in request');
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Filter only image files
    const imageFiles = req.files.filter(file => file.fieldname === 'images');
    if (imageFiles.length === 0) {
      console.log('No image files found in request');
      return res.status(400).json({ message: 'At least one image is required' });
    }

    console.log(`Processing ${imageFiles.length} image files`);

    // Upload images to Cloudinary
    const uploadPromises = imageFiles.map(async (file) => {
      try {
        console.log(`Uploading image: ${file.filename}`);
        const result = await cloudinary.uploader.upload(file.path, {
      folder: 'photos',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'fill', quality: 'auto:good' }
          ]
        });
        console.log(`Successfully uploaded image: ${file.filename}`);
        
        // Delete the file from uploads directory after successful upload
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`Deleted uploaded file: ${file.path}`);
        }
        
        return result.secure_url;
      } catch (error) {
        console.error(`Error uploading image ${file.filename}:`, error);
        // Delete the file even if upload fails
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`Deleted failed upload file: ${file.path}`);
        }
        throw error;
      }
    });

    // Wait for all uploads to complete
    const imageUrls = await Promise.all(uploadPromises);
    console.log('All images uploaded successfully:', imageUrls);

    // Create new photo
    const photo = new Photo({
      title: req.body.title,
      category: req.body.category,
      date: req.body.date,
      description: req.body.description,
      images: imageUrls.map(url => ({ url })),
      person: req.body.person
    });

    // Save photo to database
    const savedPhoto = await photo.save();
    console.log('Photo saved to database:', savedPhoto._id);

    res.status(201).json(savedPhoto);
  } catch (error) {
    console.error('Error in createPhoto:', error);
    
    // Clean up any remaining uploaded files in case of error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`Deleted file after error: ${file.path}`);
        }
      });
    }

    res.status(500).json({ 
      message: error.message || 'Error creating photo',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update a photo
exports.updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid photo ID' });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Handle new image uploads if provided
    if (req.files?.images && req.files.images.length > 0) {
      // Upload new images to Cloudinary
      const imageUploadPromises = req.files.images.map(async (file, index) => {
        try {
          const imageResult = await cloudinary.uploader.upload(file.path, {
            folder: 'photos',
            resource_type: 'auto'
          });

          // Delete the file from uploads directory after successful upload
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`Deleted uploaded file: ${file.path}`);
          }

          return {
            url: imageResult.secure_url,
            isMain: photo.images.length === 0 && index === 0,
            order: photo.images.length + index,
            metadata: {
              dimensions: imageResult.width && imageResult.height ? {
                width: imageResult.width,
                height: imageResult.height
              } : null,
              size: imageResult.bytes,
              format: imageResult.format
            }
          };
        } catch (error) {
          console.error(`Error uploading image ${file.filename}:`, error);
          // Delete the file even if upload fails
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`Deleted failed upload file: ${file.path}`);
          }
          throw error;
        }
      });

      const newImages = await Promise.all(imageUploadPromises);
      
      // If we're replacing all images, delete old ones from Cloudinary
      if (req.body.replaceAllImages === 'true') {
        const deletePromises = photo.images.map(image => {
          const publicId = image.url.split('/').pop().split('.')[0];
          return cloudinary.uploader.destroy(`photos/${publicId}`);
        });
        await Promise.all(deletePromises);
        photo.images = newImages;
      } else {
        // Otherwise append new images
        photo.images.push(...newImages);
      }
    }

    // Handle image deletion if specified
    if (req.body.deleteImages) {
      const imagesToDelete = JSON.parse(req.body.deleteImages);
      const deletePromises = imagesToDelete.map(imageId => {
        const image = photo.images.id(imageId);
        if (image) {
          const publicId = image.url.split('/').pop().split('.')[0];
          return cloudinary.uploader.destroy(`photos/${publicId}`);
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
      photo.images = photo.images.filter(img => !imagesToDelete.includes(img._id.toString()));
    }

    // Handle image reordering if specified
    if (req.body.imageOrder) {
      const newOrder = JSON.parse(req.body.imageOrder);
      photo.images = newOrder.map((id, index) => {
        const image = photo.images.id(id);
        if (image) {
          image.order = index;
          image.isMain = index === 0;
        }
        return image;
      }).filter(Boolean);
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key === 'tags' && req.body[key]) {
        photo[key] = JSON.parse(req.body[key]);
      } else if (key === 'isFeatured') {
        photo[key] = req.body[key] === 'true';
      } else if (key === 'person') {
        photo[key] = req.body[key] || null;
      } else if (!['images', 'deleteImages', 'imageOrder', 'replaceAllImages'].includes(key)) {
        photo[key] = req.body[key];
      }
    });

    const updatedPhoto = await photo.save();
    res.json(updatedPhoto);
  } catch (error) {
    console.error('Error in updatePhoto:', error);
    
    // Clean up any remaining uploaded files in case of error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`Deleted file after error: ${file.path}`);
        }
      });
    }

    res.status(500).json({ 
      message: 'Error updating photo',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Delete a photo
exports.deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid photo ID' });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete all images from Cloudinary
    const deletePromises = photo.images.map(image => {
      const publicId = image.url.split('/').pop().split('.')[0];
      return cloudinary.uploader.destroy(`photos/${publicId}`);
    });
    await Promise.all(deletePromises);

    // Use findByIdAndDelete instead of remove()
    await Photo.findByIdAndDelete(id);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error in deletePhoto:', error);
    res.status(500).json({ 
      message: 'Error deleting photo',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Toggle like on a photo
exports.toggleLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id || req.user?.id;
  console.log(`[PhotoController] toggleLike called for photo ${id} by user ${userId}`);

  try {
    if (!validateObjectId(id)) {
      console.log(`[PhotoController] Invalid photo ID: ${id}`);
      return res.status(400).json({ message: 'Invalid photo ID' });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      console.log(`[PhotoController] Photo not found with ID: ${id}`);
      return res.status(404).json({ message: 'Photo not found' });
    }

    const isLiked = photo.likes.includes(userId);
    console.log(`[PhotoController] Current like status for user ${userId}: ${isLiked}`);

    if (isLiked) {
      photo.likes = photo.likes.filter(id => id.toString() !== userId.toString());
      console.log(`[PhotoController] Removed like from photo ${id} by user ${userId}`);
    } else {
      photo.likes.push(userId);
      console.log(`[PhotoController] Added like to photo ${id} by user ${userId}`);
    }

    await photo.save();
    console.log(`[PhotoController] Updated likes count for photo ${id}: ${photo.likes.length}`);

    // Get updated photo with populated fields
    const updatedPhoto = await Photo.findById(id)
      .populate('person', 'name image')
      .populate('likes', 'name image');

    res.json({
      status: 'success',
      isLiked: !isLiked,
      likes: updatedPhoto.likes,
      likesCount: updatedPhoto.likes.length
    });
  } catch (error) {
    console.error('[PhotoController] Error in toggleLike:', error);
    res.status(500).json({ 
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// Toggle save on a photo
exports.toggleSave = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id || req.user?.id;
  console.log(`[PhotoController] toggleSave called for photo ${id} by user ${userId}`);

  try {
    if (!validateObjectId(id)) {
      console.log(`[PhotoController] Invalid photo ID: ${id}`);
      return res.status(400).json({ message: 'Invalid photo ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log(`[PhotoController] User not found: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      console.log(`[PhotoController] Photo not found: ${id}`);
      return res.status(404).json({ message: 'Photo not found' });
    }

    const isSaved = user.savedPhotos.includes(id);
    console.log(`[PhotoController] Current save status for user ${userId}: ${isSaved}`);

    if (isSaved) {
      user.savedPhotos = user.savedPhotos.filter(photoId => photoId.toString() !== id);
      console.log(`[PhotoController] Removed save from photo ${id} by user ${userId}`);
    } else {
      user.savedPhotos.push(id);
      console.log(`[PhotoController] Added save to photo ${id} by user ${userId}`);
    }

    await user.save();
    console.log(`[PhotoController] Updated saved photos for user ${userId}`);

    res.json({
      status: 'success',
      isSaved: !isSaved,
      savedPhotos: user.savedPhotos
    });
  } catch (error) {
    console.error('[PhotoController] Error in toggleSave:', error);
    res.status(500).json({ 
      message: 'Error toggling save',
      error: error.message
    });
  }
};

// Get saved photos for a user
exports.getSavedPhotos = async (req, res) => {
  const userId = req.user?.id;
  console.log(`[PhotoController] getSavedPhotos called for user: ${userId}`);
  
  try {
    if (!userId) {
      console.log('[PhotoController] User ID not found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.log(`[PhotoController] User not found: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`[PhotoController] Found ${user.savedPhotos.length} saved photos for user ${userId}`);
    
    const photos = await Photo.find({
      _id: { $in: user.savedPhotos }
    })
    .populate('person', 'name image')
    .sort({ createdAt: -1 });

    console.log(`[PhotoController] Retrieved ${photos.length} saved photos for user ${userId}`);
    
    res.json({ photos });
  } catch (error) {
    console.error('[PhotoController] Error getting saved photos:', error);
    res.status(500).json({ message: 'Error fetching saved photos' });
  }
};

// Get photos by IDs
exports.getPhotosByIds = async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: 'Photo IDs are required' });
    }

    const photoIds = ids.split(',').map(id => id.trim());
    
    // Validate all IDs
    const invalidIds = photoIds.filter(id => !validateObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid photo ID(s)',
        invalidIds 
      });
    }

    const photos = await Photo.find({ _id: { $in: photoIds } })
      .populate('person', 'name image');

    res.json({ photos });
  } catch (error) {
    console.error('Error in getPhotosByIds:', error);
    res.status(500).json({ message: 'Error fetching photos' });
  }
}; 