const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  chat,
  getRecommendations,
  getOrderAssistance,
} = require('../controllers/chatbotController');

const { authenticate, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

/**
 * @route   POST /api/chatbot/chat
 * @desc    Chat with AI assistant
 * @access  Public/Private (enhanced with user context if authenticated)
 */
router.post('/chat', [
  optionalAuth,
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('context').optional().isIn(['general', 'product_recommendation', 'order_support', 'customer_service']).withMessage('Invalid context'),
  handleValidationErrors
], chat);

/**
 * @route   GET /api/chatbot/recommendations
 * @desc    Get AI-powered product recommendations
 * @access  Public/Private (personalized if authenticated)
 */
router.get('/recommendations', optionalAuth, getRecommendations);

/**
 * @route   GET /api/chatbot/order-assistance
 * @desc    Get order assistance information
 * @access  Private
 */
router.get('/order-assistance', authenticate, getOrderAssistance);

module.exports = router;