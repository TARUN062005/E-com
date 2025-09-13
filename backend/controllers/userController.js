const { prisma } = require('../config/database');

/**
 * Get user addresses
 */
async function getAddresses(req, res) {
  try {
    const userId = req.user.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: { addresses }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get addresses',
      error: error.message
    });
  }
}

/**
 * Create new address
 */
async function createAddress(req, res) {
  try {
    const userId = req.user.id;
    const { label, line1, line2, city, state, country, zipCode, isDefault } = req.body;

    // If this is set as default, update other addresses to not be default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label,
        line1,
        line2,
        city,
        state,
        country,
        zipCode,
        isDefault: isDefault || false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: { address }
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create address',
      error: error.message
    });
  }
}

/**
 * Update address
 */
async function updateAddress(req, res) {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const { label, line1, line2, city, state, country, zipCode, isDefault } = req.body;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If this is set as default, update other addresses to not be default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        label,
        line1,
        line2,
        city,
        state,
        country,
        zipCode,
        isDefault: isDefault || false
      }
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address: updatedAddress }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
}

/**
 * Delete address
 */
async function deleteAddress(req, res) {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
}

/**
 * Set default address
 */
async function setDefaultAddress(req, res) {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Update all addresses to not be default
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    // Set the specified address as default
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: { address: updatedAddress }
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: error.message
    });
  }
}

/**
 * Get user notifications
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.notification.count({
        where: { userId }
      })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
}

/**
 * Mark notification as read
 */
async function markNotificationRead(req, res) {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    // Check if notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification: updatedNotification }
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsRead(req, res) {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
}

/**
 * Get user wishlist
 */
async function getWishlist(req, res) {
  try {
    const userId = req.user.id;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                variants: {
                  take: 1,
                  include: {
                    images: true
                  }
                }
              }
            },
            variant: {
              include: {
                images: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: { wishlist: wishlist || { items: [] } }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist',
      error: error.message
    });
  }
}

/**
 * Add item to wishlist
 */
async function addToWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { productId, variantId } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId }
      });
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
        variantId: variantId || null
      }
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }

    // Add item to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
        variantId: variantId || null
      },
      include: {
        product: {
          include: {
            images: true,
            variants: {
              take: 1,
              include: {
                images: true
              }
            }
          }
        },
        variant: {
          include: {
            images: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist',
      data: { item: wishlistItem }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to wishlist',
      error: error.message
    });
  }
}

/**
 * Remove item from wishlist
 */
async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    // Find the wishlist item
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id: itemId,
        wishlist: {
          userId
        }
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    await prisma.wishlistItem.delete({
      where: { id: itemId }
    });

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist',
      error: error.message
    });
  }
}

module.exports = {
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
  removeFromWishlist,
};