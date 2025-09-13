const { prisma } = require('../config/database');

/**
 * Get all products with filters and search
 */
async function getProducts(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {
      deletedAt: null,
      isDraft: false,
      ...(category && { category }),
      ...(featured !== undefined && { featured: featured === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      })
    };

    // Add price filter if specified
    if (minPrice || maxPrice) {
      where.variants = {
        some: {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) })
          }
        }
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          variants: {
            include: {
              images: true,
              inventory: true
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              sellerProfile: {
                select: {
                  businessName: true,
                  rating: true
                }
              }
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average ratings and format response
    const formattedProducts = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined // Remove reviews array from response
      };
    });

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message
    });
  }
}

/**
 * Get single product by ID
 */
async function getProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { 
        id,
        deletedAt: null,
        isDraft: false
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          include: {
            images: true,
            inventory: true,
            attributes: {
              include: {
                attribute: true
              }
            }
          },
          where: { deletedAt: null }
        },
        seller: {
          select: {
            id: true,
            name: true,
            sellerProfile: {
              select: {
                businessName: true,
                rating: true
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        attributes: {
          include: {
            attribute: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    const formattedProduct = {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length
    };

    res.json({
      success: true,
      data: { product: formattedProduct }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message
    });
  }
}

/**
 * Create new product (sellers/admins only)
 */
async function createProduct(req, res) {
  try {
    const sellerId = req.user.id;
    const {
      title,
      description,
      category,
      brand,
      tags = [],
      variants,
      images = [],
      isDraft = false,
      featured = false
    } = req.body;

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + Date.now();

    // Create product with variants
    const product = await prisma.product.create({
      data: {
        sellerId,
        title,
        slug,
        description,
        category,
        brand,
        tags,
        isDraft,
        featured,
        variants: {
          create: variants.map(variant => ({
            sku: variant.sku,
            title: variant.title,
            price: variant.price,
            compareAt: variant.compareAt,
            stock: variant.stock || 0,
            weightGrams: variant.weightGrams,
            barcode: variant.barcode,
            inventory: {
              create: {
                availableQty: variant.stock || 0
              }
            }
          }))
        },
        ...(images.length > 0 && {
          images: {
            create: images.map((img, index) => ({
              url: img.url,
              altText: img.altText,
              sortOrder: index
            }))
          }
        })
      },
      include: {
        variants: {
          include: {
            inventory: true
          }
        },
        images: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
}

/**
 * Update product (sellers/admins only)
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const {
      title,
      description,
      category,
      brand,
      tags,
      isDraft,
      featured
    } = req.body;

    // Check if product exists and user has permission
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { seller: true }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check permissions
    if (userRole !== 'ADMIN' && existingProduct.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(brand && { brand }),
        ...(tags && { tags }),
        ...(isDraft !== undefined && { isDraft }),
        ...(featured !== undefined && { featured })
      },
      include: {
        variants: {
          include: {
            inventory: true
          }
        },
        images: true,
        seller: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
}

/**
 * Delete product (soft delete)
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if product exists and user has permission
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check permissions
    if (userRole !== 'ADMIN' && existingProduct.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
}

/**
 * Get product categories
 */
async function getCategories(req, res) {
  try {
    // Get categories from enum
    const categories = [
      'ELECTRONICS',
      'FASHION',
      'BOOKS',
      'BEAUTY',
      'HOME',
      'FOOD',
      'SPORTS',
      'OTHER'
    ];

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.product.count({
          where: {
            category,
            deletedAt: null,
            isDraft: false
          }
        });
        return {
          name: category,
          count,
          displayName: category.toLowerCase().replace(/^\w/, c => c.toUpperCase())
        };
      })
    );

    res.json({
      success: true,
      data: { categories: categoriesWithCount }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
}

/**
 * Search products
 */
async function searchProducts(req, res) {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { products: [] }
      });
    }

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        isDraft: false,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
          { brand: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: {
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          take: 1,
          orderBy: { price: 'asc' }
        }
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
}

/**
 * Get product reviews
 */
async function getProductReviews(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.review.count({
        where: { productId: id }
      })
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product reviews',
      error: error.message
    });
  }
}

/**
 * Create product review
 */
async function createReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, body, variantId } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: id,
        userId,
        ...(variantId && { variantId })
      }
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId: id,
        variantId: variantId || null,
        rating,
        title,
        body
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  searchProducts,
  getProductReviews,
  createReview,
};