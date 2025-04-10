const express = require('express');
const {
  getProducts,
  getProduct,
  getRelatedProducts,
  createProduct
} = require('../controllers/productController');

const router = express.Router();

// Routes
router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProduct);
router.route('/:id/related').get(getRelatedProducts);

module.exports = router;
