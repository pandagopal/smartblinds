import React, { useState, useRef, useEffect } from 'react';
import { Quote } from '../../../models/Customer';

interface SignatureCaptureProps {
  quote: Quote;
  onSignatureComplete: (signatures: Quote['signatures']) => void;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({ quote, onSignatureComplete }) => {
  const [activeSignature, setActiveSignature] = useState<'customer' | 'salesRep'>('customer');
  const [customerName, setCustomerName] = useState<string>(quote.signatures?.customer?.name || '');
  const [salesRepName, setSalesRepName] = useState<string>(quote.signatures?.salesRep?.name || quote.salesRepName || '');
  const [customerSignature, setCustomerSignature] = useState<string>(quote.signatures?.customer?.signature || '');
  const [salesRepSignature, setSalesRepSignature] = useState<string>(quote.signatures?.salesRep?.signature || '');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGenerateSignature, setShowGenerateSignature] = useState(false);
  const [generatedSignatureText, setGeneratedSignatureText] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 150 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Set up drawing style
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'black';
  }, [activeSignature]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Update canvas dimensions based on container size
      const container = canvas.parentElement;
      if (container) {
        const width = Math.min(container.clientWidth - 40, 400);
        setCanvasDimensions({ width, height: 150 });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    setIsDrawing(true);

    // Get coordinates
    let posX, posY;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      posX = e.touches[0].clientX - rect.left;
      posY = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      posX = e.nativeEvent.offsetX;
      posY = e.nativeEvent.offsetY;
    }

    context.beginPath();
    context.moveTo(posX, posY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Get coordinates
    let posX, posY;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      posX = e.touches[0].clientX - rect.left;
      posY = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      posX = e.nativeEvent.offsetX;
      posY = e.nativeEvent.offsetY;
    }

    context.lineTo(posX, posY);
    context.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.closePath();
    setIsDrawing(false);

    // Save the signature
    const signatureDataUrl = canvas.toDataURL('image/png');

    if (activeSignature === 'customer') {
      setCustomerSignature(signatureDataUrl);
    } else {
      setSalesRepSignature(signatureDataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Clear canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Reset signature
    if (activeSignature === 'customer') {
      setCustomerSignature('');
    } else {
      setSalesRepSignature('');
    }
  };

  const generateSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Clear canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text signature
    context.font = '40px "Satisfy", cursive';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(generatedSignatureText, canvas.width / 2, canvas.height / 2);

    // Save the signature
    const signatureDataUrl = canvas.toDataURL('image/png');

    if (activeSignature === 'customer') {
      setCustomerSignature(signatureDataUrl);
    } else {
      setSalesRepSignature(signatureDataUrl);
    }

    setShowGenerateSignature(false);
    setGeneratedSignatureText('');
  };

  const handleCompleteSignatures = () => {
    if (!customerSignature || !salesRepSignature) {
      alert('Both signatures are required to complete the quote');
      return;
    }

    const signatures = {
      customer: {
        name: customerName,
        signature: customerSignature,
        date: new Date()
      },
      salesRep: {
        name: salesRepName,
        signature: salesRepSignature,
        date: new Date()
      }
    };

    onSignatureComplete(signatures);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Quote Summary Section */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Quote Summary</h3>

        <div className="mb-4">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-600">Quote #:</span>
            <span className="text-sm text-gray-800">{quote.id}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-600">Customer:</span>
            <span className="text-sm text-gray-800">{quote.customerName}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-600">Quote Date:</span>
            <span className="text-sm text-gray-800">{quote.date.toLocaleDateString()}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-600">Expiry Date:</span>
            <span className="text-sm text-gray-800">{quote.expiryDate.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mb-4 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Products</h4>
          {quote.items.map((item) => (
            <div key={item.id} className="mb-2 pb-2 border-b border-gray-100 last:border-b-0">
              <div className="flex justify-between">
                <span className="text-sm text-gray-800">{item.productName}</span>
                <span className="text-sm font-medium">${item.totalPrice.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500">
                {item.width}" × {item.height}" - {item.color} - Qty: {item.quantity}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 border-t border-gray-200 pt-4">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-600">Subtotal:</span>
            <span className="text-sm text-gray-800">
              ${quote.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
            </span>
          </div>

          {quote.discountAmount && quote.discountAmount > 0 && (
            <div className="mb-2 flex justify-between text-green-700">
              <span className="text-sm font-medium">Discount:</span>
              <span className="text-sm">-${quote.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="font-medium mt-2 pt-2 border-t border-gray-100 flex justify-between">
            <span>Total:</span>
            <span>${quote.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          <p><strong>Terms & Conditions:</strong> {quote.terms || 'Standard terms and conditions apply. All sales are final once measurements are confirmed.'}</p>
          <p className="mt-2"><strong>Payment Terms:</strong> {quote.paymentTerms || '50% deposit required to confirm order. Balance due upon installation.'}</p>
        </div>
      </div>

      {/* Signature Capture Section */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Signatures</h3>

        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeSignature === 'customer'
                ? 'border-b-2 border-primary-red text-primary-red'
                : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveSignature('customer')}
            >
              Customer Signature
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeSignature === 'salesRep'
                ? 'border-b-2 border-primary-red text-primary-red'
                : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveSignature('salesRep')}
            >
              Sales Rep Signature
            </button>
          </div>
        </div>

        {/* Customer Signature Form */}
        {activeSignature === 'customer' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                placeholder="Enter full name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signature
              </label>

              {customerSignature ? (
                <div className="mb-2">
                  <div className="border border-gray-300 rounded p-2 bg-white">
                    <img src={customerSignature} alt="Customer Signature" className="max-w-full h-auto" />
                  </div>
                  <button
                    onClick={clearSignature}
                    className="mt-2 text-sm text-primary-red hover:text-red-700"
                  >
                    Clear Signature
                  </button>
                </div>
              ) : (
                <div>
                  <div className="border border-gray-300 rounded bg-white mb-2 p-2">
                    <canvas
                      ref={canvasRef}
                      width={canvasDimensions.width}
                      height={canvasDimensions.height}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                      onMouseLeave={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={endDrawing}
                      className="touch-none"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={clearSignature}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowGenerateSignature(true)}
                      className="text-sm text-primary-red hover:text-red-700"
                    >
                      Generate Signature
                    </button>
                  </div>

                  {showGenerateSignature && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={generatedSignatureText}
                        onChange={(e) => setGeneratedSignatureText(e.target.value)}
                        placeholder="Type name to generate signature"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red mb-2"
                      />
                      <button
                        onClick={generateSignature}
                        disabled={!generatedSignatureText}
                        className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sales Rep Signature Form */}
        {activeSignature === 'salesRep' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Representative Name
              </label>
              <input
                type="text"
                value={salesRepName}
                onChange={(e) => setSalesRepName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                placeholder="Enter full name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signature
              </label>

              {salesRepSignature ? (
                <div className="mb-2">
                  <div className="border border-gray-300 rounded p-2 bg-white">
                    <img src={salesRepSignature} alt="Sales Rep Signature" className="max-w-full h-auto" />
                  </div>
                  <button
                    onClick={clearSignature}
                    className="mt-2 text-sm text-primary-red hover:text-red-700"
                  >
                    Clear Signature
                  </button>
                </div>
              ) : (
                <div>
                  <div className="border border-gray-300 rounded bg-white mb-2 p-2">
                    <canvas
                      ref={canvasRef}
                      width={canvasDimensions.width}
                      height={canvasDimensions.height}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                      onMouseLeave={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={endDrawing}
                      className="touch-none"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={clearSignature}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowGenerateSignature(true)}
                      className="text-sm text-primary-red hover:text-red-700"
                    >
                      Generate Signature
                    </button>
                  </div>

                  {showGenerateSignature && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={generatedSignatureText}
                        onChange={(e) => setGeneratedSignatureText(e.target.value)}
                        placeholder="Type name to generate signature"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red mb-2"
                      />
                      <button
                        onClick={generateSignature}
                        disabled={!generatedSignatureText}
                        className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCompleteSignatures}
            disabled={!customerSignature || !salesRepSignature || !customerName || !salesRepName}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Complete Signatures
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          By signing, both parties acknowledge and agree to the terms and conditions of this quote.
        </div>
      </div>
    </div>
  );
};

export default SignatureCapture;
