const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
}

/**
 * User registration validation rules
 */
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

/**
 * User login validation rules
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Product creation validation rules
 */
const validateProduct = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product title must be between 2 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  
  body('category')
    .isIn(['ELECTRONICS', 'FASHION', 'BOOKS', 'BEAUTY', 'HOME', 'FOOD', 'SPORTS', 'OTHER'])
    .withMessage('Please provide a valid category'),
  
  body('variants')
    .isArray({ min: 1 })
    .withMessage('At least one product variant is required'),
  
  body('variants.*.sku')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters'),
  
  body('variants.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('variants.*.stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  handleValidationErrors
];

/**
 * Order creation validation rules
 */
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.productId')
    .isLength({ min: 1 })
    .withMessage('Product ID is required'),
  
  body('items.*.variantId')
    .isLength({ min: 1 })
    .withMessage('Variant ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('shippingAddressId')
    .isLength({ min: 1 })
    .withMessage('Shipping address is required'),
  
  handleValidationErrors
];

/**
 * Cart item validation rules
 */
const validateCartItem = [
  body('productId')
    .isLength({ min: 1 })
    .withMessage('Product ID is required'),
  
  body('variantId')
    .isLength({ min: 1 })
    .withMessage('Variant ID is required'),
  
  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99'),
  
  handleValidationErrors
];

/**
 * Address validation rules
 */
const validateAddress = [
  body('label')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Label cannot exceed 50 characters'),
  
  body('line1')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Address line 1 must be between 5 and 100 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('zipCode')
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Zip code must be between 3 and 10 characters'),
  
  handleValidationErrors
];

/**
 * Review validation rules
 */
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Review title cannot exceed 100 characters'),
  
  body('body')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review body cannot exceed 1000 characters'),
  
  handleValidationErrors
];

/**
 * Pagination validation rules
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

/**
 * ID parameter validation
 */
const validateId = [
  param('id')
    .isLength({ min: 1 })
    .withMessage('Valid ID is required'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateProduct,
  validateOrder,
  validateCartItem,
  validateAddress,
  validateReview,
  validatePagination,
  validateId,
};
