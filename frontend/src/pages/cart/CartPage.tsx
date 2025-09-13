import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, generatePlaceholderImage } from '../../lib/utils';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const { 
    items, 
    isLoading, 
    updateCartItem, 
    removeFromCart, 
    totalPrice,
    itemCount,
    clearCart 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  const moveToWishlist = (itemId: string) => {
    // TODO: Implement wishlist functionality
    handleRemoveItem(itemId);
    toast.success('Item moved to wishlist');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" text="Loading cart..." />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBagIcon className="w-16 h-16 text-gray-400" />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600">
              Looks like you haven't added any items to your cart yet.
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/products">
              <Button fullWidth>
                Start Shopping
              </Button>
            </Link>
            
            {isAuthenticated && (
              <Link to="/wishlist">
                <Button variant="outline" fullWidth>
                  View Wishlist
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const subtotal = totalPrice;
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear Cart
                  </Button>
                </div>

                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Link to={`/products/${item.product.id}`}>
                          <img
                            src={item.product.images[0]?.url || generatePlaceholderImage(120, 120, item.product.title)}
                            alt={item.product.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.product.id}`}>
                          <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                            {item.product.title}
                          </h3>
                        </Link>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.brand}
                        </p>

                        {/* Variant Info */}
                        {item.variant.size && (
                          <p className="text-sm text-gray-500 mt-1">
                            Size: {item.variant.size}
                          </p>
                        )}
                        {item.variant.color && (
                          <p className="text-sm text-gray-500">
                            Color: {item.variant.color}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center space-x-4 mt-3">
                          <button
                            onClick={() => moveToWishlist(item.id)}
                            className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <HeartIcon className="w-4 h-4 mr-1" />
                            Move to Wishlist
                          </button>
                          
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(item.variant.price * item.quantity)}
                        </div>
                        
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          <span className="px-3 py-1 text-sm font-medium min-w-12 text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity >= (item.variant.inventory || 0)}
                          >
                            <PlusIcon className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.variant.price)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Tax</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-lg font-bold">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {shipping > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg mb-6">
                  <p className="text-sm text-blue-800">
                    Add {formatCurrency(100 - subtotal)} more to get free shipping!
                  </p>
                </div>
              )}

              <Button
                fullWidth
                onClick={handleCheckout}
                className="mb-4"
              >
                Proceed to Checkout
              </Button>

              <Link to="/products">
                <Button variant="outline" fullWidth>
                  Continue Shopping
                </Button>
              </Link>

              {/* Security & Trust */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure Checkout
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;