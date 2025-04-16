import React, { useState, useRef, useEffect } from 'react';

interface AugmentedRealityViewProps {
  productImage?: string;
  blindColor?: string;
  blindOpacity?: string;
  blindWidth?: number;
  blindHeight?: number;
}

const AugmentedRealityView: React.FC<AugmentedRealityViewProps> = ({
  productImage,
  blindColor = 'white',
  blindOpacity = 'light-filtering',
  blindWidth = 36,
  blindHeight = 48
}) => {
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [placingBlind, setPlacingBlind] = useState<boolean>(false);
  const [blindPosition, setBlindPosition] = useState({ x: 50, y: 50, scale: 1, rotation: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Opacity effect levels
  const opacityLevels = {
    'blackout': 0.05,
    'room-darkening': 0.15,
    'light-filtering': 0.5,
    'sheer': 0.75
  };

  // Convert color name to rgba value
  const getColorRgba = (color: string, opacity: string) => {
    // Simple color mapping
    const colorMap: Record<string, string> = {
      'white': '255, 255, 255',
      'cream': '255, 253, 208',
      'beige': '245, 245, 220',
      'gray': '128, 128, 128',
      'tan': '210, 180, 140',
      'brown': '150, 75, 0',
      'black': '0, 0, 0',
      'blue': '0, 0, 255',
      'navy': '0, 0, 128',
      'red': '255, 0, 0'
    };

    const normalizedColor = color.toLowerCase();
    const rgb = colorMap[normalizedColor] || '255, 255, 255'; // Default to white
    const alpha = opacityLevels[opacity as keyof typeof opacityLevels] || 0.5;

    return `rgba(${rgb}, ${alpha})`;
  };

  // Initialize camera when needed
  useEffect(() => {
    if (mode === 'camera' && cameraActive) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          setCameraError(null);
        } catch (err) {
          console.error('Error accessing camera:', err);
          setCameraError('Unable to access camera. Please check permissions or try uploading a photo instead.');
        }
      };

      startCamera();

      // Cleanup camera on unmount
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          const tracks = stream.getTracks();

          tracks.forEach(track => {
            track.stop();
          });
        }
      };
    }
  }, [mode, cameraActive]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);

      // Reset blind position when uploading a new image
      setBlindPosition({ x: 50, y: 50, scale: 1, rotation: 0 });
    };

    reader.readAsDataURL(file);
  };

  // Handle screen capture from camera
  const handleCaptureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setUploadedImage(imageDataUrl);

      // Turn off camera after capture
      setCameraActive(false);

      // Reset blind position
      setBlindPosition({ x: 50, y: 50, scale: 1, rotation: 0 });
    }
  };

  // Mouse/touch event handlers for blind positioning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingBlind || !containerRef.current) return;

    e.preventDefault();
    const container = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - container.left) / container.width) * 100;
    const y = ((e.clientY - container.top) / container.height) * 100;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!placingBlind || !containerRef.current) return;

    const touch = e.touches[0];
    const container = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - container.left) / container.width) * 100;
    const y = ((touch.clientY - container.top) / container.height) * 100;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - container.left) / container.width) * 100;
    const y = ((e.clientY - container.top) / container.height) * 100;

    setBlindPosition(prev => ({
      ...prev,
      x: Math.min(Math.max(0, x), 100),
      y: Math.min(Math.max(0, y), 100)
    }));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const container = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - container.left) / container.width) * 100;
    const y = ((touch.clientY - container.top) / container.height) * 100;

    setBlindPosition(prev => ({
      ...prev,
      x: Math.min(Math.max(0, x), 100),
      y: Math.min(Math.max(0, y), 100)
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Update blind scale
  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlindPosition(prev => ({
      ...prev,
      scale: parseFloat(e.target.value)
    }));
  };

  // Update blind rotation
  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlindPosition(prev => ({
      ...prev,
      rotation: parseInt(e.target.value, 10)
    }));
  };

  // Generate blind element
  const renderBlind = () => {
    if (!uploadedImage && mode !== 'camera') return null;

    // Basic blind dimensions derived from width/height proportions
    const aspectRatio = blindHeight / blindWidth;
    const blindWidthPercentage = 30 * blindPosition.scale; // Base width percentage
    const blindHeightPercentage = blindWidthPercentage * aspectRatio;

    // Center the blind at the position point
    const leftPosition = blindPosition.x - (blindWidthPercentage / 2);
    const topPosition = blindPosition.y - (blindHeightPercentage / 2);

    // Get color and opacity styling
    const backgroundColor = getColorRgba(blindColor, blindOpacity);

    return (
      <div
        className="absolute pointer-events-none transition-all duration-200"
        style={{
          left: `${leftPosition}%`,
          top: `${topPosition}%`,
          width: `${blindWidthPercentage}%`,
          height: `${blindHeightPercentage}%`,
          backgroundColor,
          transform: `rotate(${blindPosition.rotation}deg)`,
          border: '1px solid rgba(0,0,0,0.2)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          zIndex: 10,
          borderRadius: '4px'
        }}
      >
        {/* Blind slats effect */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="absolute left-0 right-0 border-b border-t border-gray-300 bg-gradient-to-b from-transparent via-white to-transparent"
            style={{
              top: `${index * 12.5}%`,
              height: '4px',
              opacity: opacityLevels[blindOpacity as keyof typeof opacityLevels] > 0.3 ? 0.3 : 0.1
            }}
          ></div>
        ))}
      </div>
    );
  };

  // Render function with modes
  return (
    <div className="augmented-reality-view bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-indigo-50 p-4 border-b border-indigo-100">
        <h3 className="text-lg font-semibold text-indigo-800">Virtual Window Preview</h3>
        <p className="text-sm text-indigo-600">
          See how your blinds will look in your home
        </p>
      </div>

      <div className="p-4">
        {/* Mode selector */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              mode === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upload Photo
          </button>
          <button
            onClick={() => {
              setMode('camera');
              setCameraActive(true);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              mode === 'camera'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Use Camera
          </button>
        </div>

        {/* Upload mode */}
        {mode === 'upload' && (
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {!uploadedImage ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500">Click to upload a photo of your room</p>
                <p className="text-gray-400 text-xs mt-1">JPG, PNG or WEBP</p>
              </div>
            ) : (
              <div className="text-center mb-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Choose a different photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Camera mode */}
        {mode === 'camera' && (
          <div className="mb-4">
            {cameraError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-3">
                {cameraError}
              </div>
            ) : (
              <>
                {cameraActive ? (
                  <div className="mb-3 text-center">
                    <button
                      onClick={handleCaptureFromCamera}
                      className="py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      Capture Photo
                    </button>
                  </div>
                ) : uploadedImage && (
                  <div className="text-center mb-3">
                    <button
                      onClick={() => setCameraActive(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Take another photo
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Preview area */}
        <div
          ref={containerRef}
          className="relative rounded-lg overflow-hidden mb-4 bg-gray-100 h-64 md:h-80"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Video feed for camera mode */}
          {mode === 'camera' && cameraActive && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Uploaded or captured image */}
          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Your room"
              className="w-full h-full object-cover"
            />
          )}

          {/* Canvas (hidden) for screen capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Placeholder when no image */}
          {!uploadedImage && mode === 'upload' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400">Upload a photo to see your blinds</p>
            </div>
          )}

          {/* Blind overlay */}
          {(uploadedImage || (mode === 'camera' && cameraActive)) && placingBlind && renderBlind()}
        </div>

        {/* Controls */}
        {uploadedImage && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <button
                onClick={() => setPlacingBlind(!placingBlind)}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  placingBlind
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {placingBlind ? 'Done Placing Blind' : 'Place Blind on Photo'}
              </button>

              <button
                onClick={() => {
                  setUploadedImage(null);
                  setPlacingBlind(false);
                  setBlindPosition({ x: 50, y: 50, scale: 1, rotation: 0 });
                }}
                className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            {placingBlind && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={blindPosition.scale}
                    onChange={handleScaleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rotation</label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="1"
                    value={blindPosition.rotation}
                    onChange={handleRotationChange}
                    className="w-full"
                  />
                </div>

                <p className="mt-3 text-xs text-gray-600">
                  {isDragging ? 'Dragging...' : 'Drag to position the blind on your window'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>
            This is a visualization tool to help you see how your blinds might look.
            Actual appearance may vary slightly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AugmentedRealityView;
