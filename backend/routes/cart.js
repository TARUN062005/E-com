const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateCartItem, validateId, handleValidationErrors } = require('../middleware/validation');

router.use(authenticate);

// Get cart
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } }
          }
        },
        variant: {
          include: {
            inventory: true,
            images: true
          }
        }
      }
    });

    const totalPrice = cartItems.reduce((total, item) => 
      total + (item.variant.price * item.quantity), 0);

    res.json({
      success: true,
      data: {
        items: cartItems,
        totalPrice,
        itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get cart' });
  }
});

// Add to cart
router.post('/', validateCartItem, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variantId, quantity } = req.body;

    // Check if item already exists
    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, variantId }
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: {
          product: { include: { images: { take: 1 } } },
          variant: { include: { inventory: true } }
        }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { userId, productId, variantId, quantity },
        include: {
          product: { include: { images: { take: 1 } } },
          variant: { include: { inventory: true } }
        }
      });
    }

    res.status(201).json({ success: true, data: { item: cartItem } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
});

// Update cart item
router.put('/:id', [validateId, validateCartItem], async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.updateMany({
      where: { id: itemId, userId },
      data: { quantity }
    });

    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

// Remove from cart
router.delete('/:id', validateId, async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    await prisma.cartItem.deleteMany({
      where: { id: itemId, userId }
    });

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
});

module.exports = router;