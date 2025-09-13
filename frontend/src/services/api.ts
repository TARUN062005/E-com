import api from '../lib/api';
import {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
  ProductsResponse,
  CategoriesResponse,
  ProductSearchParams,
  Product,
  CartResponse,
  CartItem,
  Address,
  AddressData,
  OrderData,
  Order,
  ChatResponse,
  RecommendationsResponse,
  ApiResponse
} from '../types';

// ==================== AUTH SERVICES ====================
const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

// ==================== PRODUCT SERVICES ====================
const productService = {
  // Get all products with pagination and filters
  getProducts: async (params: ProductSearchParams = {}): Promise<ProductsResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (params: ProductSearchParams): Promise<ProductsResponse> => {
    const response = await api.get('/products/search', { params });
    return response.data;
  },

  // Get product categories
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8): Promise<ProductsResponse> => {
    const response = await api.get('/products', {
      params: { featured: true, limit }
    });
    return response.data;
  },

  // Get product brands
  getBrands: async (): Promise<{ success: boolean; data: { brands: string[] } }> => {
    const response = await api.get('/products/brands');
    return response.data;
  }
};

// ==================== CART SERVICES ====================
const cartService = {
  // Get user's cart
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (data: {
    productId: string;
    variantId: string;
    quantity: number;
  }): Promise<ApiResponse<CartItem>> => {
    const response = await api.post('/cart', data);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId: string, data: {
    quantity: number;
  }): Promise<ApiResponse<CartItem>> => {
    const response = await api.put(`/cart/${itemId}`, data);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<ApiResponse> => {
    const response = await api.delete('/cart');
    return response.data;
  }
};

// ==================== USER/PROFILE SERVICES ====================
const userService = {
  // Get user addresses
  getAddresses: async (): Promise<{ success: boolean; data: { addresses: Address[] } }> => {
    const response = await api.get('/users/addresses');
    return response.data;
  },

  // Create new address
  createAddress: async (data: AddressData): Promise<{ success: boolean; data: { address: Address } }> => {
    const response = await api.post('/users/addresses', data);
    return response.data;
  },

  // Update address
  updateAddress: async (id: string, data: AddressData): Promise<{ success: boolean; data: { address: Address } }> => {
    const response = await api.put(`/users/addresses/${id}`, data);
    return response.data;
  },

  // Delete address
  deleteAddress: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/users/addresses/${id}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  }
};

// ==================== ORDER SERVICES ====================
const orderService = {
  // Get user's orders
  getOrders: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: { orders: Order[]; pagination: any } }> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id: string): Promise<{ success: boolean; data: { order: Order } }> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  createOrder: async (data: OrderData): Promise<{ success: boolean; data: { order: Order } }> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<ApiResponse> => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  }
};

// ==================== CHATBOT SERVICES ====================
const chatbotService = {
  // Send message to AI chatbot
  sendMessage: async (data: {
    message: string;
    context?: string;
  }): Promise<ChatResponse> => {
    const response = await api.post('/chatbot/chat', data);
    return response.data;
  },

  // Get AI product recommendations
  getRecommendations: async (params: {
    limit?: number;
    context?: string;
  } = {}): Promise<RecommendationsResponse> => {
    const response = await api.get('/chatbot/recommendations', { params });
    return response.data;
  }
};

// ==================== ADMIN SERVICES ====================
const adminService = {
  // Create new product (admin/seller only)
  createProduct: async (data: {
    title: string;
    description?: string;
    category: string;
    brand?: string;
    tags?: string[];
    variants: {
      sku: string;
      title?: string;
      price: number;
      stock: number;
    }[];
    images?: {
      url: string;
      altText?: string;
    }[];
  }): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.post('/admin/products', data);
    return response.data;
  },

  // Update product (admin/seller only)
  updateProduct: async (id: string, data: any): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.put(`/admin/products/${id}`, data);
    return response.data;
  },

  // Delete product (admin/seller only)
  deleteProduct: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Get all orders (admin only)
  getAllOrders: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{ success: boolean; data: { orders: Order[]; pagination: any } }> => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  // Update order status (admin only)
  updateOrderStatus: async (id: string, data: {
    status: string;
  }): Promise<{ success: boolean; data: { order: Order } }> => {
    const response = await api.put(`/admin/orders/${id}`, data);
    return response.data;
  }
};

// Export all services
export {
  authService,
  productService,
  cartService,
  userService,
  orderService,
  chatbotService,
  adminService
};