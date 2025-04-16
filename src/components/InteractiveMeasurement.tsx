import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface InteractiveMeasurementProps {
  mountType: 'inside' | 'outside';
  onMeasurementsChange?: (measurements: MeasurementValues) => void;
}

export interface MeasurementValues {
  width: number;
  height: number;
  depth?: number;
  mountType: 'inside' | 'outside';
}

const InteractiveMeasurement: React.FC<InteractiveMeasurementProps> = ({ mountType, onMeasurementsChange }) => {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measurements in inches
  const [measurements, setMeasurements] = useState<MeasurementValues>({
    width: mountType === 'inside' ? 36 : 40,
    height: mountType === 'inside' ? 48 : 52,
    depth: mountType === 'inside' ? 4 : undefined,
    mountType
  });

  // Currently active measurement point
  const [activeMeasurement, setActiveMeasurement] = useState<'width-top' | 'width-middle' | 'width-bottom' | 'height-left' | 'height-middle' | 'height-right' | 'depth' | null>(null);

  // Window size in pixels (for display)
  const [windowSize, setWindowSize] = useState({
    width: 300,
    height: 400
  });

  // Handle drag events
  const handleDrag = (e: React.MouseEvent | React.TouchEvent, direction: 'horizontal' | 'vertical') => {
    if (!containerRef.current || !activeMeasurement) return;

    // Get container bounds
    const rect = containerRef.current.getBoundingClientRect();

    // Get mouse/touch position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Calculate relative position
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Set new measurements based on drag
    if (direction === 'horizontal' && activeMeasurement.startsWith('width')) {
      // Convert pixels to inches (assuming 1px = 0.1in for simplicity)
      const newWidth = Math.round(x / 6);
      setMeasurements(prev => ({
        ...prev,
        width: Math.max(24, Math.min(72, newWidth)) // Min 24in, Max 72in
      }));
    } else if (direction === 'vertical' && activeMeasurement.startsWith('height')) {
      // Convert pixels to inches
      const newHeight = Math.round(y / 6);
      setMeasurements(prev => ({
        ...prev,
        height: Math.max(24, Math.min(84, newHeight)) // Min 24in, Max 84in
      }));
    }
  };

  // Draw window on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const width = mountType === 'inside' ? measurements.width * 6 : (measurements.width + 8) * 6;
    const height = mountType === 'inside' ? measurements.height * 6 : (measurements.height + 8) * 6;

    canvas.width = width;
    canvas.height = height;
    setWindowSize({ width, height });

    // Draw window frame
    ctx.fillStyle = '#f0f0f0'; // Light gray for wall
    ctx.fillRect(0, 0, width, height);

    if (mountType === 'inside') {
      // Inside mount - draw window frame
      ctx.strokeStyle = '#8B4513'; // Brown for window frame
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, width, height);

      // Draw window glass
      ctx.fillStyle = '#d6eaf8'; // Light blue for glass
      ctx.fillRect(10, 10, width - 20, height - 20);
    } else {
      // Outside mount - draw window frame
      const frameWidth = (measurements.width - 8) * 6;
      const frameHeight = (measurements.height - 8) * 6;
      const frameX = (width - frameWidth) / 2;
      const frameY = (height - frameHeight) / 2;

      // Use frameX and frameY when drawing
      ctx.strokeStyle = '#8B4513'; // Brown for window frame
      ctx.lineWidth = 10;
      ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

      // Draw window glass
      ctx.fillStyle = '#d6eaf8'; // Light blue for glass
      ctx.fillRect(frameX + 10, frameY + 10, frameWidth - 20, frameHeight - 20);

      // Draw blind outline
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, width - 10, height - 10);

      // Draw pattern for blind
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(5, 5, width - 10, height - 10);

      // Draw slats
      const slats = 15;
      const slat_space = (height - 30) / slats;

      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      for (let i = 0; i < slats; i++) {
        const y = 15 + i * slat_space;
        ctx.beginPath();
        ctx.moveTo(5, y);
        ctx.lineTo(width - 5, y);
        ctx.stroke();
      }
    }

    // Draw measurement lines
    ctx.strokeStyle = '#E53E3E'; // Red for measurement lines
    ctx.lineWidth = 2;

    // Width measurements
    if (mountType === 'inside') {
      // Top width
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(width, 20);
      ctx.stroke();

      // Middle width
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Bottom width
      ctx.beginPath();
      ctx.moveTo(0, height - 20);
      ctx.lineTo(width, height - 20);
      ctx.stroke();

      // Left height
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(20, height);
      ctx.stroke();

      // Middle height
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Right height
      ctx.beginPath();
      ctx.moveTo(width - 20, 0);
      ctx.lineTo(width - 20, height);
      ctx.stroke();
    } else {
      // Draw outside mount measurements
      // Width measurement (full blind width)
      ctx.beginPath();
      ctx.moveTo(5, 25);
      ctx.lineTo(width - 5, 25);
      ctx.stroke();

      // Draw arrows on ends
      ctx.beginPath();
      ctx.moveTo(5, 20);
      ctx.lineTo(5, 30);
      ctx.moveTo(width - 5, 20);
      ctx.lineTo(width - 5, 30);
      ctx.stroke();

      // Height measurement (full blind height)
      ctx.beginPath();
      ctx.moveTo(25, 5);
      ctx.lineTo(25, height - 5);
      ctx.stroke();

      // Draw arrows on ends
      ctx.beginPath();
      ctx.moveTo(20, 5);
      ctx.lineTo(30, 5);
      ctx.moveTo(20, height - 5);
      ctx.lineTo(30, height - 5);
      ctx.stroke();
    }

    // Notify parent of measurement changes
    if (onMeasurementsChange) {
      onMeasurementsChange(measurements);
    }
  }, [measurements, mountType, onMeasurementsChange]);

  return (
    <div className="interactive-measurement">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Interactive {mountType.charAt(0).toUpperCase() + mountType.slice(1)} Mount Measurements</h3>
        <p className="text-sm text-gray-600 mb-3">
          {mountType === 'inside'
            ? 'Drag the measurement lines to adjust your inside mount measurements. These should be the exact window opening dimensions.'
            : 'Drag the measurement lines to adjust your outside mount measurements. These should include the desired overlap on all sides.'
          }
        </p>

        <div className="flex space-x-8 mb-4">
          <div>
            <span className="font-medium">Width:</span>
            <input
              type="number"
              min="24"
              max="72"
              value={measurements.width}
              onChange={(e) => setMeasurements({...measurements, width: Math.max(24, Math.min(72, parseInt(e.target.value) || 24))})}
              className="ml-2 w-16 border border-gray-300 rounded px-2 py-1"
            /> inches
          </div>
          <div>
            <span className="font-medium">Height:</span>
            <input
              type="number"
              min="24"
              max="84"
              value={measurements.height}
              onChange={(e) => setMeasurements({...measurements, height: Math.max(24, Math.min(84, parseInt(e.target.value) || 24))})}
              className="ml-2 w-16 border border-gray-300 rounded px-2 py-1"
            /> inches
          </div>
          {mountType === 'inside' && (
            <div>
              <span className="font-medium">Depth:</span>
              <input
                type="number"
                min="1"
                max="12"
                value={measurements.depth || 4}
                onChange={(e) => setMeasurements({...measurements, depth: Math.max(1, Math.min(12, parseInt(e.target.value) || 4))})}
                className="ml-2 w-16 border border-gray-300 rounded px-2 py-1"
              /> inches
            </div>
          )}
        </div>
      </div>

      <div className="measurement-visualization" ref={containerRef}>
        <div
          className="relative mx-auto bg-gray-100 border border-gray-300 rounded-lg p-4"
          style={{ width: `${windowSize.width + 80}px`, height: `${windowSize.height + 80}px` }}
        >
          <div className="absolute inset-10 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-400 shadow-md"
              style={{ width: `${windowSize.width}px`, height: `${windowSize.height}px` }}
            />

            {/* Interactive measurement handles */}
            {mountType === 'inside' ? (
              <>
                {/* Width handles */}
                <motion.div
                  className="absolute top-5 left-0 right-0 h-6 cursor-ew-resize flex items-center justify-center"
                  onMouseDown={() => setActiveMeasurement('width-top')}
                  onMouseUp={() => setActiveMeasurement(null)}
                  onMouseMove={(e) => activeMeasurement === 'width-top' && handleDrag(e, 'horizontal')}
                  onTouchStart={() => setActiveMeasurement('width-top')}
                  onTouchEnd={() => setActiveMeasurement(null)}
                  onTouchMove={(e) => activeMeasurement === 'width-top' && handleDrag(e, 'horizontal')}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-red-500 text-white text-xs rounded px-1 py-0.5">
                    {measurements.width}″
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-6 cursor-ew-resize flex items-center justify-center"
                  onMouseDown={() => setActiveMeasurement('width-middle')}
                  onMouseUp={() => setActiveMeasurement(null)}
                  onMouseMove={(e) => activeMeasurement === 'width-middle' && handleDrag(e, 'horizontal')}
                  onTouchStart={() => setActiveMeasurement('width-middle')}
                  onTouchEnd={() => setActiveMeasurement(null)}
                  onTouchMove={(e) => activeMeasurement === 'width-middle' && handleDrag(e, 'horizontal')}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-red-500 text-white text-xs rounded px-1 py-0.5">
                    {measurements.width}″
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-5 left-0 right-0 h-6 cursor-ew-resize flex items-center justify-center"
                  onMouseDown={() => setActiveMeasurement('width-bottom')}
                  onMouseUp={() => setActiveMeasurement(null)}
                  onMouseMove={(e) => activeMeasurement === 'width-bottom' && handleDrag(e, 'horizontal')}
                  onTouchStart={() => setActiveMeasurement('width-bottom')}
                  onTouchEnd={() => setActiveMeasurement(null)}
                  onTouchMove={(e) => activeMeasurement === 'width-bottom' && handleDrag(e, 'horizontal')}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-red-500 text-white text-xs rounded px-1 py-0.5">
                    {measurements.width}″
                  </div>
                </motion.div>

                {/* Height handles */}
                <motion.div
                  className="absolute left-5 top-0 bottom-0 w-6 cursor-ns-resize flex items-center justify-center"
                  onMouseDown={() => setActiveMeasurement('height-left')}
                  onMouseUp={() => setActiveMeasurement(null)}
                  onMouseMove={(e) => activeMeasurement === 'height-left' && handleDrag(e, 'vertical')}
                  onTouchStart={() => setActiveMeasurement('height-left')}
                  onTouchEnd={() => setActiveMeasurement(null)}
                  onTouchMove={(e) => activeMeasurement === 'height-left' && handleDrag(e, 'vertical')}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-red-500 text-white text-xs rounded px-1 py-0.5 transform -rotate-90">
                    {measurements.height}″
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-6 cursor-ns-resize flex items-center justify-center"
                  onMouseDown={() => setActiveMeasurement('height-middle')}
                  onMouseUp={() => setActiveMeasurement(null)}
                  onMouseMove={(e) => activeMeasurement === 'height-middle' && handleDrag(e, 'vertical')}
                  onTouchStart={() => setActiveMeasurement('height-middle')}
                  onTouchEnd={() => setActiveMeasurement(null)}
                  onTouchMove={(e) => activeMeasurement === 'height-middle' && handleDrag(e, 'vertical')}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-red-500 text-white text-xs rounded px-1 py-0.5 transform -rotate-90">
                    {measurements.height}″
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-5 top-0 bottom-0 w-6 cursor-ns-resize flex items-center justify-center"
                  onMouseDown={() => setActiveMeasurement('height-right')}
                  onMouseUp={() => setActiveMeasurement(null)}
                  onMouseMove={(e) => activeMeasurement === 'height-right' && handleDrag(e, 'vertical')}
                  onTouchStart={() => setActiveMeasurement('height-right')}
                  onTouchEnd={() => setActiveMeasurement(null)}
                  onTouchMove={(e) => activeMeasurement === 'height-right' && handleDrag(e, 'vertical')}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-red-500 text-white text-xs rounded px-1 py-0.5 transform -rotate-90">
                    {measurements.height}″
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                {/* Outside mount width handle */}
                <motion.div
                  className="absolute top-10 left-0 right-0 h-6 cursor-ew-resize flex items-center justify-center"
                  onMouseDown={() => setActiveMeasurement('width-top')}
                  onMouseUp={() => setActiveMeasurement(null)}
                  onMouseMove={(e) => activeMeasurement === 'width-top' && handleDrag(e, 'horizontal')}
                  onTouchStart={() => setActiveMeasurement('width-top')}
                  onTouchEnd={() => setActiveMeasurement(null)}
                  onTouchMove={(e) => activeMeasurement === 'width-top' && handleDrag(e, 'horizontal')}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-red-500 text-white text-xs rounded px-1 py-0.5">
                    {measurements.width}″
                  </div>
                </motion.div>

                {/* Outside mount height handle */}
                <motion.div
                  className="absolute left-10 top-0 bottom-0 w-6 cursor-ns-resize flex items-center justify-center"
                  onMouseDown={() => setActiveMeasurement('height-left')}
                  onMouseUp={() => setActiveMeasurement(null)}
                  onMouseMove={(e) => activeMeasurement === 'height-left' && handleDrag(e, 'vertical')}
                  onTouchStart={() => setActiveMeasurement('height-left')}
                  onTouchEnd={() => setActiveMeasurement(null)}
                  onTouchMove={(e) => activeMeasurement === 'height-left' && handleDrag(e, 'vertical')}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-red-500 text-white text-xs rounded px-1 py-0.5 transform -rotate-90">
                    {measurements.height}″
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="measurement-tips mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-700 mb-2">Measurement Tips</h4>
        <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
          {mountType === 'inside' ? (
            <>
              <li>Measure the width at the top, middle, and bottom. Use the smallest measurement.</li>
              <li>Measure the height at the left, middle, and right. Use the shortest measurement.</li>
              <li>For inside mount, provide the exact window opening measurements.</li>
              <li>Our factory will make the necessary deductions to ensure proper fit.</li>
            </>
          ) : (
            <>
              <li>For outside mount, add 3-4 inches to window width (1.5-2 inches per side).</li>
              <li>Add 3-4 inches to window height for optimal light control.</li>
              <li>If you have a protruding window sill, measure from the top of the mount to the sill.</li>
              <li>For maximum light blockage, extend 2-3 inches beyond the window opening on each side.</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default InteractiveMeasurement;
