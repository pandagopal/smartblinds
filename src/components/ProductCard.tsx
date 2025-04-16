import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Product } from '../models/Product';
import { isInWishlist, toggleWishlistItem } from '../services/wishlistService';

interface ProductCardProps {
  product: Product;
  showPricing?: boolean;
  onCompare?: (product: Product) => void;
  showRating?: boolean; // Added showRating prop
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showPricing = true,
  onCompare,
  showRating = true // Default value for showRating
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inWishlist, setInWishlist] = useState(false);

  // Check if product is in wishlist on mount and when the wishlist is updated
  useEffect(() => {
    const checkWishlist = () => {
      setInWishlist(isInWishlist(product.id));
    };

    // Initial check
    checkWishlist();

    // Listen for wishlist updates
    window.addEventListener('wishlistUpdated', checkWishlist);

    return () => {
      window.removeEventListener('wishlistUpdated', checkWishlist);
    };
  }, [product.id]);

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Get current compared products from URL if on comparison page
    const searchParams = new URLSearchParams(location.search);
    const currentProducts = searchParams.get('products')?.split(',') || [];

    // Check if this product is already being compared
    if (currentProducts.includes(product.id)) {
      alert('This product is already in your comparison.');
      return;
    }

    // Check if we've reached the maximum number of products to compare
    if (currentProducts.length >= 4) {
      alert('You can compare a maximum of 4 products at a time.');
      return;
    }

    // Add this product to comparison
    currentProducts.push(product.id);

    // Navigate to the comparison page with the updated products
    navigate({
      pathname: '/compare',
      search: `?products=${currentProducts.join(',')}`
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isAdded = toggleWishlistItem(product.id);
    setInWishlist(isAdded);
  };

  const navigateToProduct = () => {
    navigate(`/product/${product.id}`);
  };

  // Star rating component
  const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
    return (
      <div className="flex items-center">
        <div className="flex">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className={`w-4 h-4 ${
                index < Math.floor(rating)
                  ? 'text-yellow-400'
                  : index < Math.ceil(rating) && index > Math.floor(rating) - 1
                  ? 'text-yellow-400' // Half star (not implemented, using full for simplicity)
                  : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
      </div>
    );
  };

  // Format any discount to show percentage off
  const formatDiscount = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      const discountPercent = Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
      return `${discountPercent}% off`;
    }
    return null;
  };

  return (
    <div className="product-card bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow">
      {/* Product image */}
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        </Link>

        {/* Sale badge */}
        {formatDiscount() && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold py-1 px-2 rounded">
            SALE
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs text-gray-500">{product.category}</span>
        </div>

        <h3 className="font-medium text-sm mb-1 h-10 overflow-hidden">
          <Link to={`/product/${product.id}`} className="hover:text-primary-red">
            {product.title}
          </Link>
        </h3>

        {showRating && (
          <div className="mb-2">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
        )}
      </div>

      {/* Compare button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleCompare}
          className="w-full border border-gray-300 hover:border-primary-red text-gray-700 hover:text-primary-red py-1 px-3 rounded text-sm transition"
          aria-label={`Compare ${product.title} with other products`}
        >
          Compare
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
