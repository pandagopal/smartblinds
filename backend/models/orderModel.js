const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
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

const ShippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: String,
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
    required: true,
    default: 'USA'
  },
  phone: {
    type: String,
    required: true
  }
});

const PaymentResultSchema = new mongoose.Schema({
  id: { type: String },
  status: { type: String },
  update_time: { type: String },
  email_address: { type: String }
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
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
    required: true,
    enum: ['PayPal', 'CreditCard', 'Stripe']
  },
  paymentResult: PaymentResultSchema,
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  discountAmount: {
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
  isShipped: {
    type: Boolean,
    default: false
  },
  shippedAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  },
  estimatedDeliveryDate: {
    type: Date
  },
  couponCode: {
    type: String
  }
}, {
  timestamps: true
});

// Generate Order Number
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Get the current date
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    // Get count of orders today to generate a sequential number
    const basePrefix = `SB-${year}${month}${day}`;

    // Count documents with the same date prefix
    const count = await this.constructor.countDocuments({
      orderNumber: { $regex: `^${basePrefix}` }
    });

    // Generate order number: SB-YYMMDD-XXXX (XXXX is sequential)
    this.orderNumber = `${basePrefix}-${(count + 1).toString().padStart(4, '0')}`;
  }

  next();
});

module.exports = mongoose.model('Order', OrderSchema);
