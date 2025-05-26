const Settings = require('../models/Settings');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Get settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Error in getSettings:', error);
    res.status(500).json({ 
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// Update application logo
exports.updateLogo = async (req, res) => {
  try {
    console.log('Updating logo with data:', {
      hasLogo: !!req.files?.logo,
      files: req.files ? Object.keys(req.files) : []
    });

    if (!req.files || !req.files.logo) {
      return res.status(400).json({ message: 'Logo is required' });
    }

    const logoFile = req.files.logo[0];
    const logoPath = logoFile.path;

    try {
      // Get current settings
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings();
      }

      // Delete old logo from Cloudinary if exists
      if (settings.logo) {
        const publicId = settings.logo.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`toura4i/logos/${publicId}`);
      }

      // Upload new logo to Cloudinary
      const logoResult = await cloudinary.uploader.upload(logoPath, {
        folder: 'toura4i/logos',
        resource_type: 'auto',
        transformation: [
          { width: 500, height: 500, crop: 'fill' },
          { quality: 'auto:good' }
        ]
      });

      // Update settings with new logo
      settings.logo = logoResult.secure_url;
      await settings.save();

      res.json({ 
        message: 'Logo updated successfully',
        settings: {
          logo: settings.logo
        }
      });
    } finally {
      // Delete the temporary file after upload
      try {
        fs.unlinkSync(logoPath);
        console.log('Temporary logo file deleted:', logoPath);
      } catch (deleteError) {
        console.error('Error deleting temporary logo file:', deleteError);
      }
    }
  } catch (error) {
    console.error('Error in updateLogo:', error);
    res.status(500).json({ 
      message: 'Error updating logo',
      error: error.message
    });
  }
}; 