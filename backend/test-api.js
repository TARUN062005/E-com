/**
 * API Test Script for E-commerce AI Platform
 * 
 * This script tests the main API endpoints to ensure they work correctly.
 * Make sure the server is running before executing this script.
 * 
 * Run with: node test-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let testUserId = '';

// Test configuration
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123!',
  phone: '1234567890'
};

const testProduct = {
  title: 'Test iPhone 15 Pro',
  description: 'Test product for API testing',
  category: 'ELECTRONICS',
  brand: 'Apple',
  tags: ['test', 'smartphone'],
  variants: [
    {
      sku: `TEST-IPHONE-${Date.now()}`,
      title: '128GB',
      price: 999.99,
      stock: 10
    }
  ],
  images: [
    {
      url: 'https://example.com/test-image.jpg',
      altText: 'Test iPhone'
    }
  ]
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(useAuth && authToken && { Authorization: `Bearer ${authToken}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function testServerHealth() {
  console.log('🧪 Testing server health...');
  const result = await apiCall('GET', '/../');
  
  if (result.success) {
    console.log('✅ Server is running');
    return true;
  } else {
    console.log('❌ Server health check failed:', result.error);
    return false;
  }
}

async function testUserRegistration() {
  console.log('🧪 Testing user registration...');
  const result = await apiCall('POST', '/auth/register', testUser);
  
  if (result.success) {
    console.log('✅ User registration successful');
    authToken = result.data.data.token;
    testUserId = result.data.data.user.id;
    return true;
  } else {
    console.log('❌ User registration failed:', result.error);
    return false;
  }
}

async function testUserLogin() {
  console.log('🧪 Testing user login...');
  const result = await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (result.success) {
    console.log('✅ User login successful');
    authToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ User login failed:', result.error);
    return false;
  }
}

async function testGetProfile() {
  console.log('🧪 Testing get user profile...');
  const result = await apiCall('GET', '/auth/profile', null, true);
  
  if (result.success) {
    console.log('✅ Get profile successful');
    return true;
  } else {
    console.log('❌ Get profile failed:', result.error);
    return false;
  }
}

async function testProductCategories() {
  console.log('🧪 Testing product categories...');
  const result = await apiCall('GET', '/products/categories');
  
  if (result.success) {
    console.log('✅ Product categories retrieved successfully');
    console.log(`   Found ${result.data.data.categories.length} categories`);
    return true;
  } else {
    console.log('❌ Get product categories failed:', result.error);
    return false;
  }
}

async function testGetProducts() {
  console.log('🧪 Testing get products...');
  const result = await apiCall('GET', '/products?page=1&limit=5');
  
  if (result.success) {
    console.log('✅ Get products successful');
    console.log(`   Found ${result.data.data.products.length} products`);
    return true;
  } else {
    console.log('❌ Get products failed:', result.error);
    return false;
  }
}

async function testProductSearch() {
  console.log('🧪 Testing product search...');
  const result = await apiCall('GET', '/products/search?q=test&limit=3');
  
  if (result.success) {
    console.log('✅ Product search successful');
    return true;
  } else {
    console.log('❌ Product search failed:', result.error);
    return false;
  }
}

async function testCreateAddress() {
  console.log('🧪 Testing create address...');
  const addressData = {
    label: 'Test Home',
    line1: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
    zipCode: '12345',
    isDefault: true
  };
  
  const result = await apiCall('POST', '/users/addresses', addressData, true);
  
  if (result.success) {
    console.log('✅ Create address successful');
    return result.data.data.address.id;
  } else {
    console.log('❌ Create address failed:', result.error);
    return false;
  }
}

async function testGetCart() {
  console.log('🧪 Testing get cart...');
  const result = await apiCall('GET', '/cart', null, true);
  
  if (result.success) {
    console.log('✅ Get cart successful');
    console.log(`   Cart has ${result.data.data.itemCount} items`);
    return true;
  } else {
    console.log('❌ Get cart failed:', result.error);
    return false;
  }
}

async function testChatbot() {
  console.log('🧪 Testing AI chatbot...');
  const result = await apiCall('POST', '/chatbot/chat', {
    message: 'Hello, can you help me find some products?',
    context: 'general'
  }, true);
  
  if (result.success) {
    console.log('✅ Chatbot test successful');
    console.log(`   AI Response: ${result.data.data.message.substring(0, 100)}...`);
    return true;
  } else {
    console.log('❌ Chatbot test failed:', result.error);
    return false;
  }
}

async function testRecommendations() {
  console.log('🧪 Testing AI recommendations...');
  const result = await apiCall('GET', '/chatbot/recommendations?limit=3', null, true);
  
  if (result.success) {
    console.log('✅ AI recommendations successful');
    console.log(`   Got ${result.data.data.recommendations.length} recommendations`);
    return true;
  } else {
    console.log('❌ AI recommendations failed:', result.error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Tests for E-commerce AI Platform\n');
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth, required: true },
    { name: 'User Registration', fn: testUserRegistration, required: true },
    { name: 'User Login', fn: testUserLogin, required: true },
    { name: 'Get Profile', fn: testGetProfile, required: false },
    { name: 'Product Categories', fn: testProductCategories, required: false },
    { name: 'Get Products', fn: testGetProducts, required: false },
    { name: 'Product Search', fn: testProductSearch, required: false },
    { name: 'Create Address', fn: testCreateAddress, required: false },
    { name: 'Get Cart', fn: testGetCart, required: false },
    { name: 'AI Chatbot', fn: testChatbot, required: false },
    { name: 'AI Recommendations', fn: testRecommendations, required: false }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    
    if (result) {
      passed++;
    } else {
      failed++;
      if (test.required) {
        console.log(`❌ Required test failed. Stopping execution.`);
        break;
      }
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=================================');
  console.log('📊 TEST RESULTS');
  console.log('=================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the error messages above.');
  }
  
  console.log('\n📚 Next Steps:');
  console.log('1. Set up your MongoDB database');
  console.log('2. Configure your Cloudflare AI credentials in .env');
  console.log('3. Run the frontend application');
  console.log('4. Start building your e-commerce platform!');
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };