import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Product } from '../models/Product';
import { fetchProductById, fetchProductPrice } from '../services/api';
import { addToCart } from '../services/cartService';

interface ProductDetailViewProps {
  product?: Product;
}

const ProductDetailView = ({ product: initialProduct }: ProductDetailViewProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [productLoading, setProductLoading] = useState<boolean>(!initialProduct);
  const [productError, setProductError] = useState<string | null>(null);

  // State for dimensions
  const [width, setWidth] = useState<number>(24);
  const [height, setHeight] = useState<number>(36);

  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // State for quantity
  const [quantity, setQuantity] = useState<number>(1);

  // State for calculated price
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch product if not provided as prop
  useEffect(() => {
    if (!initialProduct && id) {
      const loadProduct = async () => {
        try {
          setProductLoading(true);
          const fetchedProduct = await fetchProductById(id);
          setProduct(fetchedProduct);
          setProductError(null);
        } catch (error) {
          console.error('Error loading product:', error);
          setProductError('Failed to load product details. Please try again.');
          setProduct(null);
        } finally {
          setProductLoading(false);
        }
      };

      loadProduct();
    }
  }, [id, initialProduct]);

  // Populate initial selected options from product defaults
  useEffect(() => {
    if (product) {
      const options: Record<string, string> = {};
      product.options.forEach(option => {
        options[option.name] = option.selectedValue;
      });
      setSelectedOptions(options);
    }
  }, [product]);

  // Calculate price whenever dimensions or options change
  useEffect(() => {
    const calculatePrice = async () => {
      if (!product) return;

      setLoading(true);
      try {
        const priceData = await fetchProductPrice(
          product.id,
          width,
          height,
          selectedOptions
        );
        setPrice(priceData.price);
      } catch (error) {
        console.error('Error calculating price:', error);
      } finally {
        setLoading(false);
      }
    };

    calculatePrice();
  }, [product, width, height, selectedOptions]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity, width, height, selectedOptions);
    alert(`Added ${product.title} to your cart!`);
  };

  // Handle navigate to configurator
  const handleConfigureClick = () => {
    if (product) {
      navigate(`/product/configure/${product.id}`);
    }
  };

  // Select a product option
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [optionName]: value,
    });
  };

  // Generate stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="text-secondary-gold">★</span>);
      } else if (i - rating > 0 && i - rating < 1) {
        // Half star
        stars.push(<span key={i} className="text-secondary-gold">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  // Show loading state while fetching product
  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>

              <div className="h-10 bg-gray-200 rounded mb-6"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if product couldn't be loaded
  if (productError || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {productError || "Product not found"}
        </div>
        <Link to="/" className="text-primary-red hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-gray-600 hover:text-primary-red">Home</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to={`/category/${product.categoryId}`} className="text-gray-600 hover:text-primary-red">{product.category}</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-800">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-medium mb-2">{product.title}</h1>

          <div className="flex items-center mb-4">
            {renderStars(product.rating)}
            <span className="ml-2 text-gray-600">{product.reviewCount} reviews</span>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mb-6">
            <div className="text-lg mb-1">
              <span className="font-medium">Price: </span>
              {loading ? (
                <span className="animate-pulse inline-block w-24 h-7 bg-gray-200 rounded"></span>
              ) : (
                <span className="text-primary-red font-medium">${price.toFixed(2)}</span>
              )}
            </div>
            <p className="text-sm text-gray-500">Custom pricing based on your dimensions and options</p>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Dimensions</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="width" className="block text-sm text-gray-600 mb-1">Width (inches)</label>
                <input
                  type="number"
                  id="width"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                  min="10"
                  max="120"
                  step="0.125"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm text-gray-600 mb-1">Height (inches)</label>
                <input
                  type="number"
                  id="height"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  min="10"
                  max="120"
                  step="0.125"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Options Selection */}
          {product.options.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Options</h3>
              {product.options.map((option, index) => (
                <div key={index} className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">{option.name}</label>
                  <select
                    value={selectedOptions[option.name] || option.selectedValue}
                    onChange={(e) => handleOptionSelect(option.name, e.target.value)}
                    className="input"
                  >
                    {option.values.map((value, i) => (
                      <option key={i} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              min="1"
              className="input w-24"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-primary-red text-white py-3 px-6 rounded flex-grow md:flex-grow-0 hover:bg-secondary-red transition"
              disabled={loading}
            >
              Add to Cart
            </button>

            {/* Configure Now button */}
            <button
              onClick={handleConfigureClick}
              className="border border-primary-red text-primary-red py-3 px-6 rounded flex-grow md:flex-grow-0 hover:bg-red-50 transition"
            >
              Configure Now
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="border-t border-gray-200 pt-8 mb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Product Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            {product.features.map((feature, index) => (
              <li key={index} className="text-gray-700">{feature}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specs.map((spec, index) => (
              <div key={index} className="border-b border-gray-200 pb-2">
                <span className="font-medium">{spec.name}:</span> {spec.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
