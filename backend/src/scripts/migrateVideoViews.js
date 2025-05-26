const mongoose = require('mongoose');
const Video = require('../models/Video');
require('dotenv').config();

const migrateVideoViews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all videos
    const videos = await Video.find({});
    console.log(`Found ${videos.length} videos to migrate`);

    // Update each video
    for (const video of videos) {
      // Convert viewedBy array to viewedByIPs array
      const viewedByIPs = video.viewedBy ? video.viewedBy.map(id => id.toString()) : [];
      
      // Update the video
      await Video.findByIdAndUpdate(
        video._id,
        {
          $set: { viewedByIPs },
          $unset: { viewedBy: 1 }
        }
      );
      
      console.log(`Migrated video ${video._id}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateVideoViews(); 