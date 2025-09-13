const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Controllers
const {
  register,
  login,
  verifyEmail,
  verifyPhone,
  resendVerificationOTP,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile
} = require('../controllers/authController');

// Middleware
const { authenticate } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with OTP
 * @access  Private
 */
router.post('/verify-email', [
  authenticate,
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 4, max: 8 }).withMessage('Valid OTP is required'),
  handleValidationErrors
], verifyEmail);

/**
 * @route   POST /api/auth/verify-phone
 * @desc    Verify phone with OTP
 * @access  Private
 */
router.post('/verify-phone', [
  authenticate,
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('otp').isLength({ min: 4, max: 8 }).withMessage('Valid OTP is required'),
  handleValidationErrors
], verifyPhone);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend verification OTP
 * @access  Private
 */
router.post('/resend-otp', [
  authenticate,
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  handleValidationErrors
], resendVerificationOTP);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  handleValidationErrors
], requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post('/reset-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 4, max: 8 }).withMessage('Valid OTP is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  handleValidationErrors
], resetPassword);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', [
  authenticate,
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  handleValidationErrors
], updateProfile);

module.exports = router;