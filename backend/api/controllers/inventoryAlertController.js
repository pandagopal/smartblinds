/**
 * Inventory Alert Controller
 *
 * Handles API endpoints related to inventory alerts and low stock notifications
 */
const InventoryAlert = require('../../models/inventoryAlertModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const notificationService = require('../../utils/notificationService');

/**
 * @desc    Get all inventory alerts
 * @route   GET /api/inventory-alerts
 * @access  Private/Admin/Vendor
 */
exports.getInventoryAlerts = asyncHandler(async (req, res, next) => {
  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return next(new ErrorResponse('Not authorized to access inventory alerts', 403));
  }

  // Get pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};

  // Filter based on user role
  if (req.user.role === 'vendor') {
    // For vendors, only show alerts related to their products
    // This would need to be implemented based on your product-vendor relationship
    // For now, using a placeholder
    filter.product = { $in: [] }; // This would be populated with vendor's products
  }

  // Filter by alert type
  if (req.query.alertType && ['low_stock', 'out_of_stock', 'restock'].includes(req.query.alertType)) {
    filter.alertType = req.query.alertType;
  }

  // Filter by active/resolved status
  if (req.query.status === 'active') {
    filter.isActive = true;
    filter.isResolved = false;
  } else if (req.query.status === 'resolved') {
    filter.isResolved = true;
  }

  // Filter by product
  if (req.query.product) {
    filter.product = req.query.product;
  }

  // Count total for pagination
  const total = await InventoryAlert.countDocuments(filter);

  // Get alerts with populated references
  const alerts = await InventoryAlert.find(filter)
    .populate('product', 'name sku')
    .populate('material', 'name')
    .populate('color', 'name hexCode')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: alerts.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: alerts
  });
});

/**
 * @desc    Get inventory alert by ID
 * @route   GET /api/inventory-alerts/:id
 * @access  Private/Admin/Vendor
 */
exports.getInventoryAlert = asyncHandler(async (req, res, next) => {
  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return next(new ErrorResponse('Not authorized to access inventory alerts', 403));
  }

  const alert = await InventoryAlert.findById(req.params.id)
    .populate('product', 'name sku')
    .populate('material', 'name')
    .populate('color', 'name hexCode');

  if (!alert) {
    return next(new ErrorResponse(`Inventory alert not found with id of ${req.params.id}`, 404));
  }

  // Check if vendor can access this alert (if not admin)
  if (req.user.role === 'vendor') {
    // This would need to be implemented based on your product-vendor relationship
    // For now, using a placeholder check
    const vendorCanAccess = true; // Replace with actual check
    if (!vendorCanAccess) {
      return next(new ErrorResponse('Not authorized to access this inventory alert', 403));
    }
  }

  res.status(200).json({
    success: true,
    data: alert
  });
});

/**
 * @desc    Create new inventory alert
 * @route   POST /api/inventory-alerts
 * @access  Private/Admin/Vendor
 */
exports.createInventoryAlert = asyncHandler(async (req, res, next) => {
  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return next(new ErrorResponse('Not authorized to create inventory alerts', 403));
  }

  // Validate required fields
  if (!req.body.product || !req.body.alertType || req.body.currentLevel === undefined) {
    return next(new ErrorResponse('Please provide product, alertType, and currentLevel', 400));
  }

  // Create alert
  const alert = await InventoryAlert.create(req.body);

  // Populate references for notification
  await alert.populate('product material color');

  // Determine who should receive this alert
  let recipientIds = [];

  // For low stock and out of stock alerts, notify vendor and admin
  if (['low_stock', 'out_of_stock'].includes(alert.alertType)) {
    // Get admin user IDs - in a real app, you would query for admin users
    // For now, using placeholder IDs
    recipientIds.push('admin1', 'admin2');

    // Get vendor IDs related to this product
    // This would be implemented based on your product-vendor relationship
    recipientIds.push('vendor1');
  }

  // Send notification
  if (alert.alertType === 'low_stock') {
    await notificationService.createLowInventoryNotification(alert, recipientIds);
  } else if (alert.alertType === 'out_of_stock') {
    await notificationService.createOutOfStockNotification(alert, recipientIds);
  }

  // Mark alert as notification sent
  alert.notificationSent = true;
  await alert.save();

  res.status(201).json({
    success: true,
    data: alert
  });
});

/**
 * @desc    Update inventory alert
 * @route   PUT /api/inventory-alerts/:id
 * @access  Private/Admin/Vendor
 */
exports.updateInventoryAlert = asyncHandler(async (req, res, next) => {
  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return next(new ErrorResponse('Not authorized to update inventory alerts', 403));
  }

  let alert = await InventoryAlert.findById(req.params.id);

  if (!alert) {
    return next(new ErrorResponse(`Inventory alert not found with id of ${req.params.id}`, 404));
  }

  // Check if vendor can update this alert (if not admin)
  if (req.user.role === 'vendor') {
    // This would need to be implemented based on your product-vendor relationship
    // For now, using a placeholder check
    const vendorCanAccess = true; // Replace with actual check
    if (!vendorCanAccess) {
      return next(new ErrorResponse('Not authorized to update this inventory alert', 403));
    }
  }

  // Check if resolving the alert
  if (req.body.isResolved && !alert.isResolved) {
    req.body.resolvedAt = new Date();
  }

  // Update alert
  alert = await InventoryAlert.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: alert
  });
});

/**
 * @desc    Delete inventory alert
 * @route   DELETE /api/inventory-alerts/:id
 * @access  Private/Admin
 */
exports.deleteInventoryAlert = asyncHandler(async (req, res, next) => {
  // Only admin can delete
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete inventory alerts', 403));
  }

  const alert = await InventoryAlert.findById(req.params.id);

  if (!alert) {
    return next(new ErrorResponse(`Inventory alert not found with id of ${req.params.id}`, 404));
  }

  await alert.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
