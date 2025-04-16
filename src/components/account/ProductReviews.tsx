import React, { useState, useEffect } from 'react';
import {
  getUserProductFeedback,
  submitProductFeedback,
  ProductFeedback
} from '../../services/supportService';

interface ProductReviewsProps {
  userId: string;
}

// Sample products for the demo
const SAMPLE_PRODUCTS = [
  { id: 'product-1', name: 'Deluxe Cellular Shades', image: 'https://ext.same-assets.com/2035588304/3063881347.jpeg' },
  { id: 'product-2', name: 'Premium Wood Blinds', image: 'https://ext.same-assets.com/2035588304/4222638957.jpeg' },
  { id: 'product-3', name: 'Blackout Roller Shades', image: 'https://ext.same-assets.com/2035588304/3481927610.jpeg' },
  { id: 'product-4', name: 'Faux Wood Blinds', image: '/images/faux-wood-blinds.jpg' },
  { id: 'product-5', name: 'Motorized Blinds', image: 'https://ext.same-assets.com/2035588304/1437928046.jpeg' },
];

const ProductReviews: React.FC<ProductReviewsProps> = ({ userId }) => {
  const [reviews, setReviews] = useState<ProductFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductFeedback | null>(null);

  // Form state
  const [reviewForm, setReviewForm] = useState({
    productId: '',
    rating: 5,
    title: '',
    text: '',
    pros: [''],
    cons: [''],
    verifiedPurchase: true
  });

  // Load reviews
  useEffect(() => {
    loadReviews();
  }, []);

  // Load all reviews from the service
  const loadReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserProductFeedback();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change for review form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: value
    });
  };

  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setReviewForm({
      ...reviewForm,
      rating
    });
  };

  // Handle pros/cons items
  const handleItemChange = (type: 'pros' | 'cons', index: number, value: string) => {
    const items = [...reviewForm[type]];
    items[index] = value;
    setReviewForm({
      ...reviewForm,
      [type]: items
    });
  };

  // Add new pros/cons item
  const addItem = (type: 'pros' | 'cons') => {
    setReviewForm({
      ...reviewForm,
      [type]: [...reviewForm[type], '']
    });
  };

  // Remove pros/cons item
  const removeItem = (type: 'pros' | 'cons', index: number) => {
    if (reviewForm[type].length <= 1) return;
    const items = [...reviewForm[type]];
    items.splice(index, 1);
    setReviewForm({
      ...reviewForm,
      [type]: items
    });
  };

  // Submit the review form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty pros/cons
    const filteredPros = reviewForm.pros.filter(item => item.trim() !== '');
    const filteredCons = reviewForm.cons.filter(item => item.trim() !== '');

    const reviewData = {
      ...reviewForm,
      pros: filteredPros,
      cons: filteredCons
    };

    setSubmitLoading(true);
    try {
      await submitProductFeedback(reviewData);
      // Reset form and refresh reviews
      setReviewForm({
        productId: '',
        rating: 5,
        title: '',
        text: '',
        pros: [''],
        cons: [''],
        verifiedPurchase: true
      });
      setShowReviewForm(false);
      setEditingReview(null);
      loadReviews();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
      console.error('Error submitting review:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper to get product name by ID
  const getProductNameById = (productId: string) => {
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Helper to get product image by ID
  const getProductImageById = (productId: string) => {
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    return product ? product.image : '';
  };

  // Render stars for ratings
  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => handleRatingChange(star) : undefined}
            className={interactive ? "focus:outline-none" : undefined}
          >
            <svg
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Edit a review
  const handleEditReview = (review: ProductFeedback) => {
    setEditingReview(review);
    setReviewForm({
      productId: review.productId,
      rating: review.rating,
      title: review.title || '',
      text: review.text || '',
      pros: review.pros?.length ? review.pros : [''],
      cons: review.cons?.length ? review.cons : [''],
      verifiedPurchase: review.verifiedPurchase
    });
    setShowReviewForm(true);
  };

  // Cancel review editing
  const handleCancelEdit = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewForm({
      productId: '',
      rating: 5,
      title: '',
      text: '',
      pros: [''],
      cons: [''],
      verifiedPurchase: true
    });
  };

  // Render loading state
  if (isLoading && !showReviewForm) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Reviews</h2>
        {!showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
          >
            Write a Review
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showReviewForm ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">
              {editingReview ? 'Edit Your Review' : 'Write a Product Review'}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmitReview}>
            {!editingReview && (
              <div className="mb-4">
                <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Product *
                </label>
                <select
                  id="productId"
                  name="productId"
                  value={reviewForm.productId}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                >
                  <option value="">Select a product</option>
                  {SAMPLE_PRODUCTS.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating *
              </label>
              <div className="flex items-center">
                {renderStars(reviewForm.rating, true)}
                <span className="ml-2 text-sm text-gray-500">
                  {reviewForm.rating} out of 5 stars
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Review Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={reviewForm.title}
                onChange={handleInputChange}
                placeholder="Summarize your review"
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Review *
              </label>
              <textarea
                id="text"
                name="text"
                value={reviewForm.text}
                onChange={handleInputChange}
                rows={4}
                placeholder="What did you like or dislike? How was the quality and installation experience?"
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pros
              </label>
              {reviewForm.pros.map((pro, index) => (
                <div key={`pro-${index}`} className="flex mb-2">
                  <input
                    type="text"
                    value={pro}
                    onChange={(e) => handleItemChange('pros', index, e.target.value)}
                    placeholder="Add a pro"
                    className="flex-grow rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  />
                  {index === reviewForm.pros.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => addItem('pros')}
                      className="ml-2 p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeItem('pros', index)}
                      className="ml-2 p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cons
              </label>
              {reviewForm.cons.map((con, index) => (
                <div key={`con-${index}`} className="flex mb-2">
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => handleItemChange('cons', index, e.target.value)}
                    placeholder="Add a con"
                    className="flex-grow rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  />
                  {index === reviewForm.cons.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => addItem('cons')}
                      className="ml-2 p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeItem('cons', index)}
                      className="ml-2 p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verifiedPurchase"
                  name="verifiedPurchase"
                  checked={reviewForm.verifiedPurchase}
                  onChange={(e) => setReviewForm({ ...reviewForm, verifiedPurchase: e.target.checked })}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
                />
                <label htmlFor="verifiedPurchase" className="ml-2 block text-sm text-gray-700">
                  This is a verified purchase
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
                disabled={submitLoading}
              >
                {submitLoading ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 mr-4">
                      <img
                        src={getProductImageById(review.productId)}
                        alt={getProductNameById(review.productId)}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{getProductNameById(review.productId)}</h4>
                          <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-500">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditReview(review)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>

                      {review.title && <h5 className="font-medium mt-2">{review.title}</h5>}
                      {review.text && <p className="text-sm mt-2">{review.text}</p>}

                      <div className="flex items-center text-xs text-gray-500 mt-3">
                        <span>{formatDate(review.createdAt)}</span>
                        {review.verifiedPurchase && (
                          <span className="ml-3 flex items-center text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      {(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0) ? (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {review.pros && review.pros.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-green-700 mb-1">Pros:</p>
                              <ul className="text-sm text-gray-600 list-disc ml-5">
                                {review.pros.map((pro, index) => (
                                  <li key={index}>{pro}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {review.cons && review.cons.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-1">Cons:</p>
                              <ul className="text-sm text-gray-600 list-disc ml-5">
                                {review.cons.map((con, index) => (
                                  <li key={index}>{con}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {review.helpfulVotes && review.helpfulVotes > 0 && (
                        <p className="text-xs text-gray-500 mt-3">
                          {review.helpfulVotes} {review.helpfulVotes === 1 ? 'person' : 'people'} found this review helpful
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
              <p className="mt-1 text-sm text-gray-500">Share your experience with our products.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  Write a Review
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
