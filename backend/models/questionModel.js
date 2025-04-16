const mongoose = require('mongoose');

const QuestionReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVendor: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const CustomerQuestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'closed'],
    default: 'open'
  },
  replies: [QuestionReplySchema],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for performance
CustomerQuestionSchema.index({ user: 1 });
CustomerQuestionSchema.index({ order: 1 });
CustomerQuestionSchema.index({ product: 1 });
CustomerQuestionSchema.index({ status: 1 });
CustomerQuestionSchema.index({ assignedTo: 1 });

const CustomerQuestion = mongoose.model('CustomerQuestion', CustomerQuestionSchema);

module.exports = CustomerQuestion;
