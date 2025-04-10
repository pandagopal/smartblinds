import React, { useState } from 'react';
import { Product } from '../../models/Product';

interface SaveToPDFProps {
  product: Product;
  configurationName?: string;
  configOptions: Record<string, string>;
  dimensions: { width: number; height: number };
  price: number;
  quantity: number;
}

const SaveToPDF: React.FC<SaveToPDFProps> = ({
  product,
  configurationName = 'My Custom Blinds',
  configOptions,
  dimensions,
  price,
  quantity
}) => {
  const [generating, setGenerating] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeMeasurements, setIncludeMeasurements] = useState(true);
  const [includeInstructions, setIncludeInstructions] = useState(true);
  const [includePrice, setIncludePrice] = useState(true);
  const [includeImage, setIncludeImage] = useState(true);
  const [fileName, setFileName] = useState(`${product.title.replace(/\s+/g, '_')}_Configuration`);
  const [notes, setNotes] = useState('');

  // Format options as a readable string
  const formatOptions = (options: Record<string, string>): string => {
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  // Format dimensions as a readable string
  const formatDimensions = (dims: { width: number; height: number }): string => {
    return `${dims.width}" × ${dims.height}"`;
  };

  // Generate PDF
  const generatePDF = () => {
    setGenerating(true);

    // In a real implementation, you would use a library like jsPDF or a
    // server-side PDF generation service to create a PDF file
    setTimeout(() => {
      // For demo purposes, we'll just show an alert
      alert(`PDF would be generated with the following details:

Product: ${product.title}
Configuration Name: ${configurationName}
Dimensions: ${formatDimensions(dimensions)}
Options: ${formatOptions(configOptions)}
Price: $${price.toFixed(2)}
Quantity: ${quantity}
Total: $${(price * quantity).toFixed(2)}

Additional Notes: ${notes || 'None'}

Included Sections:
- Product Details: ${includeDetails ? 'Yes' : 'No'}
- Measurements: ${includeMeasurements ? 'Yes' : 'No'}
- Installation Instructions: ${includeInstructions ? 'Yes' : 'No'}
- Pricing Information: ${includePrice ? 'Yes' : 'No'}
- Product Image: ${includeImage ? 'Yes' : 'No'}

File Name: ${fileName}.pdf`);

      setGenerating(false);
      setShowCustomizeModal(false);
    }, 1500);
  };

  return (
    <div>
      <button
        onClick={() => setShowCustomizeModal(true)}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Save to PDF
      </button>

      {/* Customize PDF Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setShowCustomizeModal(false)}></div>

          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6 overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Save Configuration to PDF</h3>
              <button onClick={() => setShowCustomizeModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="mb-4">
                <label htmlFor="pdf-filename" className="block text-sm font-medium text-gray-700 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  id="pdf-filename"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="config-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Configuration Name
                </label>
                <input
                  type="text"
                  id="config-name"
                  value={configurationName}
                  readOnly
                  className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="pdf-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (optional)
                </label>
                <textarea
                  id="pdf-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Add any additional notes or reminders about this configuration..."
                ></textarea>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Include in PDF:</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include-details"
                    checked={includeDetails}
                    onChange={(e) => setIncludeDetails(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="include-details" className="ml-2 text-sm text-gray-700">
                    Product Details
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include-measurements"
                    checked={includeMeasurements}
                    onChange={(e) => setIncludeMeasurements(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="include-measurements" className="ml-2 text-sm text-gray-700">
                    Measurements
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include-instructions"
                    checked={includeInstructions}
                    onChange={(e) => setIncludeInstructions(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="include-instructions" className="ml-2 text-sm text-gray-700">
                    Installation Instructions
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include-price"
                    checked={includePrice}
                    onChange={(e) => setIncludePrice(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="include-price" className="ml-2 text-sm text-gray-700">
                    Pricing Information
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include-image"
                    checked={includeImage}
                    onChange={(e) => setIncludeImage(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="include-image" className="ml-2 text-sm text-gray-700">
                    Product Image
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium mb-2">PDF Preview</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><strong>Product:</strong> {product.title}</p>
                  <p><strong>Configuration:</strong> {configurationName}</p>
                  <p><strong>Dimensions:</strong> {formatDimensions(dimensions)}</p>
                  <p><strong>Options:</strong> {formatOptions(configOptions)}</p>
                  {includePrice && (
                    <>
                      <p><strong>Price:</strong> ${price.toFixed(2)}</p>
                      <p><strong>Quantity:</strong> {quantity}</p>
                      <p><strong>Total:</strong> ${(price * quantity).toFixed(2)}</p>
                    </>
                  )}
                  {notes && <p><strong>Notes:</strong> {notes}</p>}
                </div>
              </div>

              <button
                onClick={generatePDF}
                disabled={generating}
                className="w-full py-2 px-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating PDF...' : 'Generate & Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveToPDF;
