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
<<<<<<< HEAD
  logout
=======
  logout,
  socialLogin,
  refreshToken,
  verifyEmail,
  linkSocialAccount,
  unlinkSocialAccount
>>>>>>> auth-system
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
<<<<<<< HEAD
router.get('/logout', logRequest('logout'), logout);
=======
router.post('/logout', logRequest('logout'), logout);
router.get('/verify/:token', logRequest('verifyEmail'), verifyEmail);
router.post('/refresh', logRequest('refreshToken'), refreshToken);

// Social authentication routes
router.post('/social/:provider', logRequest('socialLogin'), socialLogin);
>>>>>>> auth-system

// Protected routes (require authentication)
router.get('/me', protect, logRequest('getMe'), getMe);
router.put('/updateprofile', protect, logRequest('updateProfile'), updateProfile);
router.put('/changepassword', protect, logRequest('changePassword'), changePassword);

<<<<<<< HEAD
=======
// Social account linking/unlinking
router.post('/link/:provider', protect, logRequest('linkSocialAccount'), linkSocialAccount);
router.delete('/link/:provider', protect, logRequest('unlinkSocialAccount'), unlinkSocialAccount);

>>>>>>> auth-system
module.exports = router;
