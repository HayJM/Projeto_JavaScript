const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Role must be either user or admin'
    },
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150x150?text=User'
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'Brazil'
    }
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  dateOfBirth: {
    type: Date
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    },
    favoriteGenres: [{
      type: String,
      enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Romance', 'Mystery', 'Fantasy', 'Thriller', 'Self-Help', 'Business', 'Children', 'Education']
    }]
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  cart: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address.street) return '';
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Virtual for cart total
userSchema.virtual('cartTotal').get(function() {
  return this.cart.reduce((total, item) => {
    return total + (item.book.price * item.quantity);
  }, 0);
});

// Virtual for cart items count
userSchema.virtual('cartItemsCount').get(function() {
  return this.cart.reduce((total, item) => total + item.quantity, 0);
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add item to cart
userSchema.methods.addToCart = function(bookId, quantity = 1) {
  const existingItem = this.cart.find(item => item.book.toString() === bookId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({ book: bookId, quantity });
  }
  
  return this.save();
};

// Instance method to remove item from cart
userSchema.methods.removeFromCart = function(bookId) {
  this.cart = this.cart.filter(item => item.book.toString() !== bookId.toString());
  return this.save();
};

// Instance method to clear cart
userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
