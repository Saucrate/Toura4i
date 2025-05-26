const mongoose = require('mongoose');
const Poem = require('../models/Poem');
const Comment = require('../models/commentModel');

const MONGODB_URI = 'mongodb+srv://toura4i:20242000@cluster0.dt2z6ns.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const updatePoemComments = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all comments
    const comments = await Comment.find({ isActive: true });
    console.log(`Found ${comments.length} comments`);

    // Group comments by poem
    const commentsByPoem = comments.reduce((acc, comment) => {
      if (!acc[comment.poem]) {
        acc[comment.poem] = [];
      }
      acc[comment.poem].push(comment._id);
      return acc;
    }, {});

    // Update all poems
    const poems = await Poem.find({});
    console.log(`Found ${poems.length} poems`);

    let updatedCount = 0;
    for (const poem of poems) {
      // Convert comments to array if it's a number
      if (typeof poem.comments === 'number' || !Array.isArray(poem.comments)) {
        poem.comments = commentsByPoem[poem._id] || [];
        await poem.save();
        updatedCount++;
        console.log(`Updated poem ${poem._id} - comments: ${poem.comments.length}`);
      }
    }

    console.log(`Migration completed successfully. Updated ${updatedCount} poems`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updatePoemComments(); 