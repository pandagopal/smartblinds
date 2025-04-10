import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Product } from '../models/Product';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import { fetchProductsByCategory } from '../services/api';

interface ProductListProps {
  limit?: number;
  showFilters?: boolean;
  products?: Product[];
}

const ProductList = ({ limit = 0, showFilters = true, products: initialProducts }: ProductListProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialProducts);
  const [error, setError] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState<string>('popularity');

  // Fetch products if not provided as props
  useEffect(() => {
    if (!initialProducts) {
      const loadProducts = async () => {
        try {
          setLoading(true);
          const result = await fetchProductsByCategory(slug);
          setAllProducts(result);
          setFilteredProducts(result);
          setError(null);
        } catch (err) {
          console.error('Error loading products:', err);
          setError('Failed to load products. Please try again.');
          setAllProducts([]);
          setFilteredProducts([]);
        } finally {
          setLoading(false);
        }
      };

      loadProducts();
    } else {
      setAllProducts(initialProducts);
      setFilteredProducts(initialProducts);
    }
  }, [slug, initialProducts]);

  // Handle product filtering
  const handleFilterChange = (newFilteredProducts: Product[]) => {
    setFilteredProducts(sortProducts(newFilteredProducts, sortValue));
  };

  // Handle product sorting
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortValue = e.target.value;
    setSortValue(newSortValue);
    setFilteredProducts(sortProducts(filteredProducts, newSortValue));
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

  // Apply limit if specified
  const displayedProducts = limit > 0 ? filteredProducts.slice(0, limit) : filteredProducts;

  if (loading) {
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

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <span className="font-bold">Error:</span> {error}
      </div>
    );
  }

  if (displayedProducts.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria.</p>
        <Link to="/" className="text-primary-red hover:underline">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div>
      {showFilters && (
        <div className="mb-8">
          <div className="mb-4 w-full md:mb-6">
            <h2 className="text-2xl font-medium">{slug ? `${slug.charAt(0).toUpperCase() + slug.slice(1)}` : 'All Products'}</h2>
            <p className="text-gray-600 text-sm">{displayedProducts.length} products</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters */}
            <div className="w-full md:w-1/4">
              <ProductFilters products={allProducts} onFilterChange={handleFilterChange} />
            </div>

            {/* Product grid with sorting */}
            <div className="w-full md:w-3/4">
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
                    <option value="popularity">Most Popular</option>
                    <option value="newest">Newest</option>
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
            </div>
          </div>
        </div>
      )}

      {!showFilters && (
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
      )}
    </div>
  );
};

export default ProductList;
