const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

console.log('🧪 Testing Backend Connection...\n');

async function testBackend() {
  try {
    console.log('1. Testing root endpoint...');
    const rootResponse = await axios.get(API_BASE_URL.replace('/api', ''), { timeout: 5000 });
    console.log('✅ Root endpoint successful:', rootResponse.data);
    
    console.log('\n2. Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`, { timeout: 5000 });
    console.log('✅ Products endpoint successful. Found', productsResponse.data?.data?.products?.length || 0, 'products');
    
    console.log('\n3. Testing auth endpoints...');
    // Test a POST request to registration (should return validation error, but server should respond)
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {});
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Auth endpoint responding (validation error expected)');
      } else {
        console.log('❌ Auth endpoint error:', err.message);
      }
    }
    
    console.log('\n🎉 Backend is working correctly!');
    console.log('Frontend should now be able to connect to:', API_BASE_URL);
    
  } catch (error) {
    console.error('\n❌ Backend connection failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Is the backend running on localhost:3001?');
      console.error('\nTo start the backend:');
      console.error('1. cd ../backend');
      console.error('2. npm run dev');
    } else if (error.code === 'ENOTFOUND') {
      console.error('DNS resolution failed. Check if localhost is accessible.');
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

testBackend();