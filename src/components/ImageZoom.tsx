import React, { useState, useRef, useEffect } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  zoomScale?: number;
  className?: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({
  src,
  alt,
  zoomScale = 2.5,
  className = ''
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleMouseEnter = () => {
    if (imgLoaded) {
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate mouse position as a percentage within the container
    const x = (e.clientX - containerRect.left) / containerRect.width;
    const y = (e.clientY - containerRect.top) / containerRect.height;

    setPosition({ x, y });
  };

  // Calculate background position for zoom effect
  const getBackgroundPosition = () => {
    const x = position.x * 100;
    const y = position.y * 100;
    return `${x}% ${y}%`;
  };

  // Calculate transform origin for zoom effect
  const getTransformOrigin = () => {
    const x = position.x * 100;
    const y = position.y * 100;
    return `${x}% ${y}%`;
  };

  // Add keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZoomed]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-zoom-in ${isZoomed ? 'cursor-zoom-out' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={() => setIsZoomed(!isZoomed)}
      tabIndex={0}
      role="button"
      aria-label={isZoomed ? "Zoom out" : "Zoom in"}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsZoomed(!isZoomed);
        }
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-200"
        onLoad={() => setImgLoaded(true)}
        style={{ opacity: isZoomed ? 0 : 1 }}
      />

      {imgLoaded && (
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: `${zoomScale * 100}%`,
            backgroundPosition: getBackgroundPosition(),
            opacity: isZoomed ? 1 : 0,
            transition: 'opacity 0.2s ease',
            transformOrigin: getTransformOrigin(),
          }}
          aria-hidden="true"
        />
      )}

      {!imgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
        </div>
      )}

      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {isZoomed ? "Click to zoom out" : "Click to zoom in"}
      </div>
    </div>
  );
};

export default ImageZoom;
