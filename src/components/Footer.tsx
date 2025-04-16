import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-red text-white" itemScope itemType="https://schema.org/WPFooter">
      <div className="border-b border-[#d41c39] py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0" itemScope itemType="https://schema.org/Organization">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3">
              <svg className="w-8 h-8 text-primary-red" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <div itemProp="contactPoint" itemScope itemType="https://schema.org/ContactPoint">
              <meta itemProp="contactType" content="customer service" />
              <div className="text-sm font-medium">Sales & Design Help</div>
              <a
                href="tel:+13165302635"
                className="text-lg font-bold hover:text-gray-200 transition-colors"
                itemProp="telephone"
                aria-label="Call our sales and design team at (316) 530-2635"
              >
                (316) 530-2635
              </a>
            </div>
          </div>

          <div className="flex space-x-6 md:space-x-12">
            <div itemProp="openingHoursSpecification" itemScope itemType="https://schema.org/OpeningHoursSpecification">
              <meta itemProp="dayOfWeek" content="http://schema.org/Monday http://schema.org/Tuesday http://schema.org/Wednesday http://schema.org/Thursday http://schema.org/Friday" />
              <meta itemProp="opens" content="08:00:00" />
              <meta itemProp="closes" content="23:00:00" />
              <h4 className="text-sm font-medium mb-1">Service</h4>
              <div className="text-xs">Mon - Fri: 8am to 11pm ET</div>
              <div className="text-xs">Sat: 9am to 8pm ET</div>
              <div className="text-xs">Sun: 11am to 6pm ET</div>
            </div>

            <div itemProp="openingHoursSpecification" itemScope itemType="https://schema.org/OpeningHoursSpecification">
              <meta itemProp="dayOfWeek" content="http://schema.org/Saturday" />
              <meta itemProp="opens" content="09:00:00" />
              <meta itemProp="closes" content="20:00:00" />
              <h4 className="text-sm font-medium mb-1">Installation</h4>
              <div className="text-xs">Mon - Fri: 8am to 6pm ET</div>
              <div className="text-xs">Sat: 9am to 5pm ET</div>
              <div className="text-xs">Sun: Closed</div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-4">
            <a
              href="https://www.facebook.com/smartblinds"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200"
              aria-label="Visit our Facebook page"
            >
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://www.pinterest.com/smartblinds"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200"
              aria-label="Visit our Pinterest page"
            >
              <span className="sr-only">Pinterest</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.33 1.781.744 2.281a.3.3 0 01.07.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S15.523 0 10 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://twitter.com/smartblinds"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200"
              aria-label="Visit our Twitter page"
            >
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743A11.65 11.65 0 013.392 4.6a4.106 4.106 0 001.27 5.477A4.073 4.073 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.093 4.093 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.615 11.615 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium text-lg mb-4">Help</h3>
              <ul className="space-y-2" role="list" aria-label="Help Resources">
                <li>
                  <Link to="/about" className="text-sm hover:underline">About Us</Link>
                </li>
                <li>
                  <Link to="/track-order" className="text-sm hover:underline">Track an Order</Link>
                </li>
                <li>
                  <Link to="/missing-parts" className="text-sm hover:underline">Missing Parts</Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm hover:underline">Contact Us</Link>
                </li>
                <li>
                  <Link to="/faq" className="text-sm hover:underline">FAQ</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Company</h3>
              <ul className="space-y-2" role="list" aria-label="Company Information">
                <li>
                  <Link to="/about" className="text-sm hover:underline">About Us</Link>
                </li>
                <li>
                  <Link to="/careers" className="text-sm hover:underline">Careers</Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm hover:underline">Blog</Link>
                </li>
                <li>
                  <Link to="/affiliates" className="text-sm hover:underline">Affiliates</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Resources</h3>
              <ul className="space-y-2" role="list" aria-label="Resource Links">
                <li>
                  <Link to="/how-to-measure" className="text-sm hover:underline">How to Measure</Link>
                </li>
                <li>
                  <Link to="/how-to-install" className="text-sm hover:underline">How to Install</Link>
                </li>
                <li>
                  <Link to="/videos" className="text-sm hover:underline">Videos</Link>
                </li>
                <li>
                  <Link to="/buying-guides" className="text-sm hover:underline">Buying Guides</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Products</h3>
              <ul className="space-y-2" role="list" aria-label="Product Categories">
                <li>
                  <Link to="/category/window-blinds" className="text-sm hover:underline">Window Blinds</Link>
                </li>
                <li>
                  <Link to="/category/window-shades" className="text-sm hover:underline">Window Shades</Link>
                </li>
                <li>
                  <Link to="/category/shutters" className="text-sm hover:underline">Shutters</Link>
                </li>
                <li>
                  <Link to="/category/curtains-drapes" className="text-sm hover:underline">Curtains & Drapes</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Structured data for LocalBusiness */}
      <div itemScope itemType="https://schema.org/HomeGoodsStore" style={{ display: 'none' }}>
        <span itemProp="name">SmartBlinds</span>
        <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
          <span itemProp="streetAddress">1234 Window Ave</span>
          <span itemProp="addressLocality">Chicago</span>
          <span itemProp="addressRegion">IL</span>
          <span itemProp="postalCode">60601</span>
          <span itemProp="addressCountry">USA</span>
        </div>
        <span itemProp="telephone">+1-316-530-2635</span>
        <span itemProp="priceRange">$$</span>
        <img itemProp="image" src="/logo.svg" alt="SmartBlinds Logo" />
        <span itemProp="url">https://smartblinds.com</span>
      </div>

      <div className="border-t border-[#d41c39] py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mb-4 md:mb-0">
            <Link to="/privacy-policy" className="text-xs text-gray-300 hover:underline">Privacy Policy</Link>
            <Link to="/do-not-sell" className="text-xs text-gray-300 hover:underline">Do Not Sell My Personal Information</Link>
            <Link to="/terms" className="text-xs text-gray-300 hover:underline">Terms & Conditions</Link>
            <Link to="/sitemap" className="text-xs text-gray-300 hover:underline">Site Map</Link>
          </div>

          <div className="text-xs text-gray-300 text-center md:text-right">
            © {currentYear} SMART BLINDS LLC. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
