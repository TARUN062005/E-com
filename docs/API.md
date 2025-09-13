# E-commerce AI Platform API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "error": "string"
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "clp123abc",
      "name": "John Doe",
      "role": "USER",
      "isVerified": false,
      "emails": [{"email": "john@example.com", "verified": false}],
      "createdAt": "2025-01-13T10:53:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Verify Email
**POST** `/auth/verify-email`
*Requires Authentication*

Verify email address with OTP.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset OTP.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
**POST** `/auth/reset-password`

Reset password using OTP.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

### Get Profile
**GET** `/auth/profile`
*Requires Authentication*

Get current user profile information.

### Update Profile
**PUT** `/auth/profile`
*Requires Authentication*

Update user profile.

**Request Body:**
```json
{
  "name": "John Smith"
}
```

---

## Product Endpoints

### Get Products
**GET** `/products`

Get paginated list of products with optional filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category
- `search` (string): Search in title, description, tags
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `featured` (boolean): Filter featured products
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "clp123def",
        "title": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "category": "ELECTRONICS",
        "brand": "Apple",
        "avgRating": 4.5,
        "reviewCount": 23,
        "variants": [
          {
            "id": "clp123var",
            "price": 999.99,
            "stock": 50,
            "sku": "IPHONE-15-PRO-128"
          }
        ],
        "images": [
          {
            "url": "https://example.com/image.jpg",
            "altText": "iPhone 15 Pro"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### Get Single Product
**GET** `/products/:id`

Get detailed product information.

### Create Product
**POST** `/products`
*Requires Authentication (SELLER/ADMIN)*

Create a new product.

**Request Body:**
```json
{
  "title": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features",
  "category": "ELECTRONICS",
  "brand": "Apple",
  "tags": ["smartphone", "apple", "5g"],
  "variants": [
    {
      "sku": "IPHONE-15-PRO-128",
      "title": "128GB",
      "price": 999.99,
      "stock": 50,
      "weightGrams": 187
    }
  ],
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "altText": "iPhone 15 Pro"
    }
  ]
}
```

### Update Product
**PUT** `/products/:id`
*Requires Authentication (SELLER/ADMIN)*

Update product information.

### Delete Product
**DELETE** `/products/:id`
*Requires Authentication (SELLER/ADMIN)*

Soft delete a product.

### Get Categories
**GET** `/products/categories`

Get all product categories with counts.

### Search Products
**GET** `/products/search`

Search products by query.

**Query Parameters:**
- `q` (string): Search query
- `limit` (number): Result limit (default: 10)

### Get Product Reviews
**GET** `/products/:id/reviews`

Get paginated reviews for a product.

### Create Review
**POST** `/products/:id/reviews`
*Requires Authentication*

Create a product review.

**Request Body:**
```json
{
  "rating": 5,
  "title": "Excellent product!",
  "body": "Very satisfied with this purchase.",
  "variantId": "clp123var"
}
```

---

## Cart Endpoints

### Get Cart
**GET** `/cart`
*Requires Authentication*

Get current user's cart items.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clp123cart",
        "quantity": 2,
        "product": {
          "id": "clp123prod",
          "title": "iPhone 15 Pro"
        },
        "variant": {
          "id": "clp123var",
          "price": 999.99,
          "sku": "IPHONE-15-PRO-128"
        }
      }
    ],
    "totalPrice": 1999.98,
    "itemCount": 2
  }
}
```

### Add to Cart
**POST** `/cart`
*Requires Authentication*

Add item to cart.

**Request Body:**
```json
{
  "productId": "clp123prod",
  "variantId": "clp123var",
  "quantity": 1
}
```

### Update Cart Item
**PUT** `/cart/:id`
*Requires Authentication*

Update cart item quantity.

### Remove from Cart
**DELETE** `/cart/:id`
*Requires Authentication*

Remove item from cart.

---

## Order Endpoints

### Get Orders
**GET** `/orders`
*Requires Authentication*

Get paginated user orders.

### Create Order
**POST** `/orders`
*Requires Authentication*

Create order from cart items.

**Request Body:**
```json
{
  "shippingAddressId": "clp123addr",
  "paymentMethod": "CARD"
}
```

### Get Single Order
**GET** `/orders/:id`
*Requires Authentication*

Get detailed order information.

---

## User Management Endpoints

### Get Addresses
**GET** `/users/addresses`
*Requires Authentication*

Get user addresses.

### Create Address
**POST** `/users/addresses`
*Requires Authentication*

Create new address.

**Request Body:**
```json
{
  "label": "Home",
  "line1": "123 Main St",
  "line2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001",
  "isDefault": true
}
```

### Update Address
**PUT** `/users/addresses/:id`
*Requires Authentication*

Update address information.

### Delete Address
**DELETE** `/users/addresses/:id`
*Requires Authentication*

Delete address.

### Get Notifications
**GET** `/users/notifications`
*Requires Authentication*

Get user notifications.

### Get Wishlist
**GET** `/users/wishlist`
*Requires Authentication*

Get user wishlist.

### Add to Wishlist
**POST** `/users/wishlist`
*Requires Authentication*

Add item to wishlist.

---

## AI Chatbot Endpoints

### Chat with AI
**POST** `/chatbot/chat`
*Authentication Optional (Enhanced if authenticated)*

Chat with AI assistant.

**Request Body:**
```json
{
  "message": "Can you recommend some smartphones?",
  "context": "product_recommendation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "I'd be happy to recommend some great smartphones! Based on our current inventory, here are some top options...",
    "context": "product_recommendation",
    "timestamp": "2025-01-13T10:53:00.000Z"
  }
}
```

**Context Options:**
- `general`: General assistance
- `product_recommendation`: Product recommendations
- `order_support`: Order-related help
- `customer_service`: Customer support

### Get AI Recommendations
**GET** `/chatbot/recommendations`
*Authentication Optional (Personalized if authenticated)*

Get AI-powered product recommendations.

**Query Parameters:**
- `category` (string): Filter by category
- `limit` (number): Number of recommendations (default: 5)

### Get Order Assistance
**GET** `/chatbot/order-assistance`
*Requires Authentication*

Get order assistance information and FAQ.

---

## Admin Endpoints

### Get Dashboard Stats
**GET** `/admin/stats`
*Requires Authentication (ADMIN)*

Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "totalProducts": 580,
      "totalOrders": 3420,
      "totalRevenue": 125000.50
    }
  }
}
```

### Get All Users
**GET** `/admin/users`
*Requires Authentication (ADMIN)*

Get paginated list of all users.

---

## Error Codes

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

### Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Access token required"
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15-minute window per IP address.

## Pagination

Endpoints that return lists support pagination with these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Pagination responses include:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```