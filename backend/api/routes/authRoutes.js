const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController'); // Use controller from the api directory

// Debug logging middleware
const logRequest = (routeName) => (req, res, next) => {
  console.log(`[AuthRoutes] ${routeName} route called`);
  console.log(`[AuthRoutes] Request body:`, JSON.stringify(req.body, null, 2));

  // Intercept the response to log it
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[AuthRoutes] ${routeName} response:`, typeof data === 'string' ? data.substring(0, 200) + '...' : 'Non-string response');
    originalSend.call(this, data);
  };

  next();
};

// Public routes
router.post('/register', logRequest('register'), register);
router.post('/login', logRequest('login'), login);
router.post('/forgotpassword', logRequest('forgotPassword'), forgotPassword);
router.put('/resetpassword/:resettoken', logRequest('resetPassword'), resetPassword);
router.get('/logout', logRequest('logout'), logout);

// Protected routes (require authentication)
router.get('/me', protect, logRequest('getMe'), getMe);
router.put('/updateprofile', protect, logRequest('updateProfile'), updateProfile);
router.put('/changepassword', protect, logRequest('changePassword'), changePassword);

module.exports = router;
