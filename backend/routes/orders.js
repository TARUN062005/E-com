const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateOrder, validatePagination, validateId } = require('../middleware/validation');

router.use(authenticate);

// Get user orders
router.get('/', validatePagination, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              product: { select: { title: true } },
              variant: true
            }
          },
          shippingAddress: true,
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.order.count({ where: { userId } })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get orders' });
  }
});

// Create order from cart
router.post('/', validateOrder, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddressId, paymentMethod } = req.body;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: true,
        product: true
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Calculate total
    const totalPrice = cartItems.reduce((total, item) => 
      total + (item.variant.price * item.quantity), 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddressId,
        totalPrice,
        orderItems: {
          create: cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant.price
          }))
        },
        payment: {
          create: {
            userId,
            method: paymentMethod,
            amount: totalPrice,
            status: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS'
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true
          }
        },
        payment: true
      }
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Get single order
router.get('/:id', validateId, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: {
          include: {
            product: { include: { images: { take: 1 } } },
            variant: true
          }
        },
        shippingAddress: true,
        payment: true
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get order' });
  }
});

module.exports = router;