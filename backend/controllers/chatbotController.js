const { Ai } = require('@cloudflare/ai');
const { prisma } = require('../config/database');

// Initialize Cloudflare AI (Note: This is deprecated, but we'll use it for demonstration)
// In production, you should use Cloudflare Workers AI binding
const ai = new Ai({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
});

/**
 * Chat with AI assistant
 */
async function chat(req, res) {
  try {
    const { message, context = 'general' } = req.body;
    const userId = req.user?.id;

    // Get user context if authenticated
    let userContext = '';
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
              orderItems: {
                include: {
                  product: {
                    select: { title: true, category: true }
                  }
                }
              }
            }
          },
          cartItems: {
            include: {
              product: {
                select: { title: true, category: true }
              }
            }
          }
        }
      });

      if (user) {
        const recentOrders = user.orders.map(order => 
          order.orderItems.map(item => item.product.title).join(', ')
        ).join('; ');
        
        const cartItems = user.cartItems.map(item => item.product.title).join(', ');
        
        userContext = `User context: Recent orders: ${recentOrders}. Current cart: ${cartItems}.`;
      }
    }

    // Build system prompt based on context
    let systemPrompt = `You are an AI shopping assistant for an e-commerce platform. You help customers with product recommendations, order assistance, and customer support. Always be helpful, friendly, and concise.`;

    if (context === 'product_recommendation') {
      systemPrompt += ` Focus on recommending products based on user preferences and browsing history.`;
    } else if (context === 'order_support') {
      systemPrompt += ` Help users with order-related questions including tracking, returns, and delivery information.`;
    } else if (context === 'customer_service') {
      systemPrompt += ` Provide customer service support for account issues, payment problems, and general inquiries.`;
    }

    // Get recent popular products for context
    const popularProducts = await prisma.product.findMany({
      where: {
        deletedAt: null,
        isDraft: false
      },
      include: {
        variants: {
          take: 1,
          orderBy: { price: 'asc' }
        },
        reviews: {
          select: { rating: true }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const productContext = popularProducts.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
      
      return `${product.title} (${product.category}) - $${product.variants[0]?.price || 0} - ${avgRating.toFixed(1)} stars`;
    }).join('\n');

    const fullPrompt = `${systemPrompt}\n\nAvailable products:\n${productContext}\n\n${userContext}\n\nUser message: ${message}`;

    // Call Cloudflare AI (using a fallback model)
    try {
      const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${userContext}\n\nAvailable products:\n${productContext.substring(0, 500)}...\n\nUser: ${message}` }
        ],
        max_tokens: 256,
        temperature: 0.7
      });

      let aiMessage = response.response || 'I apologize, but I\'m having trouble processing your request right now. Please try again later.';

      // If AI service fails, provide a fallback response
      if (!response.response) {
        aiMessage = generateFallbackResponse(message, context);
      }

      res.json({
        success: true,
        data: {
          message: aiMessage,
          context: context,
          timestamp: new Date().toISOString()
        }
      });

    } catch (aiError) {
      console.error('Cloudflare AI error:', aiError);
      
      // Provide fallback response
      const fallbackMessage = generateFallbackResponse(message, context);
      
      res.json({
        success: true,
        data: {
          message: fallbackMessage,
          context: context,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Chat service temporarily unavailable',
      error: error.message
    });
  }
}

/**
 * Generate fallback responses when AI service is unavailable
 */
function generateFallbackResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return 'I\'d be happy to help you find the right products! Could you tell me what category you\'re interested in? We have electronics, fashion, books, beauty products, home items, food, and sports equipment available.';
  }
  
  if (lowerMessage.includes('order') || lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
    return 'For order-related inquiries, you can check your order status in your account dashboard. Orders typically ship within 1-2 business days. If you need immediate assistance with a specific order, please provide your order number.';
  }
  
  if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
    return 'We offer a 30-day return policy for most items. You can initiate a return through your account dashboard or contact customer service. Refunds are typically processed within 5-7 business days after we receive your return.';
  }
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('card') || lowerMessage.includes('billing')) {
    return 'We accept major credit cards, UPI, net banking, and cash on delivery. If you\'re experiencing payment issues, please check your payment information and try again. Contact support if the problem persists.';
  }
  
  return 'Thank you for your message! I\'m here to help you with product recommendations, order questions, and customer service. How can I assist you today?';
}

/**
 * Get product recommendations based on user preferences
 */
async function getRecommendations(req, res) {
  try {
    const userId = req.user?.id;
    const { category, priceRange, limit = 5 } = req.query;

    let whereConditions = {
      deletedAt: null,
      isDraft: false
    };

    if (category) {
      whereConditions.category = category;
    }

    // Get user's order history for personalized recommendations
    let userPreferences = {};
    if (userId) {
      const userOrders = await prisma.orderItem.findMany({
        where: {
          order: {
            userId
          }
        },
        include: {
          product: {
            select: {
              category: true
            }
          }
        }
      });

      // Count categories from user's order history
      userPreferences = userOrders.reduce((acc, item) => {
        const cat = item.product.category;
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
    }

    // Get recommended products
    const products = await prisma.product.findMany({
      where: whereConditions,
      include: {
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          take: 1,
          orderBy: { price: 'asc' }
        },
        reviews: {
          select: { rating: true }
        }
      },
      take: parseInt(limit) * 2 // Get more to filter later
    });

    // Score products based on user preferences and ratings
    const scoredProducts = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
      
      const categoryScore = userPreferences[product.category] || 0;
      const ratingScore = avgRating * 2;
      const totalScore = categoryScore + ratingScore;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        score: totalScore
      };
    });

    // Sort by score and limit results
    const recommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map(({ score, ...product }) => product);

    res.json({
      success: true,
      data: {
        recommendations,
        userPreferences: Object.keys(userPreferences).length > 0 ? userPreferences : null
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
}

/**
 * Get order assistance information
 */
async function getOrderAssistance(req, res) {
  try {
    const userId = req.user.id;
    const { orderId } = req.query;

    let orderInfo = null;
    if (orderId) {
      orderInfo = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: { title: true }
              }
            }
          },
          shippingAddress: true,
          payment: true
        }
      });
    } else {
      // Get recent orders
      orderInfo = await prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              product: {
                select: { title: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
    }

    const assistanceInfo = {
      faq: [
        {
          question: "How can I track my order?",
          answer: "You can track your order status in your account dashboard or use the order tracking feature with your order ID."
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery."
        },
        {
          question: "Can I change my order after placing it?",
          answer: "Orders can be modified within 1 hour of placement. After that, please contact customer service."
        },
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for most items in original condition."
        }
      ],
      contactInfo: {
        email: "support@ecommerce-platform.com",
        phone: "1-800-123-4567",
        hours: "Monday-Friday 9AM-6PM EST"
      }
    };

    res.json({
      success: true,
      data: {
        orderInfo,
        assistanceInfo
      }
    });

  } catch (error) {
    console.error('Get order assistance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order assistance',
      error: error.message
    });
  }
}

module.exports = {
  chat,
  getRecommendations,
  getOrderAssistance,
};