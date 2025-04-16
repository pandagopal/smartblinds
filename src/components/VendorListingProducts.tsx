import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../models/Product';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import { api } from '../services/api';

interface VendorListingProductsProps {
  limit?: number;
  showFilters?: boolean;
  title?: string;
}

const VendorListingProducts = ({
  limit = 0,
  showFilters = true,
  title = 'Products From Our Vendors'
}: VendorListingProductsProps) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch vendor listing products
  useEffect(() => {
    const loadVendorProducts = async () => {
      try {
        setLoading(true);

        const response = await api.products.getVendorListings({
          page,
          limit: limit || 12,
          sort: sortValue
        });

        // Handle response data
        if (response && Array.isArray(response)) {
          // Check if we get an array directly
          setAllProducts(response);
          setFilteredProducts(response);
          setHasMore(response.length === (limit || 12));
        } else if (response && typeof response === 'object' && 'data' in response) {
          // Check if we get a response object with data and pagination
          const responseData = response as unknown as {
            data: Product[],
            pagination?: { totalPages: number, hasMore: boolean }
          };

          setAllProducts(responseData.data);
          setFilteredProducts(responseData.data);

          if (responseData.pagination) {
            setHasMore(responseData.pagination.hasMore);
            setTotalPages(responseData.pagination.totalPages);
          } else {
            setHasMore(responseData.data.length === (limit || 12));
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error loading vendor products:', err);
        setError('Failed to load vendor products. Please try again.');
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadVendorProducts();
  }, [page, limit, sortValue]);

  // Handle product filtering
  const handleFilterChange = (newFilteredProducts: Product[]) => {
    setFilteredProducts(sortProducts(newFilteredProducts, sortValue));
  };

  // Handle product sorting
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortValue = e.target.value;
    setSortValue(newSortValue);
  };

  // Sorting logic
  const sortProducts = (products: Product[], sort: string): Product[] => {
    const productsCopy = [...products];

    switch (sort) {
      case 'price-low':
        return productsCopy.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
      case 'price-high':
        return productsCopy.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
      case 'newest':
        return productsCopy.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'rating':
        return productsCopy.sort((a, b) => b.rating - a.rating);
      case 'popularity':
      default:
        return productsCopy.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  };

  // Load more products
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Apply limit if specified
  const displayedProducts = limit > 0 ? filteredProducts.slice(0, limit) : filteredProducts;

  if (loading && displayedProducts.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && displayedProducts.length === 0) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <span className="font-bold">Error:</span> {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 w-full md:mb-6">
          <h2 className="text-2xl font-medium">{title}</h2>
          <p className="text-gray-600 text-sm">{displayedProducts.length} products</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {showFilters && (
            <div className="w-full md:w-1/4">
              <ProductFilters products={allProducts} onFilterChange={handleFilterChange} />
            </div>
          )}

          <div className={`w-full ${showFilters ? 'md:w-3/4' : 'md:w-full'}`}>
            <div className="mb-4 flex justify-end">
              <div>
                <label htmlFor="sort" className="sr-only">Sort By</label>
                <select
                  id="sort"
                  value={sortValue}
                  onChange={handleSortChange}
                  className="input text-sm py-1 px-2 border border-gray-300 rounded"
                  aria-label="Sort products by"
                >
                  <option value="newest">Newest</option>
                  <option value="popularity">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map((product) => (
                <div key={product.id} className="product-card-wrapper">
                  <ProductCard product={product} />
                  {/* Action buttons outside the ProductCard component to avoid nesting Link elements */}
                  <div className="mt-2 flex justify-center space-x-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="bg-primary-red text-white px-4 py-2 rounded text-sm hover:bg-secondary-red transition w-full text-center"
                      aria-label={`View details for ${product.title}`}
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/product/configure/${product.id}`}
                      className="border border-primary-red text-primary-red px-4 py-2 rounded text-sm hover:bg-red-50 transition w-full text-center"
                      aria-label={`Configure ${product.title}`}
                    >
                      Configure
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination or Load More */}
            {!limit && hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-primary-red text-white rounded hover:bg-secondary-red transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}

            {/* No products message */}
            {displayedProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorListingProducts;
