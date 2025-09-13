import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <UserIcon className="w-16 h-16 text-gray-400" />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Please Log In
            </h2>
            <p className="text-gray-600">
              You need to log in to view your profile.
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
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 capitalize">Role: {user.role.toLowerCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              
              {user.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{user.phone}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              
              <div className="space-y-2">
                <Link to="/orders" className="block">
                  <Button variant="outline" fullWidth className="justify-start">
                    View Orders
                  </Button>
                </Link>
                
                <Link to="/addresses" className="block">
                  <Button variant="outline" fullWidth className="justify-start">
                    Manage Addresses
                  </Button>
                </Link>
                
                <Link to="/wishlist" className="block">
                  <Button variant="outline" fullWidth className="justify-start">
                    View Wishlist
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Profile editing functionality coming soon!
              </p>
              <p className="text-sm text-gray-500">
                You'll be able to update your information and preferences here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;