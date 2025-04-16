/**
 * Order Model
 *
 * Defines the schema for orders in the system
 */
const mongoose = require('mongoose');

// Order Item Schema
const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: String,
  variant: {
    width: Number,
    height: Number,
    color: String,
    material: String,
    options: {}
  },
  customizations: {}
});

// Shipping Address Schema
const ShippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  street1: {
    type: String,
    required: true
  },
  street2: String,
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'US',
    required: true
  },
  phone: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  instructions: String,
  isResidential: {
    type: Boolean,
    default: true
  }
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  orderItems: [OrderItemSchema],
  shippingAddress: ShippingAddressSchema,
  billingAddress: ShippingAddressSchema,
  paymentMethod: {
    type: String,
    required: true
  },
  paymentDetails: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  subtotalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  discountPrice: {
    type: Number,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Processing', 'Confirmed', 'Manufacturing', 'Ready', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  isShipped: {
    type: Boolean,
    default: false
  },
  shippedAt: {
    type: Date
  },
  trackingNumber: String,
  trackingUrl: String,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  estimatedDeliveryDate: {
    type: Date
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Order number generator - add to statics
OrderSchema.statics.generateOrderNumber = function() {
  // Generate a unique order number using timestamp and random digits
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BL${timestamp}${random}`;
};

// Create model from schema
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
