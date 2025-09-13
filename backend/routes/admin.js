const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Admin only routes
router.use(authenticate, authorize('ADMIN'));

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalPrice: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.totalPrice || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
          emails: { select: { email: true, verified: true } }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
});

module.exports = router;