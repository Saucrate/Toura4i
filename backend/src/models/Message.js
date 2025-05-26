const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  contentType: { type: String, enum: ['text', 'album', 'audio', 'book', 'place', 'poem', 'video', 'photo'], default: 'text' },
  contentId: { type: mongoose.Schema.Types.ObjectId, refPath: 'contentType' },
  contentTitle: String,
  contentDescription: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, read: 1 });
messageSchema.index({ contentType: 1, contentId: 1 });

module.exports = mongoose.model('Message', messageSchema); 