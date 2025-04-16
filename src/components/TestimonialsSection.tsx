import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimationWrapper } from './AnimationProvider';

interface Testimonial {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  text: string;
  productName?: string;
  date: string;
  image?: string; // Optional customer or product image
  verifiedPurchase: boolean;
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  autoplay?: boolean;
  autoplayInterval?: number;
  maxTestimonials?: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    location: 'Denver, CO',
    rating: 5,
    text: 'These blinds completely transformed our living room! The measuring guide was incredibly helpful and the installation was straightforward. The cordless option is perfect for our home with small children.',
    productName: 'Premium Faux Wood Blinds',
    date: '03/15/2025',
    image: 'https://ext.same-assets.com/2035588304/2395952654.jpeg',
    verifiedPurchase: true
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    location: 'San Francisco, CA',
    rating: 5,
    text: 'I was hesitant to order blinds online, but the detailed measurement guide made it easy. The customer service team was also extremely helpful when I called with questions. The motorized blinds work perfectly with my smart home setup.',
    productName: 'Motorized Cellular Shades',
    date: '02/28/2025',
    image: 'https://ext.same-assets.com/2035588304/6217539800.jpeg',
    verifiedPurchase: true
  },
  {
    id: '3',
    customerName: 'Jennifer Martinez',
    location: 'Austin, TX',
    rating: 4,
    text: 'Great value for the price. The colors matched our decor perfectly, and the quality is excellent. Installation took a bit longer than expected, but the end result was worth it.',
    productName: 'Roman Shades',
    date: '03/10/2025',
    image: 'https://ext.same-assets.com/2035588304/7361594820.jpeg',
    verifiedPurchase: true
  },
  {
    id: '4',
    customerName: 'Robert Williams',
    location: 'Chicago, IL',
    rating: 5,
    text: 'The interactive measurement tool was a game-changer. I was able to visualize exactly what I needed, and the blinds fit perfectly. The energy savings are noticeable too - my utility bill has decreased since installation.',
    productName: 'Energy-Efficient Cellular Shades',
    date: '03/05/2025',
    image: 'https://ext.same-assets.com/2035588304/6217539800.jpeg',
    verifiedPurchase: true
  },
  {
    id: '5',
    customerName: 'Emily Thompson',
    location: 'Seattle, WA',
    rating: 5,
    text: 'These wood blinds add such a warm, natural feel to our home office. The product comparison tool helped me choose the perfect style. Excellent quality and craftsmanship.',
    productName: 'Premium Wood Blinds',
    date: '03/18/2025',
    image: 'https://ext.same-assets.com/2035588304/2395952654.jpeg',
    verifiedPurchase: true
  },
  {
    id: '6',
    customerName: 'David Rodriguez',
    location: 'Miami, FL',
    rating: 4,
    text: 'Perfect for my sliding glass doors. The vertical blinds are easy to operate and look great. The measurement guide ensured I got the exact size I needed.',
    productName: 'Vertical Blinds',
    date: '03/12/2025',
    image: 'https://ext.same-assets.com/2035588304/1672358429.jpeg',
    verifiedPurchase: true
  }
];

// Star Rating Component
const StarRating: React.FC<{ rating: number, max?: number }> = ({ rating, max = 5 }) => {
  return (
    <div className="flex">
      {Array.from({ length: max }).map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  return (
    <AnimationWrapper
      variant="fadeIn"
      transition="smooth"
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <StarRating rating={testimonial.rating} />
          <h3 className="font-bold text-lg mt-2">{testimonial.customerName}</h3>
          <p className="text-gray-600 text-sm">{testimonial.location}</p>
        </div>
        {testimonial.image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden">
            <img
              src={testimonial.image}
              alt={testimonial.productName || "Product image"}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="text-gray-700 italic mb-4 flex-grow">
        "{testimonial.text}"
      </div>

      <div className="mt-auto">
        {testimonial.productName && (
          <p className="text-sm font-medium text-gray-800 mb-1">
            Product: {testimonial.productName}
          </p>
        )}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{testimonial.date}</span>
          {testimonial.verifiedPurchase && (
            <span className="flex items-center text-green-600">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified Purchase
            </span>
          )}
        </div>
      </div>
    </AnimationWrapper>
  );
};

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  title = "What Our Customers Are Saying",
  subtitle = "Read honest reviews from customers who've transformed their windows with our blinds",
  testimonials = defaultTestimonials,
  autoplay = true,
  autoplayInterval = 5000,
  maxTestimonials = 3
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Calculate the total number of slides needed
  const totalSlides = Math.ceil(testimonials.length / maxTestimonials);

  // Handle autoplay
  useEffect(() => {
    if (!autoplay || isPaused || showAll) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, isPaused, totalSlides, autoplayInterval, showAll]);

  // Get current testimonials to display
  const getCurrentTestimonials = () => {
    if (showAll) return testimonials;

    const start = currentSlide * maxTestimonials;
    return testimonials.slice(start, start + maxTestimonials);
  };

  return (
    <section className="testimonials-section py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>

          {/* Average rating display */}
          <div className="mt-6 flex justify-center items-center">
            <div className="flex items-center mr-3">
              <StarRating rating={4.8} />
              <span className="ml-2 text-2xl font-bold text-gray-800">4.8</span>
            </div>
            <span className="text-gray-600">
              Average rating from {testimonials.length} reviews
            </span>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={showAll ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}>
            <AnimatePresence mode="wait">
              {showAll ? (
                // Grid view for all testimonials
                testimonials.map(testimonial => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </motion.div>
                ))
              ) : (
                // Carousel view for rotating testimonials
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {getCurrentTestimonials().map(testimonial => (
                    <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Carousel Navigation */}
          {!showAll && totalSlides > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-primary-red' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Toggle View Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {showAll ? "Show Less" : "View All Reviews"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
