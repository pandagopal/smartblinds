import React, { useState } from 'react';
import { Product } from '../../models/Product';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ConfigurationSharingProps {
  product: Product;
  selectedOptions: Record<string, string>;
  width: number;
  height: number;
  totalPrice: number;
  quantity: number;
}

const ConfigurationSharing: React.FC<ConfigurationSharingProps> = ({
  product,
  selectedOptions,
  width,
  height,
  totalPrice,
  quantity
}) => {
  const [isSharingOpen, setIsSharingOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [shareNote, setShareNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Generate URL with configuration parameters
  const generateShareableLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;

    // Encode configuration as URL parameters
    const params = new URLSearchParams();
    params.append('w', width.toString());
    params.append('h', height.toString());
    params.append('qty', quantity.toString());

    // Add selected options as parameters
    Object.entries(selectedOptions).forEach(([key, value]) => {
      params.append(`opt_${encodeURIComponent(key)}`, encodeURIComponent(value));
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // Share via email
  const handleEmailShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail) return;

    const shareableLink = generateShareableLink();
    const subject = `Check out this ${product.title} configuration`;
    const body = `
Hi there,

I've configured this ${product.title} and wanted to share it with you.

${shareNote ? `Note: ${shareNote}\n\n` : ''}

Product details:
- Size: ${width}" × ${height}"
- Color: ${selectedOptions['Color'] || 'Default'}
- Mount Type: ${selectedOptions['Mount Type'] || 'Default'}
${Object.entries(selectedOptions)
  .filter(([key]) => !['Color', 'Mount Type'].includes(key))
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Price: $${totalPrice.toFixed(2)}${quantity > 1 ? ` (Quantity: ${quantity})` : ''}

You can view and modify this configuration here:
${shareableLink}

`;

    const mailtoLink = `mailto:${selectedEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);

    // Reset form
    setSelectedEmail('');
    setShareNote('');
    setIsSharingOpen(false);
  };

  // Share via social media
  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'pinterest') => {
    const shareableLink = generateShareableLink();
    const text = `Check out this ${product.title} configuration I created!`;
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableLink)}&text=${encodeURIComponent(text)}`;
        break;
      case 'pinterest':
        url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareableLink)}&description=${encodeURIComponent(text)}&media=${encodeURIComponent(product.image)}`;
        break;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      setIsSaving(true);

      // Find the product preview element
      const previewElement = document.querySelector('.product-visualization');
      if (!previewElement) {
        alert('Could not find product preview to capture');
        setIsSaving(false);
        return;
      }

      // Use html2canvas to capture the preview
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });

      // Add title
      pdf.setFontSize(16);
      pdf.text(product.title, 20, 20);

      // Add product image
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 20, 30, 170, 100);

      // Add product details
      pdf.setFontSize(12);
      pdf.text('Product Configuration Details:', 20, 140);

      pdf.setFontSize(10);
      pdf.text(`Size: ${width}" × ${height}"`, 25, 150);
      pdf.text(`Color: ${selectedOptions['Color'] || 'Default'}`, 25, 155);
      pdf.text(`Mount Type: ${selectedOptions['Mount Type'] || 'Default'}`, 25, 160);

      // Add other options
      let lineY = 165;
      Object.entries(selectedOptions)
        .filter(([key]) => !['Color', 'Mount Type'].includes(key))
        .forEach(([key, value]) => {
          pdf.text(`${key}: ${value}`, 25, lineY);
          lineY += 5;
        });

      // Add price
      pdf.setFontSize(12);
      pdf.text(`Price: $${totalPrice.toFixed(2)}${quantity > 1 ? ` (Quantity: ${quantity})` : ''}`, 20, lineY + 10);

      // Add footer
      pdf.setFontSize(8);
      pdf.text(`Generated on ${new Date().toLocaleDateString()} from SmartBlinds.com`, 20, 280);

      // Save the PDF
      pdf.save(`${product.title.replace(/\s+/g, '-').toLowerCase()}-configuration.pdf`);

      setIsSaving(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again later.');
      setIsSaving(false);
    }
  };

  return (
    <div className="configuration-sharing mt-6">
      <div className="flex gap-3 items-center">
        <button
          onClick={() => setIsSharingOpen(!isSharingOpen)}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Share Configuration
        </button>

        <button
          onClick={exportToPDF}
          disabled={isSaving}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
          </svg>
          {isSaving ? 'Generating PDF...' : 'Save as PDF'}
        </button>
      </div>

      {isSharingOpen && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-base font-medium mb-3">Share Your Configuration</h3>

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Share via Email</h4>
            <form onSubmit={handleEmailShare} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter recipient's email address"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                required
              />
              <textarea
                placeholder="Add a personal note (optional)"
                value={shareNote}
                onChange={(e) => setShareNote(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                rows={2}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
              >
                Send Email
              </button>
            </form>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Share on Social Media</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleSocialShare('facebook')}
                className="bg-[#3b5998] text-white p-2 rounded hover:bg-[#2d4373]"
                aria-label="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.258 4.458c0-.144.02-.455.06-.931a.123.123 0 01.122-.111h1.393c.325 0 .605.233.661.556l.003.017c.102.73.102 1.364 0 1.897a.49.49 0 01-.48.389l-.208-.008H8.26v7.732c0 .072-.058.13-.126.13H6.26a.13.13 0 01-.133-.132V6.258h-.884a.124.124 0 01-.128-.123v-1.75c0-.08.066-.145.142-.145h.87V3.112c0-.617.098-1.128.294-1.532.194-.396.496-.727.908-.993.416-.269.947-.404 1.594-.404h1.354c.066 0 .12.054.12.12v.82c0 .066-.053.12-.114.12l-.772.002c-.354 0-.596.077-.726.23-.13.155-.196.415-.196.784v.75h1.376c.074 0 .135.059.139.133-.01.33-.021.677-.031 1.043-.012.367-.02.631-.025.792a.128.128 0 01-.128.126h-1.33v7.733a.13.13 0 01-.132.132H8.391a.13.13 0 01-.132-.132V6.258H7.26a.13.13 0 01-.132-.131v-1.67z" />
                </svg>
              </button>
              <button
                onClick={() => handleSocialShare('twitter')}
                className="bg-[#1da1f2] text-white p-2 rounded hover:bg-[#0c85d0]"
                aria-label="Share on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.615 11.615 0 006.29 1.84" />
                </svg>
              </button>
              <button
                onClick={() => handleSocialShare('pinterest')}
                className="bg-[#e60023] text-white p-2 rounded hover:bg-[#b3001b]"
                aria-label="Share on Pinterest"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 0C4.478 0 0 4.477 0 10c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.176-4.068-2.845 0-4.516 2.135-4.516 4.34 0 .858.33 1.78.744 2.28a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.522 0 10-4.477 10-10S15.522 0 10 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Shareable Link</h4>
            <div className="flex items-center">
              <input
                type="text"
                value={generateShareableLink()}
                readOnly
                className="flex-1 p-2 border rounded-l text-sm bg-gray-100"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateShareableLink());
                  alert('Link copied to clipboard!');
                }}
                className="bg-gray-200 text-gray-700 p-2 rounded-r border-t border-r border-b hover:bg-gray-300"
                aria-label="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationSharing;
