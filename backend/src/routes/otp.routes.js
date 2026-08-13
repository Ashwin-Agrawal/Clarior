const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  sendPhoneOTP,
  verifyPhoneOTP,
  sendForgotPasswordOTP,
  resetPasswordWithOTP,
} = require('../controllers/otp.controller');

// Auth-protected (logged-in user verifying their own phone)
router.post('/send-phone-otp',   authMiddleware, sendPhoneOTP);
router.post('/verify-phone-otp', authMiddleware, verifyPhoneOTP);

// Public (forgot password flow)
router.post('/forgot-password', sendForgotPasswordOTP);
router.post('/reset-password',  resetPasswordWithOTP);

module.exports = router;
