const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Book = require('../models/Book');
const { protect, admin, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentInfo, shippingMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Order must contain at least one item'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Shipping address is required'
      });
    }

    if (!paymentInfo || !paymentInfo.method) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment information is required'
      });
    }

    // Validate and process items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const book = await Book.findById(item.book);
      
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: `Book with ID ${item.book} not found`
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for ${book.title}. Available: ${book.stock}, Requested: ${item.quantity}`
        });
      }

      const orderItem = {
        book: book._id,
        quantity: item.quantity,
        price: book.price,
        title: book.title,
        author: book.author
      };

      orderItems.push(orderItem);
      subtotal += book.price * item.quantity;

      // Update book stock
      book.stock -= item.quantity;
      await book.save();
    }

    // Calculate shipping cost
    const shippingCost = calculateShippingCost(shippingMethod, subtotal);
    
    // Calculate tax (example: 10% tax)
    const tax = subtotal * 0.1;
    
    // Calculate total
    const totalAmount = subtotal + shippingCost + tax;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      totalAmount,
      tax,
      paymentInfo,
      shippingAddress,
      shippingInfo: {
        method: shippingMethod || 'standard',
        cost: shippingCost,
        estimatedDelivery: calculateEstimatedDelivery(shippingMethod)
      },
      notes
    });

    // Clear user's cart
    const user = await User.findById(req.user._id);
    await user.clearCart();

    // Populate order for response
    await order.populate('user', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating order'
    });
  }
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter for user's orders
    const filter = { user: req.user._id };
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('items.book', 'title author coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching orders'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, checkOwnership(Order), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.book', 'title author coverImage isbn');

    res.json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching order'
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, checkOwnership(Order), async (req, res) => {
  try {
    const order = req.resource;

    if (order.status === 'delivered') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel delivered order'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Order is already cancelled'
      });
    }

    if (order.status === 'shipped') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel shipped order. Please contact support for returns.'
      });
    }

    // Restore book stock
    for (const item of order.items) {
      const book = await Book.findById(item.book);
      if (book) {
        book.stock += item.quantity;
        await book.save();
      }
    }

    order.status = 'cancelled';
    order.paymentInfo.status = 'refunded';
    await order.save();

    res.json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error cancelling order'
    });
  }
});

// Admin routes

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.paymentStatus) {
      filter['paymentInfo.status'] = req.query.paymentStatus;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.book', 'title author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching orders'
    });
  }
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, trackingNumber, note } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;
    
    // Update tracking number if provided
    if (trackingNumber) {
      order.shippingInfo.trackingNumber = trackingNumber;
    }
    
    // Set shipped date if status is shipped
    if (status === 'shipped' && !order.shippingInfo.shippedAt) {
      order.shippingInfo.shippedAt = new Date();
    }
    
    // Set delivered date if status is delivered
    if (status === 'delivered' && !order.shippingInfo.deliveredAt) {
      order.shippingInfo.deliveredAt = new Date();
      order.paymentInfo.status = 'completed';
      order.paymentInfo.paidAt = new Date();
    }
    
    // Handle cancellation
    if (status === 'cancelled') {
      // Restore book stock
      for (const item of order.items) {
        const book = await Book.findById(item.book);
        if (book) {
          book.stock += item.quantity;
          await book.save();
        }
      }
      order.paymentInfo.status = 'refunded';
    }

    await order.save();

    res.json({
      status: 'success',
      message: 'Order status updated successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating order status'
    });
  }
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue statistics
    const revenueStats = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Top selling books
    const topBooks = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.book',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          title: { $first: '$items.title' },
          author: { $first: '$items.author' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Order status distribution
    const statusStats = await Order.getOrderStats();

    res.json({
      status: 'success',
      data: {
        overview: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders
        },
        revenue: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0 },
        monthlyRevenue,
        topBooks,
        statusStats
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching order statistics'
    });
  }
});

// Helper functions
function calculateShippingCost(method, subtotal) {
  const shippingRates = {
    standard: 10,
    express: 25,
    overnight: 50
  };
  
  // Free shipping for orders over $100
  if (subtotal >= 100) {
    return 0;
  }
  
  return shippingRates[method] || shippingRates.standard;
}

function calculateEstimatedDelivery(method) {
  const now = new Date();
  const days = {
    standard: 7,
    express: 3,
    overnight: 1
  };
  
  const deliveryDays = days[method] || days.standard;
  const estimatedDate = new Date(now.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
  
  return estimatedDate;
}

module.exports = router;
