import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { productService } from '../../services/api';
import { Product } from '../../types';
import { formatCurrency, generatePlaceholderImage, getCategoryDisplayName } from '../../lib/utils';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const [cartLoading, setCartLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const response = await productService.getProduct(productId);
      if (response.success) {
        setProduct(response.data.product);
        setSelectedVariant(response.data.product.variants[0]?.id || '');
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;

    setCartLoading(true);
    try {
      await addToCart(product.id, selectedVariant, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const toggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currentVariant = product.variants.find(v => v.id === selectedVariant) || product.variants[0];
  const isOutOfStock = (currentVariant?.inventory || 0) <= 0;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><a href="/" className="hover:text-gray-900">Home</a></li>
            <li><span className="text-gray-400">/</span></li>
            <li><a href="/products" className="hover:text-gray-900">Products</a></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900">{product.title}</span></li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]?.url || generatePlaceholderImage(600, 600, product.title)}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url || generatePlaceholderImage(80, 80, product.title)}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                  <p className="text-lg text-gray-600">{product.brand}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {isWishlisted ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarSolidIcon
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(product.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating?.toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(currentVariant?.price || 0)}
              </span>
              {currentVariant?.compareAt && (
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(currentVariant.compareAt)}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Options</h3>
                <Select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  options={product.variants.map(variant => ({
                    value: variant.id,
                    label: `${variant.size ? `${variant.size} - ` : ''}${variant.color ? `${variant.color} - ` : ''}${formatCurrency(variant.price)}`
                  }))}
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
              <Select
                value={quantity.toString()}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                options={Array.from({ length: Math.min(10, currentVariant?.inventory || 0) }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: (i + 1).toString()
                }))}
                disabled={isOutOfStock}
              />
            </div>

            {/* Stock Status */}
            <div className="text-sm">
              {isOutOfStock ? (
                <span className="text-red-600 font-medium">Out of Stock</span>
              ) : (currentVariant?.inventory || 0) < 10 ? (
                <span className="text-orange-600 font-medium">
                  Only {currentVariant?.inventory} left in stock
                </span>
              ) : (
                <span className="text-green-600 font-medium">In Stock</span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={handleAddToCart}
                disabled={cartLoading || isOutOfStock}
                isLoading={cartLoading}
                leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => navigate('/checkout', { state: { product, variant: currentVariant, quantity } })}
                disabled={isOutOfStock}
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <TruckIcon className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-600">SSL encrypted checkout</p>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="pt-6 border-t">
              <p className="text-sm text-gray-600">
                Category: <span className="font-medium">{getCategoryDisplayName(product.category)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section - Placeholder */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="text-center py-12">
              <p className="text-gray-600">Reviews feature coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">
                Be the first to review this product when reviews are available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;