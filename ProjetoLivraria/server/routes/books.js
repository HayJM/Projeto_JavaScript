const express = require('express');
const Book = require('../models/Book');
const { protect, admin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all books with filtering, sorting, and pagination
// @route   GET /api/books
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Build filter object
    const filter = {};
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Rating filter
    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating) };
    }
    
    // Stock filter (in stock only)
    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }
    
    // Featured filter
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    
    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Author filter
    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: 'i' };
    }
    
    // Publisher filter
    if (req.query.publisher) {
      filter.publisher = { $regex: req.query.publisher, $options: 'i' };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Sorting
    let sort = {};
    switch (req.query.sort) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'title':
        sort = { title: 1 };
        break;
      case 'author':
        sort = { author: 1 };
        break;
      default:
        sort = { featured: -1, createdAt: -1 };
    }

    // If text search, add score sorting
    if (req.query.search) {
      sort = { score: { $meta: 'textScore' }, ...sort };
    }

    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-reviews'); // Exclude reviews for performance

    const total = await Book.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        books,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBooks: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        },
        filters: {
          category: req.query.category,
          priceRange: {
            min: req.query.minPrice,
            max: req.query.maxPrice
          },
          search: req.query.search,
          sort: req.query.sort
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching books'
    });
  }
});

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('reviews.user', 'name avatar');
    
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        book
      }
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching book'
    });
  }
});

// @desc    Get book categories
// @route   GET /api/books/categories/list
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    
    res.json({
      status: 'success',
      data: {
        categories: categories.sort()
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching categories'
    });
  }
});

// @desc    Get featured books
// @route   GET /api/books/featured/list
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const books = await Book.find({ featured: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
      .select('-reviews');

    res.json({
      status: 'success',
      data: {
        books
      }
    });
  } catch (error) {
    console.error('Get featured books error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching featured books'
    });
  }
});

// @desc    Add review to book
// @route   POST /api/books/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    // Check if user already reviewed this book
    const existingReview = book.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this book'
      });
    }

    // Add review
    book.reviews.push({
      user: req.user._id,
      rating,
      comment: comment || ''
    });

    // Update book rating
    const totalRating = book.reviews.reduce((acc, review) => acc + review.rating, 0);
    book.rating = (totalRating / book.reviews.length).toFixed(1);

    await book.save();
    await book.populate('reviews.user', 'name avatar');

    res.status(201).json({
      status: 'success',
      message: 'Review added successfully',
      data: {
        reviews: book.reviews,
        averageRating: book.rating
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding review'
    });
  }
});

// @desc    Update review
// @route   PUT /api/books/:id/reviews/:reviewId
// @access  Private
router.put('/:id/reviews/:reviewId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    const review = book.reviews.id(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update your own reviews'
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    // Recalculate average rating
    const totalRating = book.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    book.rating = (totalRating / book.reviews.length).toFixed(1);

    await book.save();
    await book.populate('reviews.user', 'name avatar');

    res.json({
      status: 'success',
      message: 'Review updated successfully',
      data: {
        review,
        averageRating: book.rating
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating review'
    });
  }
});

// @desc    Delete review
// @route   DELETE /api/books/:id/reviews/:reviewId
// @access  Private
router.delete('/:id/reviews/:reviewId', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    const review = book.reviews.id(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own reviews'
      });
    }

    // Remove review
    book.reviews.pull(review._id);

    // Recalculate average rating
    if (book.reviews.length > 0) {
      const totalRating = book.reviews.reduce((acc, rev) => acc + rev.rating, 0);
      book.rating = (totalRating / book.reviews.length).toFixed(1);
    } else {
      book.rating = 0;
    }

    await book.save();

    res.json({
      status: 'success',
      message: 'Review deleted successfully',
      data: {
        averageRating: book.rating
      }
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting review'
    });
  }
});

// Admin routes

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const book = await Book.create(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Book created successfully',
      data: {
        book
      }
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating book'
    });
  }
});

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Book updated successfully',
      data: {
        book
      }
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating book'
    });
  }
});

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting book'
    });
  }
});

// @desc    Get book statistics
// @route   GET /api/books/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const inStockBooks = await Book.countDocuments({ stock: { $gt: 0 } });
    const outOfStockBooks = await Book.countDocuments({ stock: 0 });
    const featuredBooks = await Book.countDocuments({ featured: true });
    
    const categoryStats = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const priceRangeStats = await Book.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$price', 20] }, then: '0-20' },
                { case: { $lt: ['$price', 50] }, then: '20-50' },
                { case: { $lt: ['$price', 100] }, then: '50-100' },
                { case: { $gte: ['$price', 100] }, then: '100+' }
              ],
              default: 'Other'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        overview: {
          totalBooks,
          inStockBooks,
          outOfStockBooks,
          featuredBooks
        },
        categoryStats,
        priceRangeStats
      }
    });
  } catch (error) {
    console.error('Get book stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching book statistics'
    });
  }
});

module.exports = router;
