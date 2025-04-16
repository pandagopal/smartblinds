const express = require('express');
const router = express.Router();
const { authorize } = require('../../middleware/auth');
const {
  getQuestions,
  getUserQuestions,
  getQuestion,
  createQuestion,
  addReply,
  updateQuestionStatus,
  assignQuestion
} = require('../controllers/questionController');

// User's questions
router.get('/me', getUserQuestions);

// Admin/vendor routes
router.route('/')
  .get(authorize('admin', 'vendor'), getQuestions)
  .post(createQuestion);

// Routes for specific questions
router.route('/:id')
  .get(getQuestion);

router.route('/:id/replies')
  .post(addReply);

router.route('/:id/status')
  .put(authorize('admin', 'vendor'), updateQuestionStatus);

router.route('/:id/assign')
  .put(authorize('admin'), assignQuestion);

// Question controller stub
const questionController = {
  getQuestions: (req, res) => {
    res.status(200).json({ success: true, message: 'Get questions endpoint - stub implementation', data: [] });
  },
  getQuestion: (req, res) => {
    res.status(200).json({ success: true, message: 'Get question endpoint - stub implementation', data: {} });
  },
  createQuestion: (req, res) => {
    res.status(201).json({ success: true, message: 'Create question endpoint - stub implementation', data: {} });
  },
  answerQuestion: (req, res) => {
    res.status(200).json({ success: true, message: 'Answer question endpoint - stub implementation', data: {} });
  },
  getProductQuestions: (req, res) => {
    res.status(200).json({ success: true, message: 'Get product questions endpoint - stub implementation', data: [] });
  }
};

// Question routes
router.route('/')
  .get(questionController.getQuestions)
  .post(questionController.createQuestion);

router.route('/:id')
  .get(questionController.getQuestion);

router.route('/:id/answer')
  .post(questionController.answerQuestion);

router.route('/product/:productId')
  .get(questionController.getProductQuestions);

module.exports = router;
