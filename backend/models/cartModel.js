const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  options: {
    type: Map,
    of: String,
    default: {}
  }
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema],
  sessionId: {
    type: String
  },
  // For carts that exist without a user (anonymous users)
  guestEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  couponCode: {
    type: String
  },
  couponDiscount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-expire old carts after 30 days of inactivity
CartSchema.index({ lastActive: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

// Calculate cart totals
CartSchema.methods.calculateTotals = function() {
  // Item subtotal
  const subtotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Apply coupon discount
  const discount = this.couponDiscount || 0;

  // Tax is calculated after discount
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.07; // 7% tax

  // Shipping fee - free if subtotal is over $100
  const shipping = subtotal > 100 ? 0 : 9.99;

  // Total
  const total = taxableAmount + tax + shipping;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total
  };
};

// Update last active timestamp on save
CartSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

module.exports = mongoose.model('Cart', CartSchema);
