const express = require('express');
const router = express.Router();
const { authorize } = require('../../middleware/auth');
const {
  getShippingRates,
  generateLabel,
  validateAddress,
  getTrackingInfo,
  cancelShipment,
  getCarrierServices,
  getPackageTypes
} = require('../controllers/carrierController');

// Carrier controller stub
const carrierController = {
  getShippingRates: (req, res) => {
    res.status(200).json({ success: true, message: 'Get shipping rates endpoint - stub implementation', rates: [] });
  },
  generateLabel: (req, res) => {
    res.status(200).json({ success: true, message: 'Generate shipping label endpoint - stub implementation', data: {} });
  },
  validateAddress: (req, res) => {
    res.status(200).json({ success: true, message: 'Validate address endpoint - stub implementation', data: {} });
  },
  getTrackingInfo: (req, res) => {
    res.status(200).json({ success: true, message: 'Get tracking info endpoint - stub implementation', data: {} });
  },
  cancelShipment: (req, res) => {
    res.status(200).json({ success: true, message: 'Cancel shipment endpoint - stub implementation', data: {} });
  },
  getCarrierServices: (req, res) => {
    res.status(200).json({ success: true, message: 'Get carrier services endpoint - stub implementation', services: [] });
  },
  getPackageTypes: (req, res) => {
    res.status(200).json({ success: true, message: 'Get package types endpoint - stub implementation', packageTypes: [] });
  }
};

// Rates and label generation - Admin/Vendor only
router.route('/rates')
  .post(authorize('admin', 'vendor'), carrierController.getShippingRates);

router.route('/labels')
  .post(authorize('admin', 'vendor'), carrierController.generateLabel);

// Address validation
router.route('/validate-address')
  .post(authorize('admin', 'vendor'), carrierController.validateAddress);

// Tracking - available to all authenticated users
router.route('/tracking/:carrier/:trackingNumber')
  .get(carrierController.getTrackingInfo);

// Shipment cancelation - Admin/Vendor only
router.route('/shipments/:carrier/:shipmentId')
  .delete(authorize('admin', 'vendor'), carrierController.cancelShipment);

// Get carrier services - Admin/Vendor only
router.route('/services/:carrier')
  .get(authorize('admin', 'vendor'), carrierController.getCarrierServices);

// Get package types - Admin/Vendor only
router.route('/package-types/:carrier')
  .get(authorize('admin', 'vendor'), carrierController.getPackageTypes);

module.exports = router;
