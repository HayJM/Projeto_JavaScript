const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      message: 'Please select a valid status'
    },
    default: 'pending'
  },
  paymentInfo: {
    method: {
      type: String,
      enum: {
        values: ['credit_card', 'debit_card', 'pix', 'boleto', 'paypal'],
        message: 'Please select a valid payment method'
      },
      required: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: 'Please select a valid payment status'
      },
      default: 'pending'
    },
    transactionId: {
      type: String
    },
    paidAt: {
      type: Date
    }
  },
  shippingAddress: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Brazil'
    },
    phone: {
      type: String,
      trim: true
    }
  },
  shippingInfo: {
    method: {
      type: String,
      enum: {
        values: ['standard', 'express', 'overnight'],
        message: 'Please select a valid shipping method'
      },
      default: 'standard'
    },
    cost: {
      type: Number,
      min: [0, 'Shipping cost cannot be negative'],
      default: 0
    },
    estimatedDelivery: {
      type: Date
    },
    trackingNumber: {
      type: String
    },
    shippedAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  discount: {
    amount: {
      type: Number,
      min: [0, 'Discount amount cannot be negative'],
      default: 0
    },
    code: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    }
  },
  tax: {
    type: Number,
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full shipping address
orderSchema.virtual('fullShippingAddress').get(function() {
  return `${this.shippingAddress.street}, ${this.shippingAddress.city}, ${this.shippingAddress.state} ${this.shippingAddress.zipCode}, ${this.shippingAddress.country}`;
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `BK${timestamp}${random}`;
  }
  
  // Add status to history if status changed
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  
  next();
});

// Static method to get order statistics
orderSchema.statics.getOrderStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Instance method to calculate final total
orderSchema.methods.calculateTotal = function() {
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.totalAmount = this.subtotal + this.shippingInfo.cost + this.tax - this.discount.amount;
  return this.totalAmount;
};

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'paymentInfo.status': 1 });

module.exports = mongoose.model('Order', orderSchema);
