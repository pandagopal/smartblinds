import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

interface ScreenshotGeneratorProps {
  targetRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
  productTitle: string;
  configDetails?: {
    width: number;
    height: number;
    color: string;
    slatSize: string;
    mountType: string;
    controlType: string;
  };
  onScreenshotTaken?: (screenshotUrl: string) => void;
}

const ScreenshotGenerator: React.FC<ScreenshotGeneratorProps> = ({
  targetRef,
  productTitle,
  configDetails,
  onScreenshotTaken
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [includeSpecs, setIncludeSpecs] = useState(true);
  const [includeBranding, setIncludeBranding] = useState(true);
  const [captureQuality, setCaptureQuality] = useState<'standard' | 'high'>('standard');
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Format the filename for download
  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    const sanitizedTitle = productTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    return `smartblinds-${sanitizedTitle}-${date}.png`;
  };

  // Generate screenshot
  const captureScreenshot = async () => {
    if (!targetRef.current) return;

    setIsCapturing(true);

    try {
      // Create a temporary wrapper if we need to include specs
      let elementToCapture = targetRef.current;
      let tempWrapper = null;

      if (includeSpecs && configDetails) {
        // Create a wrapper to include the configuration details
        tempWrapper = document.createElement('div');
        tempWrapper.style.backgroundColor = '#ffffff';
        tempWrapper.style.padding = '20px';
        tempWrapper.style.borderRadius = '8px';
        tempWrapper.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        tempWrapper.style.maxWidth = '600px';
        tempWrapper.style.margin = '0 auto';

        // Clone the target element
        const clone = targetRef.current.cloneNode(true) as HTMLElement;
        tempWrapper.appendChild(clone);

        // Add specifications panel
        const specsPanel = document.createElement('div');
        specsPanel.style.marginTop = '16px';
        specsPanel.style.padding = '12px';
        specsPanel.style.backgroundColor = '#f8f8f8';
        specsPanel.style.borderRadius = '6px';
        specsPanel.style.fontSize = '14px';

        const specsContent = `
          <h3 style="font-weight: 600; margin-bottom: 8px; font-size: 16px;">Configuration Details</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <strong>Dimensions:</strong> ${configDetails.width}″ × ${configDetails.height}″
            </div>
            <div>
              <strong>Color:</strong> ${configDetails.color}
            </div>
            <div>
              <strong>Slat Size:</strong> ${configDetails.slatSize.replace('inch', ' inch')}
            </div>
            <div>
              <strong>Mount Type:</strong> ${configDetails.mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'}
            </div>
            <div>
              <strong>Control Type:</strong> ${
                configDetails.controlType === 'standard' ? 'Standard Cord' :
                configDetails.controlType === 'cordless' ? 'Cordless' : 'Motorized'
              }
            </div>
            <div>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
          </div>
        `;
        specsPanel.innerHTML = specsContent;
        tempWrapper.appendChild(specsPanel);

        // Add branding if enabled
        if (includeBranding) {
          const brandingPanel = document.createElement('div');
          brandingPanel.style.marginTop = '16px';
          brandingPanel.style.display = 'flex';
          brandingPanel.style.alignItems = 'center';
          brandingPanel.style.justifyContent = 'space-between';

          brandingPanel.innerHTML = `
            <div style="font-weight: 600; color: #e53e3e;">SmartBlindsHub.com</div>
            <div style="font-size: 12px; color: #718096;">Generated from SmartBlindsHub Product Configurator</div>
          `;
          tempWrapper.appendChild(brandingPanel);
        }

        // Temporarily add to document to capture
        document.body.appendChild(tempWrapper);
        elementToCapture = tempWrapper;
      }

      // Capture the screenshot
      const canvas = await html2canvas(elementToCapture, {
        scale: captureQuality === 'high' ? 2 : 1,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      // Remove temporary wrapper if it was created
      if (tempWrapper) {
        document.body.removeChild(tempWrapper);
      }

      // Get data URL and set it
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshotUrl(dataUrl);

      // Trigger callback if provided
      if (onScreenshotTaken) {
        onScreenshotTaken(dataUrl);
      }

      // Automatically trigger download if link is available
      setTimeout(() => {
        if (downloadLinkRef.current) {
          downloadLinkRef.current.click();
        }
      }, 100);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Share screenshot options
  const shareScreenshot = (method: 'email' | 'whatsapp' | 'facebook' | 'twitter' | 'copy') => {
    if (!screenshotUrl) return;

    const productDescription = `Check out this ${productTitle} configuration from SmartBlindsHub`;

    switch (method) {
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(productDescription)}&body=${encodeURIComponent('Please see the attached image for my blind configuration.')}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${productDescription} - (Image should be attached manually)`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(productDescription)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
        break;
      case 'copy':
        // Create a temporary textarea to copy the screenshot URL
        const textarea = document.createElement('textarea');
        textarea.value = screenshotUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Screenshot URL copied to clipboard!');
        break;
    }
  };

  return (
    <div className="screenshot-generator">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-2 sm:mb-0">
          <h3 className="text-md font-medium">Capture Configuration Image</h3>
          <p className="text-sm text-gray-600">Save or share an image of your configured blinds</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>

          <button
            onClick={captureScreenshot}
            disabled={isCapturing}
            className={`px-3 py-1 text-sm bg-primary-red text-white rounded hover:bg-secondary-red flex items-center ${isCapturing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCapturing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Capture Screenshot
              </>
            )}
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeSpecs}
                  onChange={() => setIncludeSpecs(!includeSpecs)}
                  className="rounded border-gray-300 text-primary-red focus:ring-primary-red mr-2"
                />
                <span className="text-sm">Include specifications</span>
              </label>

              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={includeBranding}
                  onChange={() => setIncludeBranding(!includeBranding)}
                  className="rounded border-gray-300 text-primary-red focus:ring-primary-red mr-2"
                />
                <span className="text-sm">Include SmartBlindsHub branding</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Quality</label>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-sm rounded ${captureQuality === 'standard' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setCaptureQuality('standard')}
                >
                  Standard
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded ${captureQuality === 'high' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setCaptureQuality('high')}
                >
                  High Resolution
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">High resolution may take longer to generate</p>
            </div>
          </div>
        </div>
      )}

      {screenshotUrl && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2">Preview:</h4>
            <div className="flex justify-center bg-gray-50 p-2 rounded">
              <img
                src={screenshotUrl}
                alt="Configuration Screenshot"
                className="max-w-full max-h-64 object-contain"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => shareScreenshot('email')}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
              <button
                onClick={() => shareScreenshot('whatsapp')}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center"
              >
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                WhatsApp
              </button>
              <button
                onClick={() => shareScreenshot('facebook')}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center"
              >
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
                Facebook
              </button>
              <button
                onClick={() => shareScreenshot('twitter')}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center"
              >
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
                Twitter
              </button>
              <button
                onClick={() => shareScreenshot('copy')}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy URL
              </button>
            </div>

            <a
              ref={downloadLinkRef}
              href={screenshotUrl}
              download={getFileName()}
              className="px-3 py-1 text-sm bg-primary-red text-white rounded hover:bg-secondary-red flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGenerator;
