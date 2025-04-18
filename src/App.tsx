import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import './App.css'
import ProductList from './components/ProductList'
import ProductDetailView from './components/ProductDetailView'
import ProductConfigurator from './components/ProductConfigurator'
import ProductConfiguratorWrapper from './components/ProductConfiguratorWrapper'
import MiniCart from './components/cart/MiniCart'
import CartPage from './components/cart/CartPage'
import EnhancedCheckoutPage from './components/EnhancedCheckoutPage'
import OrderConfirmationPage from './components/OrderConfirmationPage'
import { Category } from './models/Category'
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
import Header from './components/Header'
import AdminDashboard from './components/dashboards/AdminDashboard'
import VendorManagement from './components/admin/VendorManagement'
import VendorDetails from './components/admin/VendorDetails'
// Import vendor router for all vendor routes
import VendorRouter from './components/VendorRouter'
// Import vendor dashboard
import VendorDashboard from './components/dashboards/VendorDashboard'
// Import vendor listing products component
import VendorListingProducts from './components/VendorListingProducts'
// Import role testing utility
import { showRoleTestingPanel } from './utils/roleTestingUtil';
import Footer from './components/Footer';
import { Helmet } from 'react-helmet';
import BlogLandingPage from './components/blog/BlogLandingPage';
import SalesDashboard from './components/dashboards/SalesDashboard';
import InstallerDashboard from './components/dashboards/InstallerDashboard';
import DashboardRouter from './components/DashboardRouter';
import { api } from './services/api';
import { authService, UserRole } from './services/authService'; // Import UserRole from authService
// Import new auth-related components
import VerifyEmail from './components/auth/VerifyEmail';
import ChangePassword from './components/account/ChangePassword';
import SessionErrorBoundary from './components/SessionErrorBoundary';

// ProtectedRoute component to handle role-based access control
interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles: UserRole[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  allowedRoles,
  redirectPath = '/signin'
}) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const hasRequiredRole = user && allowedRoles.some(role => user.role === role);

  console.log('[ProtectedRoute] Auth check:', {
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    hasRequiredRole
  });

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (!hasRequiredRole) {
    // If user is logged in but doesn't have the right role, send them to appropriate dashboard
    if (user) {
      // Get the proper dashboard URL based on user role
      const dashboardUrl = authService.getDashboardUrl();
      return <Navigate to={dashboardUrl} replace />;
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <>{element}</>;
};

// New component for handling role-based dashboard redirects
const DashboardRedirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user from auth service
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();

    if (!user || !isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Redirect based on role
    if (authService.isAdmin()) {
      navigate('/admin');
    } else if (user.role === UserRole.VENDOR) {
      navigate('/vendor');
    } else if (user.role === UserRole.SALES_PERSON || user.role === 'sales') {
      navigate('/sales');
    } else if (user.role === UserRole.INSTALLER) {
      navigate('/installer');
    } else {
      // Default to customer dashboard
      navigate('/account');
    }

    setLoading(false);
  }, [navigate]);

  // Show loading spinner while redirecting
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return null;
};

const CategorySection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log("Fetching categories from database...");
        const categoriesData = await api.categories.getAll();
        console.log(`Fetched ${categoriesData.length} categories from database`);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please refresh the page to try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Add logging to debug the navigation
  const handleCategoryClick = (slug: string) => {
    console.log(`Navigating to category: ${slug}`);
    navigate(`/category/${slug}`);
  };

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-medium mb-8 text-center">Shop Our Most Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="text-center animate-pulse">
              <div className="rounded-lg h-28 mb-2 bg-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-medium mb-6 text-center">Shop Our Most Popular Categories</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-medium mb-6 text-center">Shop Our Most Popular Categories</h2>
        <p className="text-center text-gray-500">No categories available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-medium mb-8 text-center">Shop Our Most Popular Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="text-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleCategoryClick(category.slug)}
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

  useEffect(() => {
    // Initialize role testing panel in development
    if (process.env.NODE_ENV !== 'production') {
      showRoleTestingPanel();
    }

    const updateCartCount = () => {
      setCartItemCount(getCartItemCount())
    }

    window.addEventListener('storage', updateCartCount)

    const handleCartUpdate = () => {
      updateCartCount()
    }
    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  useEffect(() => {
    const updateWishlistCount = () => {
      setWishlistCount(getWishlistCount())
    }

    updateWishlistCount()

    window.addEventListener('wishlistUpdated', updateWishlistCount)
    window.addEventListener('storage', updateWishlistCount)

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistCount)
      window.removeEventListener('storage', updateWishlistCount)
    }
  }, [])

  useEffect(() => {
    // Always set up JWT auto-refresh if a valid session exists
    if (authService.isAuthenticated()) {
      authService.setupTokenRefresh();
    }
  }, []);

  return (
    <Router>
      <Helmet>
        <html lang="en" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#c41230" />
      </Helmet>
      <ScrollToTop />
      <SessionErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Header />

          <main className="flex-grow" id="main-content" role="main">
            <Routes>
              <Route path="/" element={
                <div className="container mx-auto px-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                    <div className="flex flex-col space-y-6">
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

                  <div className="text-center mb-12">
                    <h2 className="text-2xl font-medium mb-2">We are the Experts in Custom Blinds, Shades and Shutters</h2>
                    <p className="text-gray-600 max-w-3xl mx-auto">
                      We're 100% online so the showroom is in your pocket. Whether you're a DIY warrior or prefer to use our professional services, you can count on us to deliver high-quality blinds, shades, and shutters at an affordable price.
                    </p>
                  </div>

                  <div className="mb-12">
                    <h2 className="text-2xl font-medium mb-4 text-center">Save on Spring Styles</h2>
                    <p className="text-center mb-6 text-sm">Shop All Deals</p>

                    <ProductList limit={6} showFilters={false} />
                  </div>

                  {/* New section for Vendor Marketplace */}
                  <div className="mb-12">
                    <h2 className="text-2xl font-medium mb-4 text-center">Marketplace Highlights</h2>
                    <p className="text-center mb-6 text-sm">
                      Discover unique products from our verified vendors
                      <Link to="/marketplace" className="ml-2 text-primary-red hover:underline">
                        View All
                      </Link>
                    </p>

                    <VendorListingProducts limit={6} showFilters={false} />
                  </div>

                  <CategorySection />
                </div>
              } />

              <Route path="/products" element={
                <div className="container mx-auto px-4 py-6">
                  <h1 className="text-2xl font-semibold mb-6">All Products</h1>
                  <ProductList />
                </div>
              } />

              {/* Add new route for vendor marketplace */}
              <Route path="/marketplace" element={
                <div className="container mx-auto px-4 py-6">
                  <h1 className="text-2xl font-semibold mb-6">Vendor Marketplace</h1>
                  <VendorListingProducts />
                </div>
              } />

              <Route path="/product/configure/:id" element={<ProductConfiguratorWrapper />} />
              <Route path="/product/:id" element={<ProductDetailView />} />
              <Route path="/category/:slug" element={
                <div className="container mx-auto px-4 py-6">
                  {/* Update this to explicitly reference the slug for debugging */}
                  <ProductList key={window.location.pathname} showFilters={true} />
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

              {/* Authentication routes */}
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/login" element={<SignInPage />} />

              {/* New auth routes */}
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/reset-password/:token" element={<SignInPage />} />

              {/* User account routes */}
              <Route path="/account/*" element={<UserAccountPage />} />
              <Route
                path="/account/change-password"
                element={
                  <ProtectedRoute
                    element={<ChangePassword />}
                    allowedRoles={[UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR, UserRole.SALES_PERSON, UserRole.INSTALLER]}
                  />
                }
              />

              <Route path="/blog" element={<BlogLandingPage />} />
              <Route path="/blog/:postId" element={<BlogPostPage />} />
              <Route path="/compare" element={<ProductComparisonPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />

              {/* Role-based dashboard redirects */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Dashboard Router */}
              <Route path="/dashboard/*" element={<DashboardRouter />} />

              {/* Admin Dashboard and Management Routes */}
              <Route path="/admin/*" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={[UserRole.ADMIN]} />} />

              {/* Vendor Portal - Updated to use VendorRouter along with VendorDashboard */}
              <Route path="/vendor" element={<ProtectedRoute element={<VendorDashboard />} allowedRoles={[UserRole.VENDOR]} />} />
              <Route path="/vendor/*" element={<ProtectedRoute element={<VendorRouter />} allowedRoles={[UserRole.VENDOR]} />} />

              {/* Sales Person Dashboard */}
              <Route path="/sales/*" element={<ProtectedRoute element={<SalesDashboard />} allowedRoles={[UserRole.SALES_PERSON]} />} />

              {/* Installer Dashboard */}
              <Route path="/installer/*" element={<ProtectedRoute element={<InstallerDashboard />} allowedRoles={[UserRole.INSTALLER]} />} />

              <Route path="*" element={
                <div className="container mx-auto px-4 py-12 text-center">
                  <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
                  <p className="mb-6">The page you're looking for doesn't exist or has been moved.</p>
                  <Link to="/" className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700 transition-colors">
                    Return to Home
                  </Link>
                </div>
              } />
            </Routes>
          </main>

          <Footer />
        </div>
      </SessionErrorBoundary>
    </Router>
  )
}

export default App
