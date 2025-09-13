import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

const CheckoutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBagIcon className="w-16 h-16 text-blue-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Checkout Coming Soon
          </h2>
          <p className="text-gray-600">
            The checkout functionality is currently being developed. 
            Please check back later to complete your purchase.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/cart">
            <Button fullWidth>
              Back to Cart
            </Button>
          </Link>
          
          <Link to="/products">
            <Button variant="outline" fullWidth>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;