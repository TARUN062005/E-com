import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* 404 Illustration */}
        <div className="space-y-6">
          <div className="mx-auto w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
            <ShoppingBagIcon className="w-16 h-16 text-blue-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900">
              Page Not Found
            </h2>
            <p className="text-gray-600">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/" className="block">
            <Button
              fullWidth
              leftIcon={<HomeIcon className="w-4 h-4" />}
              className="justify-center"
            >
              Back to Home
            </Button>
          </Link>
          
          <Link to="/products" className="block">
            <Button
              variant="outline"
              fullWidth
              leftIcon={<ShoppingBagIcon className="w-4 h-4" />}
              className="justify-center"
            >
              Browse Products
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500">
            Need help? Contact our{' '}
            <Link 
              to="/contact" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              support team
            </Link>
            {' '}or browse our{' '}
            <Link 
              to="/help" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              help center
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;