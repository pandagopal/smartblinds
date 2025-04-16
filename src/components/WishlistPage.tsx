import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../models/Product';
import { getWishlist, getWishlistProducts, clearWishlist, removeFromWishlist } from '../services/wishlistService';
import { SAMPLE_PRODUCTS } from '../models/Product';
import ProductCard from './ProductCard';

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadWishlist = () => {
      setLoading(true);
      // In a real app, we would fetch the products from an API
      // For this demo, we'll use our sample products
      const items = getWishlistProducts(SAMPLE_PRODUCTS);
      setWishlistItems(items);
      setLoading(false);
    };

    loadWishlist();

    // Listen for wishlist updates
    window.addEventListener('wishlistUpdated', loadWishlist);

    return () => {
      window.removeEventListener('wishlistUpdated', loadWishlist);
    };
  }, []);

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist();
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">My Wishlist</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">My Wishlist</h1>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Browse our products and add your favorites to your wishlist</p>
          <Link to="/" className="bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">My Wishlist</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleClearWishlist}
            className="text-gray-600 hover:text-primary-red flex items-center"
            aria-label="Clear wishlist"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Wishlist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map(product => (
          <div key={product.id} className="flex flex-col">
            <ProductCard product={product} />
            <div className="mt-2 flex justify-center space-x-2">
              <Link
                to={`/product/${product.id}`}
                className="bg-primary-red text-white px-4 py-2 rounded text-sm hover:bg-secondary-red transition w-full text-center"
                aria-label={`View details for ${product.title}`}
              >
                View Details
              </Link>
              <button
                onClick={() => handleRemoveItem(product.id)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:border-primary-red hover:text-primary-red transition w-full"
                aria-label={`Remove ${product.title} from wishlist`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-primary-red hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default WishlistPage;
