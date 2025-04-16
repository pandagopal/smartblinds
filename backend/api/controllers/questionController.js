/**
 * Question Controller
 *
 * Handles API endpoints related to customer questions and support
 */
const CustomerQuestion = require('../../models/questionModel');
const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const notificationService = require('../../utils/notificationService');

/**
 * @desc    Get all questions (Admin/Vendor)
 * @route   GET /api/questions
 * @access  Private/Admin/Vendor
 */
exports.getQuestions = asyncHandler(async (req, res, next) => {
  // Get pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};

  // Filter based on user role
  if (req.user.role === 'vendor') {
    // For vendors, only show questions related to their products
    // This would need to be implemented based on your product-vendor relationship
    // For now, using a placeholder
    filter.$or = [
      { 'product': { $in: [] } }, // This would be populated with vendor's products
      { 'assignedTo': req.user.id }
    ];
  }

  // Status filter
  if (req.query.status && ['open', 'pending', 'closed'].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  // Search by text
  if (req.query.search) {
    filter.$or = filter.$or || [];
    filter.$or.push(
      { subject: { $regex: req.query.search, $options: 'i' } },
      { message: { $regex: req.query.search, $options: 'i' } }
    );
  }

  // Filter by product or order
  if (req.query.product) {
    filter.product = req.query.product;
  }

  if (req.query.order) {
    filter.order = req.query.order;
  }

  // Count total for pagination
  const total = await CustomerQuestion.countDocuments(filter);

  // Get questions with populated references
  const questions = await CustomerQuestion.find(filter)
    .populate('user', 'firstName lastName email')
    .populate('product', 'name')
    .populate('order', 'orderNumber')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: questions.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: questions
  });
});

/**
 * @desc    Get user's questions
 * @route   GET /api/questions/me
 * @access  Private
 */
exports.getUserQuestions = asyncHandler(async (req, res, next) => {
  const questions = await CustomerQuestion.find({ user: req.user.id })
    .populate('product', 'name')
    .populate('order', 'orderNumber')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions
  });
});

/**
 * @desc    Get single question
 * @route   GET /api/questions/:id
 * @access  Private
 */
exports.getQuestion = asyncHandler(async (req, res, next) => {
  const question = await CustomerQuestion.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('product', 'name')
    .populate('order', 'orderNumber')
    .populate('assignedTo', 'firstName lastName email')
    .populate({
      path: 'replies.user',
      select: 'firstName lastName email'
    });

  if (!question) {
    return next(new ErrorResponse(`Question not found with id of ${req.params.id}`, 404));
  }

  // Check if user can access this question
  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'vendor' &&
    question.user.toString() !== req.user.id
  ) {
    return next(new ErrorResponse(`Not authorized to access this question`, 403));
  }

  res.status(200).json({
    success: true,
    data: question
  });
});

/**
 * @desc    Create new question
 * @route   POST /api/questions
 * @access  Private
 */
exports.createQuestion = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  // Validate product and order IDs if provided
  if (req.body.product) {
    const product = await Product.findById(req.body.product);
    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.body.product}`, 404));
    }
  }

  if (req.body.order) {
    const order = await Order.findById(req.body.order);
    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.body.order}`, 404));
    }

    // Verify the order belongs to the user
    if (order.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to reference this order`, 403));
    }
  }

  const question = await CustomerQuestion.create(req.body);

  // Send notification to admins/vendors about new question
  await notifyAboutNewQuestion(question);

  res.status(201).json({
    success: true,
    data: question
  });
});

/**
 * @desc    Add reply to question
 * @route   POST /api/questions/:id/replies
 * @access  Private
 */
exports.addReply = asyncHandler(async (req, res, next) => {
  const question = await CustomerQuestion.findById(req.params.id);

  if (!question) {
    return next(new ErrorResponse(`Question not found with id of ${req.params.id}`, 404));
  }

  // Check if user can reply to this question
  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'vendor' &&
    question.user.toString() !== req.user.id
  ) {
    return next(new ErrorResponse(`Not authorized to reply to this question`, 403));
  }

  // Prepare reply object
  const reply = {
    user: req.user.id,
    message: req.body.message,
    isVendor: req.user.role === 'vendor',
    isAdmin: req.user.role === 'admin'
  };

  // Add reply to question
  question.replies.push(reply);

  // Update status based on who replied
  if (req.user.role === 'admin' || req.user.role === 'vendor') {
    if (question.status === 'open') {
      question.status = 'pending';
    }
  } else {
    // If customer replied to pending question, set back to open
    if (question.status === 'pending') {
      question.status = 'open';
    }
  }

  await question.save();

  // Send notification about reply
  await notifyAboutReply(question, reply);

  res.status(200).json({
    success: true,
    data: question
  });
});

/**
 * @desc    Update question status
 * @route   PUT /api/questions/:id/status
 * @access  Private/Admin/Vendor
 */
exports.updateQuestionStatus = asyncHandler(async (req, res, next) => {
  // Check user role
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return next(new ErrorResponse(`User not authorized to update question status`, 403));
  }

  // Validate status
  if (!req.body.status || !['open', 'pending', 'closed'].includes(req.body.status)) {
    return next(new ErrorResponse(`Please provide a valid status (open, pending, closed)`, 400));
  }

  const question = await CustomerQuestion.findById(req.params.id);

  if (!question) {
    return next(new ErrorResponse(`Question not found with id of ${req.params.id}`, 404));
  }

  // Update status
  question.status = req.body.status;

  // If closing the question, add a system reply if message provided
  if (req.body.status === 'closed' && req.body.message) {
    question.replies.push({
      user: req.user.id,
      message: req.body.message,
      isVendor: req.user.role === 'vendor',
      isAdmin: req.user.role === 'admin'
    });
  }

  await question.save();

  res.status(200).json({
    success: true,
    data: question
  });
});

/**
 * @desc    Assign question to user
 * @route   PUT /api/questions/:id/assign
 * @access  Private/Admin
 */
exports.assignQuestion = asyncHandler(async (req, res, next) => {
  // Only admins can assign questions
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User not authorized to assign questions`, 403));
  }

  // Validate assignee
  if (!req.body.assigneeId) {
    return next(new ErrorResponse(`Please provide an assignee ID`, 400));
  }

  const assignee = await User.findById(req.body.assigneeId);
  if (!assignee) {
    return next(new ErrorResponse(`User not found with id of ${req.body.assigneeId}`, 404));
  }

  const question = await CustomerQuestion.findById(req.params.id);

  if (!question) {
    return next(new ErrorResponse(`Question not found with id of ${req.params.id}`, 404));
  }

  // Update assignee
  question.assignedTo = req.body.assigneeId;
  await question.save();

  res.status(200).json({
    success: true,
    data: question
  });
});

/**
 * Helper function to send notifications about new questions
 */
const notifyAboutNewQuestion = async (question) => {
  try {
    // Determine topic based on what the question is about
    let topic = 'general inquiry';
    let adminIds = [];

    // Get admin user IDs - in a real app, you would query for admin users
    // For now, using placeholder IDs
    adminIds = ['admin1', 'admin2'];

    if (question.product) {
      const product = await Product.findById(question.product);
      if (product) {
        topic = `product "${product.name}"`;

        // Add vendor IDs related to this product
        // This would be implemented based on your product-vendor relationship
        // For now, using placeholder
        adminIds.push('vendor1');
      }
    } else if (question.order) {
      const order = await Order.findById(question.order);
      if (order) {
        topic = `order #${order.orderNumber}`;

        // Add vendor IDs related to this order
        // This would be implemented based on your order-vendor relationship
        // For now, using placeholder
        adminIds.push('vendor1');
      }
    }

    // Prepare template data
    const templateData = {
      topic,
      subject: question.subject,
      message: question.message
    };

    // Create notification
    await notificationService.createNotification(
      'new_question',
      templateData,
      { type: 'question', id: question._id.toString() },
      adminIds
    );
  } catch (error) {
    console.error('Error sending new question notification:', error);
  }
};

/**
 * Helper function to send notifications about replies
 */
const notifyAboutReply = async (question, reply) => {
  try {
    // Determine whom to notify
    let recipientIds = [];

    // If customer replied, notify admins/vendors
    if (!reply.isAdmin && !reply.isVendor) {
      // Get admin user IDs - in a real app, you would query for admin users
      recipientIds = ['admin1', 'admin2'];

      // If the question is assigned, notify the assignee
      if (question.assignedTo) {
        recipientIds.push(question.assignedTo.toString());
      }

      // If question is about a product, notify vendor
      if (question.product) {
        // Add vendor IDs related to this product (placeholder)
        recipientIds.push('vendor1');
      }
    }
    // If admin/vendor replied, notify the customer
    else if (question.user) {
      recipientIds.push(question.user.toString());
    }

    // Filter out duplicate IDs and the replier's own ID
    recipientIds = [...new Set(recipientIds)].filter(id => id !== reply.user.toString());

    if (recipientIds.length === 0) return;

    // Determine topic based on what the question is about
    let topic = 'your inquiry';
    if (question.product) {
      const product = await Product.findById(question.product);
      if (product) {
        topic = `product "${product.name}"`;
      }
    } else if (question.order) {
      const order = await Order.findById(question.order);
      if (order) {
        topic = `order #${order.orderNumber}`;
      }
    }

    // Prepare template data
    const templateData = {
      topic,
      subject: question.subject,
      replyMessage: reply.message
    };

    // Create notification
    await notificationService.createNotification(
      'question_reply',
      templateData,
      { type: 'question', id: question._id.toString() },
      recipientIds
    );
  } catch (error) {
    console.error('Error sending reply notification:', error);
  }
};
