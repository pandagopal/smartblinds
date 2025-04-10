import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import ProductList from './components/ProductList'
import ProductDetailView from './components/ProductDetailView'
import ProductConfigurator from './components/ProductConfigurator'
import ProductConfiguratorWrapper from './components/ProductConfiguratorWrapper'
import MiniCart from './components/cart/MiniCart'
import CartPage from './components/cart/CartPage'
import EnhancedCheckoutPage from './components/EnhancedCheckoutPage'
import OrderConfirmationPage from './components/OrderConfirmationPage'
import { SAMPLE_CATEGORIES } from './models/Category'
import { SAMPLE_PRODUCTS } from './models/Product'
import HelpPage from './components/HelpPage'
import MeasureInstallPage from './components/MeasureInstallPage'
import OrderTrackingPage from './components/OrderTrackingPage'
import CreateEstimatePage from './components/CreateEstimatePage'
import SignInPage from './components/SignInPage'
import UserAccountPage from './components/UserAccountPage'
import BlogPage from './components/blog/BlogPage'
import BlogPostPage from './components/blog/BlogPostPage'
import { getCartItemCount } from './services/cartService'
import { getWishlistCount } from './services/wishlistService'
import WishlistPage from './components/WishlistPage'
import ProductComparisonPage from './components/ProductComparisonPage'
import ScrollToTop from './components/ScrollToTop'

// Create a CategorySection component that can use navigation hooks
const CategorySection = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-medium mb-8 text-center">Shop Our Most Popular Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {SAMPLE_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="text-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate(`/category/${category.slug}`)}
          >
            <div className="rounded-lg h-28 mb-2 flex items-center justify-center overflow-hidden">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-medium">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(getCartItemCount())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(getWishlistCount())

  // Update cart count when it changes
  useEffect(() => {
    const updateCartCount = () => {
      setCartItemCount(getCartItemCount())
    }

    // Listen for storage changes to update cart count
    window.addEventListener('storage', updateCartCount)

    // Create a custom event for cart updates
    const handleCartUpdate = () => {
      updateCartCount()
    }
    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  // Update wishlist count when it changes
  useEffect(() => {
    const updateWishlistCount = () => {
      setWishlistCount(getWishlistCount())
    }

    // Initial check
    updateWishlistCount()

    // Listen for wishlist updates
    window.addEventListener('wishlistUpdated', updateWishlistCount)
    window.addEventListener('storage', updateWishlistCount)

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistCount)
      window.removeEventListener('storage', updateWishlistCount)
    }
  }, [])

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        {/* Top bar - Special offer */}
        <div className="bg-[#c41230] text-white py-1 px-4 text-center text-sm">
          Call (425) 222-1088 to get discount 10% on initial order.
        </div>

        {/* Header */}
        <header>
          {/* Main header with logo and navigation */}
          <div className="flex items-center justify-between px-6 py-3 bg-white">
            <div className="flex items-center">
              <Link to="/" className="mr-6">
                <img src="/logo.svg" alt="Smart Blinds" className="h-8" />
              </Link>

              <div className="hidden md:flex space-x-6 text-sm">
                <Link to="/help" className="text-gray-600 hover:text-primary-red">Get Help</Link>
                <Link to="/measure-install" className="text-gray-600 hover:text-primary-red">Measure & Install</Link>
                <Link to="/order-tracking" className="text-gray-600 hover:text-primary-red">Order Tracking</Link>
                <Link to="/create-estimate" className="text-gray-600 hover:text-primary-red">Create an Estimate</Link>
                <Link to="/account" className="text-gray-600 hover:text-primary-red">My Account</Link>
                <Link to="/blog" className="text-gray-600 hover:text-primary-red">Blog</Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  className="flex items-center text-gray-800"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle mobile menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>

              {/* Wishlist button */}
              <div className="relative">
                <Link
                  to="/wishlist"
                  className="flex items-center text-gray-800 hover:text-primary-red"
                  aria-label="View your wishlist"
                >
                  <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Cart button */}
              <div className="relative">
                <button
                  id="cart-button"
                  className="flex items-center text-gray-800"
                  onClick={() => setCartOpen(!cartOpen)}
                  aria-expanded={cartOpen}
                  aria-controls="mini-cart"
                  aria-label="View your cart"
                >
                  <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-primary-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                </button>
                {cartOpen && <MiniCart onClose={() => setCartOpen(false)} />}
              </div>

              {/* Search button */}
              <div className="hidden md:block">
                <Link to="/" className="text-gray-800 hover:text-primary-red" aria-label="Search">
                  <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="bg-white border-b border-gray-200 py-2 md:hidden">
              <div className="container mx-auto px-4">
                <div className="flex flex-col space-y-3 py-3">
                  <Link to="/help" className="text-gray-600 hover:text-primary-red py-2" onClick={() => setMobileMenuOpen(false)}>Get Help</Link>
                  <Link to="/measure-install" className="text-gray-600 hover:text-primary-red py-2" onClick={() => setMobileMenuOpen(false)}>Measure & Install</Link>
                  <Link to="/order-tracking" className="text-gray-600 hover:text-primary-red py-2" onClick={() => setMobileMenuOpen(false)}>Order Tracking</Link>
                  <Link to="/create-estimate" className="text-gray-600 hover:text-primary-red py-2" onClick={() => setMobileMenuOpen(false)}>Create an Estimate</Link>
                  <Link to="/account" className="text-gray-600 hover:text-primary-red py-2" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
                  <Link to="/blog" className="text-gray-600 hover:text-primary-red py-2" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                  <Link to="/wishlist" className="text-gray-600 hover:text-primary-red py-2" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
                </div>
                <div className="border-t border-gray-200 pt-3 pb-2">
                  <div className="flex flex-wrap gap-3">
                    {SAMPLE_CATEGORIES.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="text-gray-800 hover:text-primary-red text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories nav */}
          <nav className="bg-gray-100 border-y border-gray-200 py-2">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center">
                <div className="flex space-x-6 overflow-x-auto">
                  {SAMPLE_CATEGORIES.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="text-gray-800 hover:text-primary-red whitespace-nowrap text-sm font-medium"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Link to="/measure-install" className="text-primary-red hover:text-red-800 text-sm font-medium">
                    How to Measure
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <div className="container mx-auto px-4 pt-6">
                {/* Hero Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Left Hero Banner - 2/3 width */}
                  <div className="md:col-span-2 bg-primary-red text-white p-8 rounded-lg">
                    <div className="max-w-lg">
                      <div className="bg-[#b31029] text-white inline-block px-2 py-1 rounded text-xs font-bold mb-3">
                        SUPER SPRING SAVINGS
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4">UP TO 40% OFF SITEWIDE</h2>
                      <button className="bg-white text-primary-red font-bold py-2 px-6 rounded hover:bg-gray-100 text-sm">
                        SHOP NOW
                      </button>
                      <p className="mt-3 text-sm">SALE ENDS 5/20</p>
                    </div>
                  </div>

                  {/* Right Column Features - 1/3 width */}
                  <div className="flex flex-col space-y-6">
                    {/* Pro Measure Feature */}
                    <div className="bg-primary-red text-white p-4 rounded-lg">
                      <div className="mb-2">
                        <h3 className="font-bold text-sm">PRO MEASURE BY EXPERTS</h3>
                        <p className="text-xs">Let the pros handle it</p>
                      </div>
                      <div className="flex mb-3">
                        <img
                          src="https://ext.same-assets.com/2035588304/1867392818.jpeg"
                          alt="Pro measuring service"
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                      <button className="w-full bg-white text-primary-red text-xs text-center py-1 px-2 rounded font-medium">
                        CHECK AVAILABILITY
                      </button>
                    </div>

                    {/* Special Buys Feature */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="font-bold text-primary-red text-sm mb-1">BIG SPRING SPECIAL BUYS</h3>
                      <div className="mb-3">
                        <img
                          src="https://ext.same-assets.com/2035588304/2395952654.jpeg"
                          alt="Special buys on blinds"
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                      <button className="w-full bg-primary-red text-white text-xs text-center py-1 px-2 rounded font-medium">
                        SHOP NOW
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Rather have a pro do it?</h3>
                    <p className="text-sm text-gray-600 mb-4">Let our professional measure and install team handle everything so that you don't have to</p>
                    <button className="border border-primary-red text-primary-red px-4 py-1 rounded text-sm hover:bg-red-50">
                      Check Availability
                    </button>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Buy Risk-Free</h3>
                    <p className="text-sm text-gray-600 mb-4">Get the perfect fit and our 100% satisfaction guarantee</p>
                    <button className="border border-primary-red text-primary-red px-4 py-1 rounded text-sm hover:bg-red-50">
                      Read Our Guarantee
                    </button>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Find your Inspiration</h3>
                    <p className="text-sm text-gray-600 mb-4">See real customer photos and shop the looks your local stores don't carry</p>
                    <button className="border border-primary-red text-primary-red px-4 py-1 rounded text-sm hover:bg-red-50">
                      Shop Our Gallery
                    </button>
                  </div>
                </div>

                {/* Expertise Banner */}
                <div className="text-center mb-12">
                  <h2 className="text-2xl font-medium mb-2">We are the Experts in Custom Blinds, Shades and Shutters</h2>
                  <p className="text-gray-600 max-w-3xl mx-auto">
                    We're 100% online so the showroom is in your pocket. Whether you're a DIY warrior or prefer to use our professional services, you can count on us to deliver high-quality blinds, shades, and shutters at an affordable price.
                  </p>
                </div>

                {/* Popular Products */}
                <div className="mb-12">
                  <h2 className="text-2xl font-medium mb-4 text-center">Save on Spring Styles</h2>
                  <p className="text-center mb-6 text-sm">Shop All Deals</p>

                  <ProductList limit={6} showFilters={false} />
                </div>

                {/* Categories Section */}
                <CategorySection />
              </div>
            } />

            {/* Product configurator route - updated to use the wrapper component */}
            <Route path="/product/configure/:id" element={<ProductConfiguratorWrapper />} />
            {/* Product detail route should come AFTER the more specific configurator route */}
            <Route path="/product/:id" element={<ProductDetailView />} />

            <Route path="/category/:slug" element={
              <div className="container mx-auto px-4 py-6">
                <ProductList />
              </div>
            } />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<EnhancedCheckoutPage />} />
            <Route path="/order-confirmation" element={
              <div className="container mx-auto px-4 py-8">
                <OrderConfirmationPage />
              </div>
            } />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/measure-install" element={<MeasureInstallPage />} />
            <Route path="/order-tracking" element={<OrderTrackingPage />} />
            <Route path="/create-estimate" element={<CreateEstimatePage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/account/*" element={<UserAccountPage />} />

            {/* Blog routes */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:postId" element={<BlogPostPage />} />
            {/* Add the route for product comparison */}
            <Route path="/compare" element={<ProductComparisonPage />} />
            {/* Add the route for wishlist */}
            <Route path="/wishlist" element={<WishlistPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-primary-red text-white">
          {/* Help Section */}
          <div className="border-b border-[#d41c39] py-4">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3">
                  <svg className="w-8 h-8 text-primary-red" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">Sales & Design Help</div>
                  <div className="text-lg font-bold">(425) 222-1088</div>
                </div>
              </div>

              <div className="flex space-x-6 md:space-x-12">
                <div>
                  <h4 className="text-sm font-medium mb-1">Service</h4>
                  <div className="text-xs">Mon - Fri: 8am to 11pm ET</div>
                  <div className="text-xs">Sat: 9am to 8pm ET</div>
                  <div className="text-xs">Sun: 11am to 6pm ET</div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Service</h4>
                  <div className="text-xs">Mon - Fri: 8am to 11pm ET</div>
                  <div className="text-xs">Sat: 9am to 8pm ET</div>
                  <div className="text-xs">Sun: 11am to 6pm ET</div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex space-x-4">
                <a href="#" className="text-white hover:text-gray-200">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-200">
                  <span className="sr-only">Pinterest</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.33 1.781.744 2.281a.3.3 0 01.07.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S15.523 0 10 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-200">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm5.245 8.07-6.373 3.267a.571.571 0 0 1-.816-.537V4.665c0-.41.458-.653.816-.452l6.373 3.08a.602.602 0 0 1 0 1.106z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-medium text-lg mb-4">Help</h3>
                  <ul className="space-y-2">
                    <li><Link to="#" className="text-sm hover:underline">About Us</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Track an Order</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Missing Parts</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Contact Us</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">FAQ</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-4">Company</h3>
                  <ul className="space-y-2">
                    <li><Link to="#" className="text-sm hover:underline">About Us</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Careers</Link></li>
                    <li><Link to="/blog" className="text-sm hover:underline">Blog</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Affiliates</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-4">Resources</h3>
                  <ul className="space-y-2">
                    <li><Link to="#" className="text-sm hover:underline">How to Measure</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">How to Install</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Videos</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Buying Guides</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-4">Products</h3>
                  <ul className="space-y-2">
                    <li><Link to="#" className="text-sm hover:underline">Window Blinds</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Window Shades</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Shutters</Link></li>
                    <li><Link to="#" className="text-sm hover:underline">Curtains & Drapes</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-[#d41c39] py-4">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mb-4 md:mb-0">
                <Link to="#" className="text-xs text-gray-300 hover:underline">Privacy Policy</Link>
                <Link to="#" className="text-xs text-gray-300 hover:underline">Do Not Sell My Personal Information</Link>
                <Link to="#" className="text-xs text-gray-300 hover:underline">Terms & Conditions</Link>
                <Link to="#" className="text-xs text-gray-300 hover:underline">Site Map</Link>
              </div>

              <div className="text-xs text-gray-300 text-center md:text-right">
                © {new Date().getFullYear()} SMART BLINDS LLC
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
