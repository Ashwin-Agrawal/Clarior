const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateOTP, isOTPExpired, sendOTPEmail } = require('../utils/otp.util');
const { sendSuccess, sendBadRequest, sendError } = require('../utils/response.util');

// ─── OTP expiry: 10 minutes from now ─────────────────────────
const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

// ─── SEND PHONE OTP (auth required) ──────────────────────────
exports.sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return sendBadRequest(res, 'Phone number is required');

    const normalised = String(phone).replace(/\s+/g, '').trim();
    if (!/^\+?\d{10,15}$/.test(normalised))
      return sendBadRequest(res, 'Enter a valid phone number (10-15 digits)');

    const user = await User.findById(req.user.id);
    if (!user) return sendBadRequest(res, 'User not found');

    const otp = generateOTP();
    user.phone = normalised;
    user.otpCode = otp;
    user.otpExpiry = otpExpiry();
    await user.save();

    await sendOTPEmail({ to: user.email, name: user.name, otp, purpose: 'verification' });

    return sendSuccess(res, 'OTP sent to your registered email address');
  } catch (err) {
    return sendError(res, err.message || 'Failed to send OTP');
  }
};

// ─── VERIFY PHONE OTP (auth required) ────────────────────────
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return sendBadRequest(res, 'OTP is required');

    const user = await User.findById(req.user.id);
    if (!user) return sendBadRequest(res, 'User not found');

    if (!user.otpCode || isOTPExpired(user.otpExpiry))
      return sendBadRequest(res, 'OTP has expired. Please request a new one');

    if (String(user.otpCode) !== String(otp))
      return sendBadRequest(res, 'Incorrect OTP. Please try again');

    user.isPhoneVerified = true;
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    return sendSuccess(res, 'Phone number verified successfully');
  } catch (err) {
    return sendError(res, err.message || 'Verification failed');
  }
};

// ─── FORGOT PASSWORD — SEND OTP (public) ─────────────────────
exports.sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendBadRequest(res, 'Email is required');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Don't reveal whether user exists — always send generic success
    if (user) {
      const otp = generateOTP();
      user.otpCode = otp;
      user.otpExpiry = otpExpiry();
      await user.save();
      await sendOTPEmail({ to: user.email, name: user.name, otp, purpose: 'reset' }).catch(() => {});
    }

    return sendSuccess(res, 'If an account exists with that email, an OTP has been sent');
  } catch (err) {
    return sendError(res, err.message || 'Failed to send OTP');
  }
};

// ─── RESET PASSWORD WITH OTP (public) ────────────────────────
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return sendBadRequest(res, 'Email, OTP, and new password are all required');

    if (newPassword.length < 8)
      return sendBadRequest(res, 'Password must be at least 8 characters');

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) return sendBadRequest(res, 'Invalid OTP or email');

    if (!user.otpCode || isOTPExpired(user.otpExpiry))
      return sendBadRequest(res, 'OTP has expired. Please request a new one');

    if (String(user.otpCode) !== String(otp))
      return sendBadRequest(res, 'Incorrect OTP. Please try again');

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    return sendSuccess(res, 'Password reset successful. You can now login with your new password');
  } catch (err) {
    return sendError(res, err.message || 'Password reset failed');
  }
};
