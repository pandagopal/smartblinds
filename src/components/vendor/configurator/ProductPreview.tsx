import React, { useState, useEffect } from 'react';

interface ProductPreviewProps {
  productImage?: string;
  width: number;
  height: number;
  selectedMountType?: {
    mount_id: number;
    name?: string;
  };
  selectedControlType?: {
    control_id: number;
    name?: string;
  };
  selectedFabric?: {
    color_code: string;
    color_name: string;
    image_url?: string;
  };
  selectedHeadrail?: {
    headrail_id: number;
    name?: string;
  };
  selectedBottomRail?: {
    rail_id: number;
    name?: string;
  };
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  productImage,
  width,
  height,
  selectedMountType,
  selectedControlType,
  selectedFabric,
  selectedHeadrail,
  selectedBottomRail
}) => {
  const [windowWidth, setWindowWidth] = useState<number>(300);
  const [windowHeight, setWindowHeight] = useState<number>(400);
  const [aspectRatio, setAspectRatio] = useState<number>(width / height);
  const [mountType, setMountType] = useState<string>('inside');
  const [controlType, setControlType] = useState<string>('cordless');
  const [fabricColor, setFabricColor] = useState<string>('#FFFFFF');
  const [fabricName, setFabricName] = useState<string>('White');
  const [fabricTexture, setFabricTexture] = useState<string | null>(null);

  // Update dimensions and options when props change
  useEffect(() => {
    // Set aspect ratio based on dimensions
    const newAspectRatio = width / height;
    setAspectRatio(newAspectRatio);

    // Rescale window dimensions, maintaining the height
    setWindowWidth(windowHeight * newAspectRatio);

    // Update mount type
    if (selectedMountType?.name) {
      const mountName = selectedMountType.name.toLowerCase();
      if (mountName.includes('inside')) setMountType('inside');
      else if (mountName.includes('outside')) setMountType('outside');
      else if (mountName.includes('ceiling')) setMountType('ceiling');
      else setMountType('inside');
    }

    // Update control type
    if (selectedControlType?.name) {
      const controlName = selectedControlType.name.toLowerCase();
      if (controlName.includes('cord')) setControlType('cord');
      else if (controlName.includes('cordless')) setControlType('cordless');
      else if (controlName.includes('motor')) setControlType('motorized');
      else if (controlName.includes('wand')) setControlType('wand');
      else setControlType('cordless');
    }

    // Update fabric color and texture
    if (selectedFabric) {
      setFabricColor(selectedFabric.color_code);
      setFabricName(selectedFabric.color_name);
      setFabricTexture(selectedFabric.image_url || null);
    }
  }, [width, height, selectedMountType, selectedControlType, selectedFabric]);

  // Calculate dimensions based on mount type
  const calculateBlindDimensions = () => {
    const padding = 20; // Padding around the window frame in pixels
    let blindWidth, blindHeight, blindLeft, blindTop;

    if (mountType === 'inside') {
      // Inside mount: blinds fit inside the window frame
      blindWidth = windowWidth - padding * 2;
      blindHeight = windowHeight - padding * 2;
      blindLeft = padding;
      blindTop = padding;
    } else if (mountType === 'outside') {
      // Outside mount: blinds overlap the window frame
      const overlap = 30; // How much the blinds overlap the window on each side
      blindWidth = windowWidth + overlap * 2;
      blindHeight = windowHeight + overlap;
      blindLeft = -overlap;
      blindTop = -overlap / 2;
    } else if (mountType === 'ceiling') {
      // Ceiling mount: similar to outside but extends higher
      const overlap = 30;
      blindWidth = windowWidth + overlap * 2;
      blindHeight = windowHeight + overlap * 1.5;
      blindLeft = -overlap;
      blindTop = -overlap;
    } else {
      // Default to inside mount
      blindWidth = windowWidth - padding * 2;
      blindHeight = windowHeight - padding * 2;
      blindLeft = padding;
      blindTop = padding;
    }

    return { blindWidth, blindHeight, blindLeft, blindTop };
  };

  // Render control elements based on selected type
  const renderControlElement = () => {
    const { blindWidth, blindHeight, blindLeft, blindTop } = calculateBlindDimensions();
    const controlPosition = { right: 10 };

    switch (controlType) {
      case 'cord':
        return (
          <div
            className="absolute bg-gray-400 w-0.5"
            style={{
              ...controlPosition,
              height: blindHeight * 1.2,
              top: blindTop + blindHeight * 0.1,
              right: `${controlPosition.right}px`
            }}
          ></div>
        );

      case 'wand':
        return (
          <div
            className="absolute bg-gray-500 w-1 rounded"
            style={{
              ...controlPosition,
              height: blindHeight * 0.8,
              top: blindTop + blindHeight * 0.1,
              right: `${controlPosition.right + 10}px`
            }}
          ></div>
        );

      case 'motorized':
        return (
          <div
            className="absolute"
            style={{
              ...controlPosition,
              top: blindTop + blindHeight * 0.1,
              right: `${controlPosition.right - 15}px`
            }}
          >
            <div className="bg-gray-300 border border-gray-400 rounded p-1">
              <div className="flex flex-col space-y-1">
                <div className="w-3 h-1 bg-gray-700 rounded-full"></div>
                <div className="w-3 h-1 bg-gray-700 rounded-full"></div>
                <div className="w-3 h-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        );

      default:
        // Cordless has no visible control
        return null;
    }
  };

  // Render headrail
  const renderHeadrail = () => {
    const { blindWidth, blindLeft, blindTop } = calculateBlindDimensions();
    const headrailHeight = 12;
    const headrailColor = selectedHeadrail?.name?.toLowerCase().includes('decorative') ? '#B8B8B8' : '#DDDDDD';

    return (
      <div
        className="absolute"
        style={{
          width: blindWidth,
          height: headrailHeight,
          top: blindTop,
          left: blindLeft,
          backgroundColor: headrailColor,
          borderTop: '1px solid #AAA',
          borderLeft: '1px solid #AAA',
          borderRight: '1px solid #AAA',
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3
        }}
      ></div>
    );
  };

  // Render bottom rail
  const renderBottomRail = () => {
    const { blindWidth, blindHeight, blindLeft, blindTop } = calculateBlindDimensions();
    const bottomRailHeight = 10;
    const bottomRailColor = selectedBottomRail?.name?.toLowerCase().includes('decorative') ? '#B8B8B8' : '#DDDDDD';

    return (
      <div
        className="absolute"
        style={{
          width: blindWidth,
          height: bottomRailHeight,
          top: blindTop + blindHeight - bottomRailHeight,
          left: blindLeft,
          backgroundColor: bottomRailColor,
          borderBottom: '1px solid #AAA',
          borderLeft: '1px solid #AAA',
          borderRight: '1px solid #AAA',
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3
        }}
      ></div>
    );
  };

  // Render the blind fabric/slats
  const renderBlindBody = () => {
    const { blindWidth, blindHeight, blindLeft, blindTop } = calculateBlindDimensions();
    const headrailHeight = 12;
    const bottomRailHeight = 10;
    const fabricHeight = blindHeight - headrailHeight - bottomRailHeight;

    const fabricStyle: React.CSSProperties = {
      width: blindWidth,
      height: fabricHeight,
      top: blindTop + headrailHeight,
      left: blindLeft,
      backgroundColor: fabricColor,
      borderLeft: '1px solid rgba(0,0,0,0.1)',
      borderRight: '1px solid rgba(0,0,0,0.1)',
      position: 'absolute'
    };

    // Add fabric texture if available
    if (fabricTexture) {
      fabricStyle.backgroundImage = `url(${fabricTexture})`;
      fabricStyle.backgroundSize = 'cover';
      fabricStyle.backgroundRepeat = 'no-repeat';
      fabricStyle.backgroundPosition = 'center';
      fabricStyle.backgroundBlendMode = 'multiply';
    }

    return <div style={fabricStyle}></div>;
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Product Preview</h3>

      <div className="flex items-start">
        {/* Preview visualization */}
        <div className="flex-1">
          <div
            className="relative border border-gray-400 rounded bg-gray-100"
            style={{
              width: windowWidth,
              height: windowHeight
            }}
          >
            {/* Simulate window frame */}
            <div className="absolute inset-0 bg-blue-50 opacity-20"></div>

            {/* Render the window treatment */}
            {renderHeadrail()}
            {renderBlindBody()}
            {renderBottomRail()}
            {renderControlElement()}

            {/* Dimensions display */}
            <div className="absolute -bottom-8 left-0 w-full text-center text-sm text-gray-600">
              {width}" × {height}"
            </div>
          </div>
        </div>

        {/* Preview details */}
        <div className="ml-6 w-64">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Current Configuration</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-24 text-gray-500">Size:</div>
                <span className="font-medium">{width}" × {height}"</span>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-gray-500">Mount Type:</div>
                <span className="font-medium">{selectedMountType?.name || 'Inside Mount'}</span>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-gray-500">Control Type:</div>
                <span className="font-medium">{selectedControlType?.name || 'Cordless'}</span>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-gray-500">Color:</div>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      backgroundColor: fabricColor,
                      border: '1px solid #DDD'
                    }}
                  ></div>
                  <span className="font-medium">{fabricName}</span>
                </div>
              </div>

              {selectedHeadrail && (
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Headrail:</div>
                  <span className="font-medium">{selectedHeadrail.name}</span>
                </div>
              )}

              {selectedBottomRail && (
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Bottom Rail:</div>
                  <span className="font-medium">{selectedBottomRail.name}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Preview Controls</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Window Height</label>
                <input
                  type="range"
                  min="200"
                  max="600"
                  value={windowHeight}
                  onChange={(e) => setWindowHeight(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="text-xs text-gray-500">
                <p>This preview shows how your product will appear with the selected options.</p>
                <p className="mt-1">The visualization is approximate and actual appearance may vary.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
