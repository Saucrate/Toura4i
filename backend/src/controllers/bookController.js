const Book = require('../models/Book');
const Poet = require('../models/Poet');
const cloudinary = require('../config/cloudinary');
const { validateObjectId } = require('../utils/validation');
const fs = require('fs');
const path = require('path');

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const books = await Book.find(query)
      .populate('poet', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(query);

    res.json({
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllBooks:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    const book = await Book.findById(id)
      .populate('poet', 'name image bio period location')
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar')
      .populate('likes', 'name avatar');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Convert to plain object to modify
    const bookObj = book.toObject();

    // Add likesCount and views
    bookObj.likesCount = bookObj.likes ? bookObj.likes.length : 0;
    bookObj.views = bookObj.views || 0;

    // If user is authenticated, check if they've liked it
    if (req.user) {
      bookObj.isLiked = bookObj.likes.some(like => 
        like._id.toString() === req.user._id.toString()
      );
      
      // Check if user has liked any comments
      bookObj.comments = bookObj.comments.map(comment => {
        const commentObj = {
          ...comment,
          likesCount: comment.likes ? comment.likes.length : 0,
          isLiked: comment.likes.some(like => 
            like._id.toString() === req.user._id.toString()
          ),
          replies: comment.replies.map(reply => ({
            ...reply,
            likesCount: reply.likes ? reply.likes.length : 0,
            isLiked: reply.likes.some(like => 
              like._id.toString() === req.user._id.toString()
            )
          }))
        };
        return commentObj;
      });
    }

    // Increment view count if user hasn't viewed before
    const userIp = req.ip;
    if (!book.viewedByIPs.includes(userIp)) {
      book.viewedByIPs.push(userIp);
      book.views += 1;
      await book.save();
      bookObj.views = book.views;
    }

    // Format the link to include book title
    if (bookObj.link) {
      const bookTitle = bookObj.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      bookObj.link = `${bookObj.link}/${bookTitle}.pdf`;
    }

    res.json(bookObj);
  } catch (error) {
    console.error('Error in getBookById:', error);
    res.status(500).json({ message: 'Error fetching book' });
  }
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    console.log('Received book data:', req.body);
    console.log('Received file:', req.file);

    const { title, poet, year, category, description, link } = req.body;

    // Validate required fields
    if (!title || !poet || !year || !category || !description) {
      console.log('Missing required fields:', { title, poet, year, category, description });
      return res.status(400).json({ 
        message: 'جميع الحقول مطلوبة',
        error: 'Missing required fields'
      });
    }

    // Validate poet exists
    const poetExists = await Poet.findById(poet);
    if (!poetExists) {
      return res.status(400).json({ message: 'الشاعر غير موجود' });
    }

    let coverUrl = '';
    if (req.file) {
      try {
        console.log('Uploading file to Cloudinary:', req.file.path);
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'books'
        });
        coverUrl = result.secure_url;
        console.log('Cloudinary upload successful:', coverUrl);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        coverUrl = req.file.path;
      }
    }

    const book = new Book({
      title,
      poet,
      year: parseInt(year),
      category,
      description,
      link,
      cover: coverUrl
    });

    console.log('Saving book to database:', book);
    const savedBook = await book.save();
    console.log('Book saved successfully:', savedBook);

    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    // Populate poet data before sending response
    const populatedBook = await Book.findById(savedBook._id).populate('poet', 'name image');
    res.status(201).json(populatedBook);
  } catch (error) {
    console.error('Error in createBook:', error);
    res.status(500).json({ 
      message: 'خطأ في الخادم',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Validate poet if provided
    if (req.body.poet) {
      const poetExists = await Poet.findById(req.body.poet);
      if (!poetExists) {
        return res.status(400).json({ message: 'الشاعر غير موجود' });
      }
    }

    // Handle image upload if new image is provided
    if (req.files?.cover) {
      // Delete old image from Cloudinary if exists
      if (book.cover) {
        const publicId = book.cover.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`books/${publicId}`);
      }
      
      // Upload new image to Cloudinary
      const imageResult = await cloudinary.uploader.upload(req.files.cover[0].path, {
        folder: 'books',
        resource_type: 'auto'
      });
      book.cover = imageResult.secure_url;

      // Delete the uploaded file
      fs.unlinkSync(req.files.cover[0].path);
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'cover') {
        book[key] = req.body[key];
      }
    });

    const updatedBook = await book.save();
    const populatedBook = await Book.findById(updatedBook._id).populate('poet', 'name image');
    res.json(populatedBook);
  } catch (error) {
    console.error('Error in updateBook:', error);
    res.status(500).json({ message: 'Error updating book' });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Delete image from Cloudinary if exists
    if (book.cover) {
      const publicId = book.cover.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`books/${publicId}`);
    }

    await Book.findByIdAndDelete(id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error in deleteBook:', error);
    res.status(500).json({ message: 'Error deleting book' });
  }
};

exports.incrementViews = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.views += 1;
    await book.save();

    res.json({ message: 'View count incremented' });
  } catch (error) {
    console.error('Error in incrementViews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like/unlike book
exports.likeBook = async (req, res) => {
  try {
    // Token kontrolü
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const userId = req.user.id;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const likeIndex = book.likes.indexOf(userId);

    if (likeIndex === -1) {
      book.likes.push(userId);
    } else {
      book.likes.splice(likeIndex, 1);
    }

    await book.save();

    res.json({
      success: true,
      isLiked: likeIndex === -1,
      likes: book.likes,
      likesCount: book.likes.length
    });
  } catch (error) {
    console.error('Error in likeBook:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Error liking book' });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    // Token kontrolü
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const userId = req.user.id;
    const { text, parentCommentId } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const commentData = {
      user: userId,
      text,
      likes: [],
      replies: [],
      createdAt: new Date()
    };

    if (parentCommentId) {
      // This is a reply
      const parentComment = book.comments.id(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      
      const replyData = {
        ...commentData,
        user: userId,
        isReply: true
      };
      
      parentComment.replies.push(replyData);
    } else {
      // This is a new comment
      const newComment = {
        ...commentData,
        user: userId,
        isReply: false
      };
      
      book.comments.push(newComment);
    }

    await book.save();

    // Get updated book with populated user data
    const updatedBook = await Book.findById(req.params.id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    const newComment = parentCommentId 
      ? updatedBook.comments.id(parentCommentId).replies[updatedBook.comments.id(parentCommentId).replies.length - 1]
      : updatedBook.comments[updatedBook.comments.length - 1];

    // Add likesCount and isLiked
    const commentObj = newComment.toObject();
    commentObj.likesCount = commentObj.likes ? commentObj.likes.length : 0;
    commentObj.isLiked = false;
    commentObj.isReply = !!parentCommentId;

    res.json(commentObj);
  } catch (error) {
    console.error('Error in addComment:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// Like/unlike comment or reply
exports.likeComment = async (req, res) => {
  try {
    // Token kontrolü
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const userId = req.user.id;
    const { id: bookId, commentId } = req.params;
    const { replyId } = req.body;

    console.log('Like comment params:', { bookId, commentId, replyId, userId });

    const book = await Book.findById(bookId);
    if (!book) {
      console.log('Book not found:', bookId);
      return res.status(404).json({ message: 'Book not found' });
    }

    const comment = book.comments.id(commentId);
    if (!comment) {
      console.log('Comment not found:', commentId);
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (replyId) {
      // Handle reply like
      const reply = comment.replies.id(replyId);
      if (!reply) {
        console.log('Reply not found:', replyId);
        return res.status(404).json({ message: 'Reply not found' });
      }

      const likeIndex = reply.likes.indexOf(userId);
      if (likeIndex === -1) {
        reply.likes.push(userId);
      } else {
        reply.likes.splice(likeIndex, 1);
      }

      await book.save();

      // Get updated book with populated user data
      const updatedBook = await Book.findById(bookId)
        .populate('comments.user', 'name avatar')
        .populate('comments.replies.user', 'name avatar');

      const updatedComment = updatedBook.comments.id(commentId);
      const updatedReply = updatedComment.replies.id(replyId);

      res.json({
        success: true,
        isLiked: likeIndex === -1,
        likes: updatedReply.likes,
        likesCount: updatedReply.likes.length,
        isReply: true
      });
    } else {
      // Handle comment like
      const likeIndex = comment.likes.indexOf(userId);
      if (likeIndex === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes.splice(likeIndex, 1);
      }

      await book.save();

      // Get updated book with populated user data
      const updatedBook = await Book.findById(bookId)
        .populate('comments.user', 'name avatar')
        .populate('comments.replies.user', 'name avatar');

      const updatedComment = updatedBook.comments.id(commentId);

      res.json({
        success: true,
        isLiked: likeIndex === -1,
        likes: updatedComment.likes,
        likesCount: updatedComment.likes.length,
        isReply: false
      });
    }
  } catch (error) {
    console.error('Error in likeComment:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Error liking comment' });
  }
};

// Check if user liked a book
exports.checkBookLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const isLiked = book.likes.includes(userId);
    res.json({ isLiked });
  } catch (error) {
    console.error('Error in checkBookLike:', error);
    res.status(500).json({ message: 'Error checking like status' });
  }
};

// Get book comments with replies
exports.getBookComments = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user?._id;

    const book = await Book.findById(bookId)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Convert to plain object to modify
    const comments = book.comments.map(comment => {
      const commentObj = comment.toObject();
      
      // Check if user liked the comment
      if (userId) {
        commentObj.isLiked = commentObj.likes.includes(userId);
        
        // Check likes for replies
        commentObj.replies = commentObj.replies.map(reply => {
          const replyObj = reply;
          replyObj.isLiked = replyObj.likes.includes(userId);
          return replyObj;
        });
      }
      
      return commentObj;
    });

    res.json(comments);
  } catch (error) {
    console.error('Error in getBookComments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Add reply to a comment
exports.addReply = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId, commentId } = req.params;
    const { text } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const comment = book.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const replyData = {
      user: userId,
      text,
      likes: []
    };

    comment.replies.push(replyData);
    await book.save();

    // Get updated comment with populated user data
    const updatedBook = await Book.findById(bookId)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    const updatedComment = updatedBook.comments.id(commentId);
    const newReply = updatedComment.replies[updatedComment.replies.length - 1];

    res.json(newReply);
  } catch (error) {
    console.error('Error in addReply:', error);
    res.status(500).json({ message: 'Error adding reply' });
  }
};

// Like/unlike a reply
exports.likeReply = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId, commentId, replyId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const comment = book.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const likeIndex = reply.likes.indexOf(userId);
    if (likeIndex === -1) {
      reply.likes.push(userId);
    } else {
      reply.likes.splice(likeIndex, 1);
    }

    await book.save();

    res.json({
      isLiked: likeIndex === -1,
      likes: reply.likes
    });
  } catch (error) {
    console.error('Error in likeReply:', error);
    res.status(500).json({ message: 'Error liking reply' });
  }
};

// Get books by IDs
exports.getBooksByIds = async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: 'Book IDs are required' });
    }

    const bookIds = ids.split(',').map(id => id.trim());
    
    // Validate all IDs
    const invalidIds = bookIds.filter(id => !validateObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid book ID(s)',
        invalidIds 
      });
    }

    const books = await Book.find({ _id: { $in: bookIds } })
      .populate('poet', 'name image');

    res.json({ books });
  } catch (error) {
    console.error('Error in getBooksByIds:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
}; 