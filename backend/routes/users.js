const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');

// Controllers
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/userController');

// Middleware
const { authenticate } = require('../middleware/auth');
const { validateAddress, validatePagination, validateId, handleValidationErrors } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Address routes
/**
 * @route   GET /api/users/addresses
 * @desc    Get user addresses
 * @access  Private
 */
router.get('/addresses', getAddresses);

/**
 * @route   POST /api/users/addresses
 * @desc    Create new address
 * @access  Private
 */
router.post('/addresses', validateAddress, createAddress);

/**
 * @route   PUT /api/users/addresses/:id
 * @desc    Update address
 * @access  Private
 */
router.put('/addresses/:id', [validateId, validateAddress], updateAddress);

/**
 * @route   DELETE /api/users/addresses/:id
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:id', validateId, deleteAddress);

/**
 * @route   PATCH /api/users/addresses/:id/default
 * @desc    Set default address
 * @access  Private
 */
router.patch('/addresses/:id/default', validateId, setDefaultAddress);

// Notification routes
/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', validatePagination, getNotifications);

/**
 * @route   PATCH /api/users/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/notifications/:id/read', validateId, markNotificationRead);

/**
 * @route   PATCH /api/users/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/notifications/read-all', markAllNotificationsRead);

// Wishlist routes
/**
 * @route   GET /api/users/wishlist
 * @desc    Get user wishlist
 * @access  Private
 */
router.get('/wishlist', getWishlist);

/**
 * @route   POST /api/users/wishlist
 * @desc    Add item to wishlist
 * @access  Private
 */
router.post('/wishlist', [
  body('productId').isLength({ min: 1 }).withMessage('Product ID is required'),
  body('variantId').optional().isLength({ min: 1 }).withMessage('Variant ID must be valid'),
  handleValidationErrors
], addToWishlist);

/**
 * @route   DELETE /api/users/wishlist/:id
 * @desc    Remove item from wishlist
 * @access  Private
 */
router.delete('/wishlist/:id', validateId, removeFromWishlist);

module.exports = router;