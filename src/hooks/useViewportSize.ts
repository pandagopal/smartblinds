import { useState, useEffect } from 'react';

interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useViewportSize(): ViewportSize {
  const [viewportSize, setViewportSize] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    // Function to update viewport size
    const updateViewportSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewportSize({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    // Initial call to set the viewport size
    updateViewportSize();

    // Add event listener for viewport resizing
    window.addEventListener('resize', updateViewportSize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateViewportSize);
    };
  }, []);

  return viewportSize;
}

export default useViewportSize;
