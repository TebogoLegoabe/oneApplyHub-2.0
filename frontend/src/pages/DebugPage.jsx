import React, { useState } from 'react';
import { testConnection, authAPI } from '../services/api';

const DebugPage = () => {
  const [connectionStatus, setConnectionStatus] = useState('Not tested');
  const [testResults, setTestResults] = useState([]);

  const addResult = (test, status, details) => {
    setTestResults(prev => [...prev, { test, status, details, time: new Date().toLocaleTimeString() }]);
  };

  const testFlaskConnection = async () => {
    try {
      const result = await testConnection();
      setConnectionStatus('Connected ✅');
      addResult('Flask Connection', 'Success', JSON.stringify(result));
    } catch (error) {
      setConnectionStatus('Failed ❌');
      addResult('Flask Connection', 'Failed', error.message);
    }
  };

  const testRegistration = async () => {
    try {
      const testUser = {
        name: 'Test User',
        email: 'test@students.wits.ac.za',
        password: 'test123',
        year_of_study: '2nd Year',
        faculty: 'Engineering'
      };
      
      const result = await authAPI.register(testUser);
      addResult('Registration Test', 'Success', JSON.stringify(result.data));
    } catch (error) {
      addResult('Registration Test', 'Failed', error.response?.data?.error || error.message);
    }
  };

  const testLogin = async () => {
    try {
      const result = await authAPI.login({
        email: 'test@students.wits.ac.za',
        password: 'test123'
      });
      addResult('Login Test', 'Success', JSON.stringify(result.data));
    } catch (error) {
      addResult('Login Test', 'Failed', error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Debug Page</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg">{connectionStatus}</p>
          
          <div className="mt-4 space-x-4">
            <button
              onClick={testFlaskConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Flask Connection
            </button>
            <button
              onClick={testRegistration}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Registration
            </button>
            <button
              onClick={testLogin}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Test Login
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click the buttons above to test API endpoints.</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.test}</span>
                    <span className={`text-sm ${result.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
                      {result.status}
                    </span>
                    <span className="text-xs text-gray-500">{result.time}</span>
                  </div>
                  <pre className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                    {result.details}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPage;