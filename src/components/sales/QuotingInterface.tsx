import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SAMPLE_QUOTES, Quote, Customer, SAMPLE_CUSTOMERS } from '../../models/Customer';
import CustomerInfoForm from './quoting/CustomerInfoForm';
import ProductSelection from './quoting/ProductSelection';
import PricingCalculator from './quoting/PricingCalculator';
import SignatureCapture from './quoting/SignatureCapture';

interface QuotingInterfaceProps {
  isNew?: boolean;
}

const QuotingInterface: React.FC<QuotingInterfaceProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customer');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Initialize quote data
  useEffect(() => {
    // Simulate API data fetch
    setIsLoading(true);

    setTimeout(() => {
      setCustomers(SAMPLE_CUSTOMERS);

      if (isNew) {
        // Create a new empty quote
        const newQuote: Quote = {
          id: `q${Date.now()}`,
          customerId: '',
          customerName: '',
          date: new Date(),
          expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          status: 'draft',
          totalAmount: 0,
          salesRepId: 'sr123', // Would be current user ID in production
          salesRepName: 'Sarah Parker', // Would be current user name in production
          items: []
        };
        setQuote(newQuote);
      } else if (id) {
        // Load existing quote
        const foundQuote = SAMPLE_QUOTES.find(q => q.id === id);
        if (foundQuote) {
          setQuote(foundQuote);
          setSelectedCustomerId(foundQuote.customerId);
        } else {
          // Handle quote not found
          alert('Quote not found');
          navigate('/sales/quotes');
        }
      }

      setIsLoading(false);
    }, 500);
  }, [id, isNew, navigate]);

  const handleSaveQuote = async () => {
    setIsSaving(true);

    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would call an API to save the quote
    console.log('Saving quote...', quote);

    setIsSaving(false);

    // Navigate to the quotes list or stay on the page based on context
    if (isNew) {
      navigate(`/sales/quotes/${quote?.id}`);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const selectedCustomer = customers.find(c => c.id === customerId);

    if (selectedCustomer && quote) {
      setQuote({
        ...quote,
        customerId,
        customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
      });
    }
  };

  const handleProductsUpdate = (updatedItems: Quote['items']) => {
    if (quote) {
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

      setQuote({
        ...quote,
        items: updatedItems,
        totalAmount
      });
    }
  };

  const handleDiscountUpdate = (discountPercent: number) => {
    if (quote) {
      const discountAmount = (quote.totalAmount * discountPercent) / 100;

      setQuote({
        ...quote,
        discountPercent,
        discountAmount,
        totalAmount: quote.items.reduce((sum, item) => sum + item.totalPrice, 0) - discountAmount
      });
    }
  };

  const handleSignatureComplete = (signatures: Quote['signatures']) => {
    if (quote) {
      setQuote({
        ...quote,
        signatures,
        status: 'sent' // Update status when signatures are captured
      });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quote not found</h2>
        <Link
          to="/sales/quotes"
          className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700 transition-colors"
        >
          Return to Quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isNew ? 'Create New Quote' : `Quote #${quote.id}`}
        </h1>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            quote.status === 'draft' ? 'bg-gray-200 text-gray-800' :
            quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
            quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
            quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </span>
          <button
            onClick={handleSaveQuote}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Quote'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => handleTabChange('customer')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'customer'
                ? 'border-b-2 border-primary-red text-primary-red'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Customer Information
          </button>
          <button
            onClick={() => handleTabChange('products')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'products'
                ? 'border-b-2 border-primary-red text-primary-red'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            disabled={!selectedCustomerId}
          >
            Product Selection
          </button>
          <button
            onClick={() => handleTabChange('pricing')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'pricing'
                ? 'border-b-2 border-primary-red text-primary-red'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            disabled={!quote.items.length}
          >
            Pricing & Discounts
          </button>
          <button
            onClick={() => handleTabChange('signature')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'signature'
                ? 'border-b-2 border-primary-red text-primary-red'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            disabled={!quote.items.length}
          >
            Signature & Finalize
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'customer' && (
          <CustomerInfoForm
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onCustomerSelect={handleCustomerSelect}
            quote={quote}
            setQuote={setQuote}
          />
        )}

        {activeTab === 'products' && selectedCustomerId && (
          <ProductSelection
            quote={quote}
            onProductsUpdate={handleProductsUpdate}
          />
        )}

        {activeTab === 'pricing' && quote.items.length > 0 && (
          <PricingCalculator
            quote={quote}
            onDiscountUpdate={handleDiscountUpdate}
          />
        )}

        {activeTab === 'signature' && quote.items.length > 0 && (
          <SignatureCapture
            quote={quote}
            onSignatureComplete={handleSignatureComplete}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        {activeTab !== 'customer' ? (
          <button
            onClick={() => {
              if (activeTab === 'products') setActiveTab('customer');
              else if (activeTab === 'pricing') setActiveTab('products');
              else if (activeTab === 'signature') setActiveTab('pricing');
            }}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
        ) : (
          <div></div>
        )}

        {activeTab !== 'signature' ? (
          <button
            onClick={() => {
              if (activeTab === 'customer' && selectedCustomerId) setActiveTab('products');
              else if (activeTab === 'products' && quote.items.length > 0) setActiveTab('pricing');
              else if (activeTab === 'pricing') setActiveTab('signature');
            }}
            disabled={(activeTab === 'customer' && !selectedCustomerId) ||
                     (activeTab === 'products' && quote.items.length === 0)}
            className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSaveQuote}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Finalize Quote'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuotingInterface;
