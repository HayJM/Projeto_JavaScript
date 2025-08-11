const express = require('express');
const User = require('../models/User');
const { protect, admin, generateToken, sensitiveOperationLimit } = require('../middleware/auth');

const router = express.Router();

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'user' : role // Prevent admin creation through registration
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating user',
      error: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', sensitiveOperationLimit(), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login',
      error: error.message
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist cart.book');
    
    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address, preferences, dateOfBirth } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, sensitiveOperationLimit(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current password and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error changing password'
    });
  }
});

// @desc    Add item to wishlist
// @route   POST /api/auth/wishlist/:bookId
// @access  Private
router.post('/wishlist/:bookId', protect, async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    // Check if book is already in wishlist
    if (user.wishlist.includes(bookId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Book is already in wishlist'
      });
    }

    user.wishlist.push(bookId);
    await user.save();

    await user.populate('wishlist');

    res.json({
      status: 'success',
      message: 'Book added to wishlist',
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding to wishlist'
    });
  }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/auth/wishlist/:bookId
// @access  Private
router.delete('/wishlist/:bookId', protect, async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
    await user.save();

    await user.populate('wishlist');

    res.json({
      status: 'success',
      message: 'Book removed from wishlist',
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error removing from wishlist'
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/auth/cart
// @access  Private
router.post('/cart', protect, async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    
    const user = await User.findById(req.user._id);
    await user.addToCart(bookId, quantity);
    await user.populate('cart.book');

    res.json({
      status: 'success',
      message: 'Item added to cart',
      data: {
        cart: user.cart,
        cartTotal: user.cartTotal,
        cartItemsCount: user.cartItemsCount
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding to cart'
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/auth/cart/:bookId
// @access  Private
router.delete('/cart/:bookId', protect, async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const user = await User.findById(req.user._id);
    await user.removeFromCart(bookId);
    await user.populate('cart.book');

    res.json({
      status: 'success',
      message: 'Item removed from cart',
      data: {
        cart: user.cart,
        cartTotal: user.cartTotal,
        cartItemsCount: user.cartItemsCount
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error removing from cart'
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/auth/cart
// @access  Private
router.delete('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user.clearCart();

    res.json({
      status: 'success',
      message: 'Cart cleared successfully',
      data: {
        cart: user.cart
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error clearing cart'
    });
  }
});

// Admin routes

// @desc    Get all users
// @route   GET /api/auth/admin/users
// @access  Private/Admin
router.get('/admin/users', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users'
    });
  }
});

// @desc    Update user role
// @route   PUT /api/auth/admin/users/:id/role
// @access  Private/Admin
router.put('/admin/users/:id/role', protect, admin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User role updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating user role'
    });
  }
});

module.exports = router;
