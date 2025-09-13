const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  searchProducts,
  getProductReviews,
  createReview,
} = require('../controllers/productController');

const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validateProduct, validateReview, validatePagination, validateId } = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, validatePagination, getProducts);
router.get('/categories', getCategories);
router.get('/search', searchProducts);
router.get('/:id', optionalAuth, validateId, getProduct);
router.get('/:id/reviews', validateId, validatePagination, getProductReviews);

// Protected routes
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), validateProduct, createProduct);
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), validateId, updateProduct);
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), validateId, deleteProduct);
router.post('/:id/reviews', authenticate, validateId, validateReview, createReview);

module.exports = router;