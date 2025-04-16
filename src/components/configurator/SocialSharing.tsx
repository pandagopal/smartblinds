import React, { useState } from 'react';
import { Product } from '../../models/Product';

interface SocialSharingProps {
  product: Product;
  configurationName?: string;
  configOptions: Record<string, string>;
  dimensions: { width: number; height: number };
  onGenerateImageLink?: (imageUrl: string) => void;
}

const SocialSharing: React.FC<SocialSharingProps> = ({
  product,
  configurationName = 'My Custom Blinds',
  configOptions,
  dimensions,
  onGenerateImageLink
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Generate a shareable URL with configuration details
  const generateShareLink = () => {
    // Create a URL with configuration parameters
    const baseUrl = window.location.origin;
    const path = `/product/shared/${product.id}`;

    // Encode configuration parameters
    const params = new URLSearchParams();
    Object.entries(configOptions).forEach(([key, value]) => {
      params.append(key.toLowerCase().replace(/\s+/g, '_'), encodeURIComponent(value));
    });

    // Add dimensions
    params.append('width', dimensions.width.toString());
    params.append('height', dimensions.height.toString());

    // Add configuration name
    params.append('name', encodeURIComponent(configurationName));

    // Combine URL components
    const fullUrl = `${baseUrl}${path}?${params.toString()}`;
    setShareLink(fullUrl);
    return fullUrl;
  };

  // Handle open share modal
  const handleOpenShare = () => {
    const link = generateShareLink();
    setShareLink(link);
    setShowShareModal(true);
  };

  // Handle copy to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Generate a sharable image of the configuration
  const handleGenerateImage = () => {
    setGeneratingImage(true);

    // Simulate generating an image (in a real app, you'd use html2canvas or a backend service)
    setTimeout(() => {
      // For demo purposes, create a mock image URL
      const mockImageUrl = `https://ext.same-assets.com/2035588304/placeholder_${product.id}_image.jpg`;
      setImageUrl(mockImageUrl);

      if (onGenerateImageLink) {
        onGenerateImageLink(mockImageUrl);
      }

      setGeneratingImage(false);
    }, 1500);
  };

  // Share to social media platforms
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = `Check out my custom ${product.title} configuration from Smart Blinds!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToEmail = () => {
    const subject = `Check out my custom ${product.title} configuration`;
    const body = `I created a custom window treatment configuration on Smart Blinds that I wanted to share with you!\n\nView my configuration: ${shareLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareToWhatsApp = () => {
    const text = `Check out my custom ${product.title} configuration from Smart Blinds: ${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div>
      <button
        onClick={handleOpenShare}
        className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        Share Configuration
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setShowShareModal(false)}></div>

          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Your Configuration</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Share this link to your custom {product.title} configuration:</p>
              <div className="flex">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-r-md hover:bg-blue-700"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Share to social media:</p>
              <div className="flex space-x-4">
                <button onClick={shareToFacebook} className="p-2 text-blue-600 rounded-full hover:bg-blue-50" title="Share to Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </button>
                <button onClick={shareToTwitter} className="p-2 text-blue-400 rounded-full hover:bg-blue-50" title="Share to Twitter">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </button>
                <button onClick={shareToEmail} className="p-2 text-gray-600 rounded-full hover:bg-gray-100" title="Share via Email">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button onClick={shareToWhatsApp} className="p-2 text-green-500 rounded-full hover:bg-green-50" title="Share via WhatsApp">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </button>
                <button onClick={shareToLinkedIn} className="p-2 text-blue-700 rounded-full hover:bg-blue-50" title="Share to LinkedIn">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium mb-3">Generate image to share:</p>
              {!imageUrl ? (
                <button
                  onClick={handleGenerateImage}
                  disabled={generatingImage}
                  className="w-full py-2 px-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingImage ? 'Generating...' : 'Generate Shareable Image'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-md p-3 flex justify-center">
                    <img
                      src={imageUrl}
                      alt="Shareable configuration"
                      className="max-h-40 object-contain"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // In a real implementation, this would download the image
                        alert('Image download functionality would be implemented here');
                      }}
                      className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => {
                        setImageUrl('');
                      }}
                      className="py-2 px-3 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialSharing;
