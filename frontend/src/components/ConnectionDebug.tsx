import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const ConnectionDebug: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setStatus('Testing...');
    setLogs([]);
    
    addLog('🔍 Starting connection test...');
    
    // Log the API base URL
    addLog(`🔗 API Base URL: ${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}`);
    
    try {
      // Test 1: Simple GET request to products
      addLog('📡 Testing GET /products...');
      const response = await api.get('/products?limit=1');
      addLog(`✅ Products API success: ${JSON.stringify(response.data).substring(0, 100)}...`);
      
      // Test 2: Test root endpoint
      addLog('📡 Testing root endpoint...');
      const rootResponse = await fetch('http://localhost:3001');
      const rootData = await rootResponse.json();
      addLog(`✅ Root endpoint success: ${JSON.stringify(rootData)}`);
      
      // Test 3: Test auth endpoint
      addLog('📡 Testing auth endpoint...');
      try {
        await api.post('/auth/register', {});
      } catch (authError: any) {
        if (authError.response?.status === 400) {
          addLog('✅ Auth endpoint responding (validation error expected)');
        } else {
          addLog(`❌ Auth endpoint error: ${authError.message}`);
        }
      }
      
      setStatus('✅ All tests passed! Backend is connected.');
      
    } catch (error: any) {
      addLog(`❌ Connection failed: ${error.message}`);
      addLog(`Error details: ${JSON.stringify(error.response?.data || error, null, 2)}`);
      setStatus('❌ Connection failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Connection Debug</h3>
        <button
          onClick={testConnection}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
      
      <div className="mb-2">
        <div className="text-sm font-medium">{status}</div>
      </div>
      
      <div className="max-h-32 overflow-y-auto text-xs font-mono">
        {logs.map((log, index) => (
          <div key={index} className="py-1 border-b border-gray-100">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionDebug;