// User and Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'SELLER';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  emails?: Email[];
  phones?: Phone[];
  addresses?: Address[];
}

export interface Email {
  id: string;
  email: string;
  verified: boolean;
}

export interface Phone {
  id: string;
  phone: string;
  verified: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Product Types
export type ProductCategory = 
  | 'ELECTRONICS' 
  | 'FASHION' 
  | 'BOOKS' 
  | 'BEAUTY' 
  | 'HOME' 
  | 'FOOD' 
  | 'SPORTS' 
  | 'OTHER';

export interface ProductVariant {
  id: string;
  sku: string;
  title?: string;
  price: number;
  compareAt?: number;
  stock: number;
  inventory?: number;
  size?: string;
  color?: string;
  weightGrams?: number;
  barcode?: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  category: ProductCategory;
  brand?: string;
  tags: string[];
  isDraft: boolean;
  featured: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  images: ProductImage[];
  seller: {
    id: string;
    name: string;
  };
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: {
      name: ProductCategory;
      count: number;
      displayName: string;
    }[];
  };
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  addedAt: string;
  updatedAt: string;
  product: Product;
  variant: ProductVariant;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItem[];
    itemCount: number;
    totalPrice: number;
  };
}

// Address Types
export interface Address {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressData {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault?: boolean;
}

// Order Types
export type OrderStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'RETURN_REQUESTED' 
  | 'RETURNED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  product: Product;
  variant: ProductVariant;
}

export interface Order {
  id: string;
  totalPrice: number;
  shippingPrice?: number;
  taxAmount?: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Address;
  orderItems: OrderItem[];
}

export interface OrderData {
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  shippingAddressId: string;
}

// Chatbot Types
export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    suggestions?: string[];
  };
}

export interface Recommendation {
  id: string;
  product: Product;
  reason: string;
  confidence: number;
}

export interface RecommendationsResponse {
  success: boolean;
  data: {
    recommendations: Recommendation[];
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductSearchParams extends PaginationParams {
  q?: string;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'price_low' | 'price_high' | 'newest' | 'rating';
  featured?: boolean;
}

// Form Types
export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  errors?: any[];
}