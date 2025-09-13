const { verifyToken, extractToken } = require('../utils/jwt');
const { prisma } = require('../config/database');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        emails: true,
        phones: true,
        sellerProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is deleted
    if (user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: 'User account has been deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid token'
    });
  }
}

/**
 * Authorization middleware for specific roles
 * @param {...string} allowedRoles - Allowed user roles
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          emails: true,
          phones: true,
          sellerProfile: true
        }
      });
      
      if (user && !user.deletedAt) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
}

/**
 * Middleware to check if user is verified
 */
function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required'
    });
  }

  next();
}

/**
 * Middleware to check if user owns the resource
 * @param {string} paramName - Parameter name for resource ID
 * @param {string} userField - User field to compare (default: 'id')
 */
function requireOwnership(paramName = 'id', userField = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const resourceId = req.params[paramName];
    const userId = req.user[userField];

    if (resourceId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requireVerified,
  requireOwnership,
};