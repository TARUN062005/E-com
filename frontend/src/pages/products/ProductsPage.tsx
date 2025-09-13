import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { productService } from '../../services/api';
import { Product } from '../../types';
import { formatCurrency, generatePlaceholderImage, getCategoryDisplayName } from '../../lib/utils';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner, { ProductCardSkeleton } from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';

interface ProductFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  brand: string;
  sortBy: 'featured' | 'price_low' | 'price_high' | 'newest' | 'rating';
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  
  const { addToCart } = useCart();
  const [cartLoading, setCartLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    sortBy: (searchParams.get('sortBy') as ProductFilters['sortBy']) || 'featured'
  });

  const searchQuery = searchParams.get('q') || '';

  // Load products and filters data
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
  }, [searchParams]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: searchQuery,
        category: filters.category,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        brand: filters.brand,
        sortBy: filters.sortBy,
        limit: 20
      };

      const response = await productService.searchProducts(params);
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      if (response.success) {
        setCategories(response.data.categories.map(cat => cat.name));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await productService.getBrands();
      if (response.success) {
        setBrands(response.data.brands);
      }
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const newFilters: ProductFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      sortBy: 'featured'
    };
    setFilters(newFilters);
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  const handleAddToCart = async (product: Product, variantId?: string) => {
    const variant = variantId 
      ? product.variants.find(v => v.id === variantId)
      : product.variants[0];
    
    if (!variant) {
      toast.error('Product variant not available');
      return;
    }

    setCartLoading(true);
    try {
      await addToCart(product.id, variant.id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const toggleWishlist = (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
      toast.success('Removed from wishlist');
    } else {
      newWishlist.add(productId);
      toast.success('Added to wishlist');
    }
    setWishlist(newWishlist);
  };

  const activeFiltersCount = useMemo(() => {
    return [filters.category, filters.brand, filters.minPrice, filters.maxPrice].filter(Boolean).length;
  }, [filters]);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Products'}
          </h1>
          <p className="text-gray-600">
            Discover our wide selection of quality products
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Filter Toggle & Active Filters */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                leftIcon={<FunnelIcon className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
              
              <div className="hidden lg:flex items-center gap-4">
                {/* Category Filter */}
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...categories.map(cat => ({ 
                      value: cat, 
                      label: getCategoryDisplayName(cat) 
                    }))
                  ]}
                  className="min-w-40"
                />

                {/* Brand Filter */}
                <Select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  options={[
                    { value: '', label: 'All Brands' },
                    ...brands.map(brand => ({ value: brand, label: brand }))
                  ]}
                  className="min-w-32"
                />

                {/* Price Range */}
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min $"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-20"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="Max $"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-20"
                  />
                </div>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    leftIcon={<XMarkIcon className="w-4 h-4" />}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as ProductFilters['sortBy'])}
                options={sortOptions}
                className="min-w-40"
              />
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t space-y-4">
              <Select
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map(cat => ({ 
                    value: cat, 
                    label: getCategoryDisplayName(cat) 
                  }))
                ]}
              />

              <Select
                label="Brand"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                options={[
                  { value: '', label: 'All Brands' },
                  ...brands.map(brand => ({ value: brand, label: brand }))
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Price"
                  type="number"
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <Input
                  label="Max Price"
                  type="number"
                  placeholder="$999"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  leftIcon={<XMarkIcon className="w-4 h-4" />}
                  fullWidth
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={product.images[0]?.url || generatePlaceholderImage(300, 240, product.title)}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </Link>
                  
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    {wishlist.has(product.id) ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(product.variants[0]?.price || 0)}
                      </span>
                      {product.variants[0]?.compareAt && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.variants[0].compareAt)}
                        </span>
                      )}
                    </div>
                    
                    {product.rating && (
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    fullWidth
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={cartLoading || (product.variants[0]?.inventory || 0) <= 0}
                    isLoading={cartLoading}
                  >
                    {(product.variants[0]?.inventory || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No results found for "${searchQuery}". Try adjusting your search or filters.`
                : 'No products match your current filters. Try adjusting them to see more results.'
              }
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More - TODO: Implement pagination */}
        {products.length >= 20 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;