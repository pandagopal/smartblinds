import React from 'react';
import { Link } from 'react-router-dom';

const HelpPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Help Center</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg text-primary-red mb-2">How do I measure my windows for blinds?</h3>
              <p className="text-gray-600">
                Measuring your windows correctly is crucial to ensure your blinds fit perfectly. We recommend using a metal tape measure for accuracy.
                For detailed instructions, please visit our <Link to="/measure-install" className="text-primary-red hover:underline">Measure & Install</Link> page.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg text-primary-red mb-2">What's the difference between inside and outside mount?</h3>
              <p className="text-gray-600">
                Inside mount blinds are installed within the window frame, creating a clean, built-in look.
                Outside mount blinds are installed on the wall above the window, which can make windows appear larger and provide better light blockage.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg text-primary-red mb-2">How long will it take to receive my order?</h3>
              <p className="text-gray-600">
                Since all our blinds and shades are custom-made to your specifications, production typically takes 7-10 business days.
                Shipping usually takes an additional 3-5 business days depending on your location.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg text-primary-red mb-2">What if my blinds don't fit?</h3>
              <p className="text-gray-600">
                We stand behind our products with our Perfect Fit Guarantee. If your blinds don't fit due to a measuring or manufacturing error,
                we'll remake them for free. Please contact our customer service team within 30 days of receiving your order.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg text-primary-red mb-2">Do you offer free samples?</h3>
              <p className="text-gray-600">
                Yes! We offer free samples of our fabrics, materials, and colors so you can see and feel the quality before making a purchase.
                You can request up to 10 free samples per order.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Customer Service</h2>
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-primary-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="text-gray-800 font-medium">Phone: (316) 530-2635</span>
            </div>
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-primary-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-gray-800 font-medium">Email: sales@smartblindshub.com</span>
            </div>
            <div className="text-gray-600">
              <p className="mb-2">Hours of Operation:</p>
              <p>Monday - Friday: 8:00 AM - 8:00 PM EST</p>
              <p>Saturday: 9:00 AM - 6:00 PM EST</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Live Chat Support</h2>
            <p className="text-gray-600 mb-4">
              Need immediate assistance? Our customer service representatives are available via live chat during our regular business hours.
            </p>
            <button className="bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors w-full">
              Start Live Chat
            </button>
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-2">Or Send Us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red h-24"></textarea>
                </div>
                <button type="submit" className="bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
