import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const OrdersPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400" />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Please Log In
            </h2>
            <p className="text-gray-600">
              You need to log in to view your orders.
            </p>
          </div>

          <Link to="/login">
            <Button fullWidth>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-600 mt-1">View and track your purchase history</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              No Orders Yet
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              You haven't placed any orders yet. When you do, they'll appear here 
              with tracking information and order details.
            </p>
            
            <div className="pt-4">
              <Link to="/products">
                <Button size="lg">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                Order management functionality coming soon!
              </p>
              <p className="text-sm text-gray-500">
                You'll be able to view order history, track shipments, and manage returns here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;