/**
 * Order Controller
 *
 * Handles API endpoints for order management
 */
const Order = require('../../models/orderModel');
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const notificationService = require('../../utils/notificationService');

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
exports.getOrders = asyncHandler(async (req, res, next) => {
  // Check if admin
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access all orders', 403));
  }

  // Get pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by user
  if (req.query.user) {
    filter.user = req.query.user;
  }

  // Search by order number
  if (req.query.orderNumber) {
    filter.orderNumber = { $regex: req.query.orderNumber, $options: 'i' };
  }

  // Date range filters
  if (req.query.startDate) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$gte = new Date(req.query.startDate);
  }

  if (req.query.endDate) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = new Date(req.query.endDate);
  }

  // Count total for pagination
  const total = await Order.countDocuments(filter);

  // Get orders with populated user
  const orders = await Order.find(filter)
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: orders
  });
});

/**
 * @desc    Get user's orders
 * @route   GET /api/orders/me
 * @access  Private
 */
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the order or is admin
  if (order.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to access this order`, 403));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  // Validate order items
  if (!req.body.orderItems || req.body.orderItems.length === 0) {
    return next(new ErrorResponse('Please add at least one item to the order', 400));
  }

  // Create the order
  const order = await Order.create(req.body);

  // Send notifications
  await notificationService.createNewOrderNotification(order);
  await notificationService.createOrderConfirmationNotification(order);

  res.status(201).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  // Check if admin
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update order status', 403));
  }

  // Validate status
  if (!req.body.status) {
    return next(new ErrorResponse('Please provide a status', 400));
  }

  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Capture previous status for notification
  const previousStatus = order.status;

  // Update status and related fields
  const updateData = {
    status: req.body.status
  };

  // Set status-specific fields
  if (req.body.status === 'Shipped') {
    updateData.isShipped = true;
    updateData.shippedAt = Date.now();

    // Add tracking info if provided
    if (req.body.trackingNumber) {
      updateData.trackingNumber = req.body.trackingNumber;
    }
    if (req.body.trackingUrl) {
      updateData.trackingUrl = req.body.trackingUrl;
    }
  }

  if (req.body.status === 'Delivered') {
    updateData.isDelivered = true;
    updateData.deliveredAt = Date.now();
  }

  // Update the order
  order = await Order.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  // Send appropriate notifications based on status change
  if (previousStatus !== order.status) {
    // General status change notification
    await notificationService.createOrderStatusUpdateNotification(
      order,
      previousStatus,
      req.body.additionalInfo || ''
    );

    // Special notifications for shipped and delivered
    if (order.status === 'Shipped') {
      await notificationService.createOrderShippedNotification(order);
    } else if (order.status === 'Delivered') {
      await notificationService.createOrderDeliveredNotification(order);
    }
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Update order details
 * @route   PUT /api/orders/:id
 * @access  Private/Admin
 */
exports.updateOrder = asyncHandler(async (req, res, next) => {
  // Check if admin
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update order details', 403));
  }

  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Don't allow changing user, orderNumber, or createdAt
  delete req.body.user;
  delete req.body.orderNumber;
  delete req.body.createdAt;

  // Update the order
  order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if user owns the order or is admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to cancel this order`, 403));
  }

  // Check if order can be cancelled (not shipped or delivered)
  if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
    return next(new ErrorResponse(`Cannot cancel order with status '${order.status}'`, 400));
  }

  // Capture previous status for notification
  const previousStatus = order.status;

  // Update order status
  order = await Order.findByIdAndUpdate(req.params.id, {
    status: 'Cancelled',
    notes: req.body.reason ? `Cancelled: ${req.body.reason}` : 'Cancelled by user'
  }, {
    new: true,
    runValidators: true
  });

  // Send notification about cancellation
  await notificationService.createOrderStatusUpdateNotification(
    order,
    previousStatus,
    `Order has been cancelled. ${req.body.reason ? `Reason: ${req.body.reason}` : ''}`
  );

  res.status(200).json({
    success: true,
    data: order
  });
});
