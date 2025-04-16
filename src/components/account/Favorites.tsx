import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface FavoriteProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  dateAdded: Date;
}

interface FavoritesProps {
  userId: string;
}

const Favorites: React.FC<FavoritesProps> = ({ userId }) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  // Fetch favorites when component mounts
  useEffect(() => {
    // Simulate API request with delay
    const timer = setTimeout(() => {
      // In a real implementation, this would fetch from an API
      // fetchFavorites(userId).then(data => setFavorites(data));
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [userId]);

  // Toggle selection of a product for bulk actions
  const toggleSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  // Select all products
  const selectAll = () => {
    if (selectedProducts.size === favorites.length) {
      // If all are selected, deselect all
      setSelectedProducts(new Set());
    } else {
      // Otherwise select all
      setSelectedProducts(new Set(favorites.map(product => product.id)));
    }
  };

  // Remove selected products from favorites
  const removeSelected = () => {
    if (selectedProducts.size === 0) return;

    if (window.confirm(`Remove ${selectedProducts.size} item(s) from favorites?`)) {
      // In a real implementation, this would call an API
      // removeFavoritesById(Array.from(selectedProducts)).then(() => {
      setFavorites(favorites.filter(product => !selectedProducts.has(product.id)));
      setSelectedProducts(new Set());
      // });
    }
  };

  // Remove a single product from favorites
  const removeFavorite = (productId: string) => {
    if (window.confirm('Remove this item from favorites?')) {
      // In a real implementation, this would call an API
      // removeFavoriteById(productId).then(() => {
      setFavorites(favorites.filter(product => product.id !== productId));
      const newSelection = new Set(selectedProducts);
      if (newSelection.has(productId)) {
        newSelection.delete(productId);
        setSelectedProducts(newSelection);
      }
      // });
    }
  };

  // Add selected products to cart
  const addSelectedToCart = () => {
    if (selectedProducts.size === 0) return;

    // In a real implementation, this would call an API
    // addToCart(Array.from(selectedProducts)).then(() => {
    //   // Show success message
    // });
    alert(`${selectedProducts.size} item(s) added to cart!`);
  };

  // Render star ratings
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex">
        {Array(5).fill(0).map((_, index) => (
          <svg
            key={index}
            className={`w-4 h-4 ${
              index < fullStars
                ? 'text-yellow-400'
                : index === fullStars && hasHalfStar
                  ? 'text-yellow-400'
                  : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-500">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Favorites</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
            aria-label="Grid view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
            aria-label="List view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {favorites.length > 0 && (
        <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedProducts.size === favorites.length && favorites.length > 0}
              onChange={selectAll}
              className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {selectedProducts.size === 0
                ? 'Select All'
                : `Selected ${selectedProducts.size} of ${favorites.length}`}
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={addSelectedToCart}
              disabled={selectedProducts.size === 0}
              className={`px-4 py-2 rounded text-sm ${
                selectedProducts.size === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-red text-white hover:bg-red-700'
              }`}
            >
              Add to Cart
            </button>
            <button
              onClick={removeSelected}
              disabled={selectedProducts.size === 0}
              className={`px-4 py-2 rounded text-sm ${
                selectedProducts.size === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-lg text-gray-600 mb-4">You don't have any favorites yet.</p>
          <Link to="/" className="px-6 py-2 bg-primary-red text-white rounded-md inline-block hover:bg-red-700 transition">
            Start Shopping
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleSelection(product.id)}
                  className="absolute top-2 left-2 h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <button
                  onClick={() => removeFavorite(product.id)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <div className="mb-3">{renderStars(product.rating)} <span className="text-xs text-gray-500">{product.reviewCount} reviews</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                  <Link
                    to={`/product/configure/${product.id}`}
                    className="px-3 py-1 text-sm bg-primary-red text-white rounded hover:bg-red-700 transition"
                  >
                    Configure
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((product) => (
            <div key={product.id} className="flex border border-gray-200 rounded-lg overflow-hidden">
              <div className="relative w-32 md:w-48 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleSelection(product.id)}
                  className="absolute top-2 left-2 h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between">
                  <h3 className="font-medium text-lg">{product.title}</h3>
                  <button
                    onClick={() => removeFavorite(product.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <div className="mb-3">{renderStars(product.rating)} <span className="text-xs text-gray-500">{product.reviewCount} reviews</span></div>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                  <div className="space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition">
                      Add to Cart
                    </button>
                    <Link
                      to={`/product/configure/${product.id}`}
                      className="px-3 py-1 text-sm bg-primary-red text-white rounded hover:bg-red-700 transition"
                    >
                      Configure
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
