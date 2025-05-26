const mongoose = require('mongoose');
const Poem = require('../models/Poem');
require('dotenv').config();

const updatePoemLikes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const poems = await Poem.find({});
    console.log(`Found ${poems.length} poems`);

    for (const poem of poems) {
      // Ensure likes is an array
      if (!Array.isArray(poem.likes)) {
        poem.likes = [];
        await poem.save();
        console.log(`Updated poem ${poem._id} - likes is now an array`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

updatePoemLikes(); 