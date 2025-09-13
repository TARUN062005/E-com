# E-commerce AI Platform

A comprehensive e-commerce platform with AI-powered chatbot functionality for small businesses.

## Features

### Core E-commerce Features
- **User Management**: Registration, authentication, profile management
- **Product Catalog**: Browse products with categories, filters, and search
- **Shopping Cart**: Add/remove items, manage quantities
- **Order Processing**: Place orders, track status, view history
- **Admin Panel**: Product management, order management
- **Responsive Design**: Mobile-first approach

### AI-Powered Features
- **AI Chatbot**: Customer support and product recommendations
- **Smart Search**: AI-enhanced product search
- **Order Assistance**: AI-guided order placement and tracking

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT + bcrypt
- **AI**: Cloudflare AI SDK

### Frontend
- **Framework**: React
- **Styling**: TailwindCSS
- **Routing**: React Router
- **HTTP Client**: Axios

## Project Structure

```
ecommerce-ai-platform/
├── backend/           # Node.js API server
├── frontend/          # React application
├── docs/             # API documentation
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance
- Cloudflare AI account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-ai-platform
```

2. Set up the backend:
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database and API keys
npm run dev
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
PORT=3001
```

## API Documentation

Comprehensive API documentation is available in the `/docs` directory.

## License

MIT License