/**
 * Sample products data for backend use
 */

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    title: 'Cordless Faux Wood Blinds',
    description: 'Our cordless faux wood blinds offer a clean, modern look with improved safety for homes with children and pets. Made from durable PVC, they resist warping, fading, and cracking.',
    category: 'Faux Wood Blinds',
    categoryId: 1,
    price: 89.99,
    rating: 4.7,
    reviewCount: 324,
    colors: ['white', 'ivory', 'gray', 'espresso'],
    features: ['Cordless operation', 'Moisture resistant', 'Easy to clean', 'Child safe'],
    image: '/images/faux-wood-blinds.jpg',
    inStock: true,
    special: false,
    featured: true
  },
  {
    id: 2,
    title: 'Blackout Roller Shades',
    description: 'Our blackout roller shades block 100% of light for better sleep and privacy. Perfect for bedrooms, media rooms, and nurseries.',
    category: 'Roller Shades',
    categoryId: 2,
    price: 79.99,
    rating: 4.8,
    reviewCount: 256,
    colors: ['white', 'beige', 'gray', 'navy'],
    features: ['Total light blockage', 'Thermal insulation', 'Noise reduction', 'Smooth operation'],
    image: '/images/roller-shades.jpg',
    inStock: true,
    special: false,
    featured: true
  },
  {
    id: 3,
    title: 'Smart Motorized Blinds',
    description: 'Control your blinds with your smartphone or voice assistant. Schedule opening and closing times for energy efficiency and home security.',
    category: 'Smart Blinds',
    categoryId: 3,
    price: 199.99,
    rating: 4.5,
    reviewCount: 142,
    colors: ['white', 'silver', 'black'],
    features: ['App control', 'Voice control', 'Scheduling', 'Battery powered'],
    image: '/images/smart-blinds.jpg',
    inStock: true,
    special: true,
    featured: true
  }
];

module.exports = {
  SAMPLE_PRODUCTS
};
