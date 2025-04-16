const express = require('express');
const {
  getAllVendors,
  getVendorDetails,
  updateVendorStatus,
  updateVendorListingStatus,
  updateVendorVerification,
  impersonateVendor,
  getAdminDashboard
} = require('../controllers/adminController');
const { authorize } = require('../../middleware/auth');

const router = express.Router();

// Admin controller stub
const adminController = {
  getDashboardStats: (req, res) => {
    res.status(200).json({ success: true, message: 'Get dashboard stats endpoint - stub implementation', data: {} });
  },
  getAllUsers: (req, res) => {
    res.status(200).json({ success: true, message: 'Get all users endpoint - stub implementation', data: [] });
  },
  getUser: (req, res) => {
    res.status(200).json({ success: true, message: 'Get user endpoint - stub implementation', data: {} });
  },
  updateUser: (req, res) => {
    res.status(200).json({ success: true, message: 'Update user endpoint - stub implementation', data: {} });
  },
  deleteUser: (req, res) => {
    res.status(200).json({ success: true, message: 'Delete user endpoint - stub implementation' });
  },
  getVendors: (req, res) => {
    res.status(200).json({ success: true, message: 'Get vendors endpoint - stub implementation', data: [] });
  },
  approveVendor: (req, res) => {
    res.status(200).json({ success: true, message: 'Approve vendor endpoint - stub implementation', data: {} });
  }
};

// All routes require admin role
router.use(authorize('admin'));

// Dashboard route
router.get('/dashboard', adminController.getDashboardStats);

// Vendor management routes
router.get('/vendors', getAllVendors);
router.get('/vendors/:id', getVendorDetails);
router.put('/vendors/:id/status', updateVendorStatus);
router.put('/vendors/:id/listing-status', updateVendorListingStatus);
router.put('/vendors/:id/verify', updateVendorVerification);
router.post('/vendors/:id/impersonate', impersonateVendor);

// User management routes
router.route('/users')
  .get(adminController.getAllUsers);

router.route('/users/:id')
  .get(adminController.getUser)
  .put(adminController.updateUser)
  .delete(adminController.deleteUser);

router.route('/vendors')
  .get(adminController.getVendors);

router.route('/vendors/:id/approve')
  .put(adminController.approveVendor);

module.exports = router;
