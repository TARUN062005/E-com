import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ApiHealthCheckProps {
  children: React.ReactNode;
}

const ApiHealthCheck: React.FC<ApiHealthCheckProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Allow app to load first, then check connection
    setTimeout(() => {
      checkApiConnection();
    }, 1000);
  }, []);

  const checkApiConnection = async () => {
    try {
      console.log('🔍 Checking API connection to backend...');
      
      // Try to hit the products endpoint to check if backend is running
      const response = await api.get('/products?limit=1', { timeout: 5000 });
      
      console.log('✅ Backend connection successful:', response.data);
      setIsConnected(true);
      setError('');
    } catch (err: any) {
      console.error('❌ Backend connection failed:', err);
      setIsConnected(false);
      
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError('Cannot connect to backend server on localhost:3001. Please ensure the backend is running.');
      } else if (err.response?.status === 404) {
        setError('Backend API endpoint not found. Please check backend configuration.');
      } else {
        setError(`Backend error: ${err.message}`);
      }
    }
  };

  // Allow app to load regardless of connection status for debugging
  // if (isConnected === false && process.env.NODE_ENV === 'production') {
  //   // Only block in production if connection fails
  //   return connection error screen
  // }

  // Connection successful, render the app
  return <>{children}</>;
};

export default ApiHealthCheck;