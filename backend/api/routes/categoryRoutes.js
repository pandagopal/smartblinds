const express = require('express');
const {
  getCategories,
  getCategory,
  getCategoryProducts,
  createCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Routes
router.route('/').get(getCategories).post(createCategory);
router.route('/:id').get(getCategory);
router.route('/:id/products').get(getCategoryProducts);

module.exports = router;
