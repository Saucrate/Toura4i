const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const Video = require('../models/Video');
const Photo = require('../models/Photo');
const Poem = require('../models/Poem');
const Album = require('../models/Album');
const AudioRecording = require('../models/AudioRecording');
const Book = require('../models/Book');
const Place = require('../models/Place');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const sender = req.user.id;
    const { receiver, content } = req.body;
    if (!receiver || !content) return res.status(400).json({ message: 'البيانات ناقصة' });
    const message = await Message.create({ sender, receiver, content });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'تعذر إرسال الرسالة', error: err.message });
  }
};

// Share content with multiple followers
exports.shareContent = async (req, res) => {
  try {
    const sender = req.user.id;
    const { recipients, content, contentType, contentId, contentTitle, contentDescription } = req.body;
    
    if (!recipients || !recipients.length) {
      return res.status(400).json({ message: 'الرجاء اختيار متابع واحد على الأقل' });
    }

    const messages = recipients.map(receiverId => ({
      sender,
      receiver: receiverId,
      content,
      contentType,
      contentId,
      contentTitle,
      contentDescription
    }));

    const savedMessages = await Message.insertMany(messages);
    const populatedMessages = await Message.find({ _id: { $in: savedMessages.map(m => m._id) } })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture');

    res.status(201).json({ success: true, messages: populatedMessages });
  } catch (err) {
    res.status(500).json({ message: 'تعذر مشاركة المحتوى', error: err.message });
  }
};

// Get messages between two users
exports.getMessagesWithUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    
    // Get all messages between users
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    // Process messages to check for deleted content
    const processedMessages = await Promise.all(messages.map(async (message) => {
      const messageObj = message.toObject();
      
      // If message has content type and ID, check if content exists
      if (messageObj.contentType && messageObj.contentId) {
        try {
          let contentExists = false;
          
          // Check content existence based on type
          switch (messageObj.contentType) {
            case 'video':
              const video = await Video.findById(messageObj.contentId);
              contentExists = !!video;
              break;
            case 'photo':
              const photo = await Photo.findById(messageObj.contentId);
              contentExists = !!photo;
              break;
            case 'poem':
              const poem = await Poem.findById(messageObj.contentId);
              contentExists = !!poem;
              break;
            case 'album':
              const album = await Album.findById(messageObj.contentId);
              contentExists = !!album;
              break;
            case 'audio':
              const audio = await AudioRecording.findById(messageObj.contentId);
              contentExists = !!audio;
              break;
            case 'book':
              const book = await Book.findById(messageObj.contentId);
              contentExists = !!book;
              break;
            case 'place':
              const place = await Place.findById(messageObj.contentId);
              contentExists = !!place;
              break;
          }
          
          // If content doesn't exist, mark message as deleted
          if (!contentExists) {
            messageObj.isContentDeleted = true;
            messageObj.contentTitle = 'تم حذف هذا المحتوى';
            messageObj.contentDescription = 'لم يعد هذا المحتوى متاحاً';
          }
        } catch (error) {
          console.error('Error checking content existence:', error);
          messageObj.isContentDeleted = true;
          messageObj.contentTitle = 'تم حذف هذا المحتوى';
          messageObj.contentDescription = 'لم يعد هذا المحتوى متاحاً';
        }
      }
      
      return messageObj;
    }));

    res.json(processedMessages);
  } catch (err) {
    console.error('Error in getMessagesWithUser:', err);
    res.status(500).json({ message: 'تعذر جلب الرسائل', error: err.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    await Message.updateMany({ sender: otherUserId, receiver: userId, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'تعذر وضع علامة مقروء', error: err.message });
  }
};

// Get conversation list (last message, unread count)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({ $or: [ { sender: userId }, { receiver: userId } ] })
      .sort({ createdAt: -1 });
    const usersMap = {};
    messages.forEach(msg => {
      const otherId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
      if (!usersMap[otherId]) {
        usersMap[otherId] = { lastMessage: msg.content, lastDate: msg.createdAt, unreadCount: 0, userId: otherId };
      }
      if (!msg.read && msg.receiver.toString() === userId) {
        usersMap[otherId].unreadCount += 1;
      }
    });
    const userIds = Object.keys(usersMap);
    const users = await User.find({ _id: { $in: userIds } }).select('name avatar');
    const conversations = users.map(u => ({
      user: { _id: u._id, name: u.name, avatar: u.avatar },
      lastMessage: usersMap[u._id.toString()].lastMessage,
      unreadCount: usersMap[u._id.toString()].unreadCount
    }));
    conversations.sort((a, b) => {
      const aDate = usersMap[a.user._id.toString()].lastDate;
      const bDate = usersMap[b.user._id.toString()].lastDate;
      return bDate - aDate;
    });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'تعذر جلب المحادثات', error: err.message });
  }
};

// Get total unread messages count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({ receiver: userId, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'تعذر جلب عدد الرسائل غير المقروءة', error: err.message });
  }
};

exports.getMessageStats = async (req, res) => {
  try {
    const { userId, otherUserId } = req.query;

    if (!userId || !otherUserId) {
      return res.status(400).json({ message: 'يرجى تحديد المستخدمين' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: 'معرفات المستخدمين غير صالحة' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const otherUserObjectId = new mongoose.Types.ObjectId(otherUserId);

    const stats = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userObjectId, receiver: otherUserObjectId },
            { sender: otherUserObjectId, receiver: userObjectId }
          ]
        }
      },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize default values
    const result = {
      text: 0,
      album: 0,
      audio: 0,
      book: 0,
      place: 0,
      poem: 0,
      video: 0,
      photo: 0
    };

    // Update counts from aggregation results
    stats.forEach(stat => {
      if (stat._id && result.hasOwnProperty(stat._id)) {
        result[stat._id] = stat.count;
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting message stats:', error);
    res.status(500).json({ 
      message: 'حدث خطأ أثناء جلب إحصائيات الرسائل',
      error: error.message 
    });
  }
};

exports.getSharedContent = async (req, res) => {
  try {
    const { userId, otherUserId } = req.query;

    if (!userId || !otherUserId) {
      return res.status(400).json({ message: 'يرجى تحديد المستخدمين' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: 'معرفات المستخدمين غير صالحة' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const otherUserObjectId = new mongoose.Types.ObjectId(otherUserId);

    const messages = await Message.find({
      $or: [
        { sender: userObjectId, receiver: otherUserObjectId },
        { sender: otherUserObjectId, receiver: userObjectId }
      ],
      contentType: { $exists: true, $ne: null }
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: -1 });

    // Group messages by content type
    const groupedContent = {
      text: [],
      album: [],
      audio: [],
      book: [],
      place: [],
      poem: [],
      video: [],
      photo: []
    };

    messages.forEach(message => {
      if (message.contentType && groupedContent.hasOwnProperty(message.contentType)) {
        groupedContent[message.contentType].push({
          _id: message._id,
          content: message.content,
          contentType: message.contentType,
          contentId: message.contentId,
          contentTitle: message.contentTitle,
          contentDescription: message.contentDescription,
          createdAt: message.createdAt,
          sender: message.sender,
          receiver: message.receiver
        });
      }
    });

    res.json(groupedContent);
  } catch (error) {
    console.error('Error getting shared content:', error);
    res.status(500).json({ 
      message: 'حدث خطأ أثناء جلب المحتوى المشترك',
      error: error.message 
    });
  }
}; 