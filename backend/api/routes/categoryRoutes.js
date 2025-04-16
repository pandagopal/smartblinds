const express = require('express');
const router = express.Router();

// Category controller stub
const categoryController = {
  getCategories: (req, res) => {
    res.status(200).json({ success: true, message: 'Get categories endpoint - stub implementation', data: [] });
  },
  getCategory: (req, res) => {
    res.status(200).json({ success: true, message: 'Get category endpoint - stub implementation', data: {} });
  },
  createCategory: (req, res) => {
    res.status(201).json({ success: true, message: 'Create category endpoint - stub implementation', data: {} });
  },
  updateCategory: (req, res) => {
    res.status(200).json({ success: true, message: 'Update category endpoint - stub implementation', data: {} });
  },
  deleteCategory: (req, res) => {
    res.status(200).json({ success: true, message: 'Delete category endpoint - stub implementation', data: {} });
  }
};

// Category routes
router.route('/')
  .get(categoryController.getCategories)
  .post(categoryController.createCategory);

router.route('/:id')
  .get(categoryController.getCategory)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
