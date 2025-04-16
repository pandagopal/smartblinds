import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PricingCalculatorProps {
  productId: number;
  dimensions: {
    min_width: number;
    max_width: number;
    min_height: number;
    max_height: number;
    width_increment: number;
    height_increment: number;
  };
  selectedMountTypes: any[];
  selectedControlTypes: any[];
  selectedFabrics: any[];
  selectedHeadrails?: any[];
  selectedBottomRails?: any[];
  selectedSpecialtyOptions?: any[];
}

interface PriceBreakdown {
  basePrice: number;
  sizeAdjustment: number;
  mountTypeAdjustment: number;
  controlTypeAdjustment: number;
  fabricAdjustment: number;
  headrailAdjustment: number;
  bottomRailAdjustment: number;
  specialtyOptionsAdjustment: number;
  total: number;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  productId,
  dimensions,
  selectedMountTypes,
  selectedControlTypes,
  selectedFabrics,
  selectedHeadrails = [],
  selectedBottomRails = [],
  selectedSpecialtyOptions = []
}) => {
  const [width, setWidth] = useState<number>(dimensions.min_width);
  const [height, setHeight] = useState<number>(dimensions.min_height);
  const [selectedMountType, setSelectedMountType] = useState<any | null>(null);
  const [selectedControlType, setSelectedControlType] = useState<any | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<any | null>(null);
  const [selectedHeadrail, setSelectedHeadrail] = useState<any | null>(null);
  const [selectedBottomRail, setSelectedBottomRail] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>({
    basePrice: 0,
    sizeAdjustment: 0,
    mountTypeAdjustment: 0,
    controlTypeAdjustment: 0,
    fabricAdjustment: 0,
    headrailAdjustment: 0,
    bottomRailAdjustment: 0,
    specialtyOptionsAdjustment: 0,
    total: 0
  });
  const [productBasePrice, setProductBasePrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch the product base price on component mount
  useEffect(() => {
    const fetchProductBasePrice = async () => {
      try {
        const response = await axios.get(`/api/vendor/products/${productId}`);
        if (response.data?.data?.base_price) {
          setProductBasePrice(parseFloat(response.data.data.base_price));
        } else {
          setProductBasePrice(99.99); // Default base price if not found
        }
      } catch (error) {
        console.error('Error fetching product base price:', error);
        setProductBasePrice(99.99); // Default base price on error
      }
    };

    fetchProductBasePrice();
  }, [productId]);

  // Set default selections when options change
  useEffect(() => {
    // Select default mount type
    const defaultMountType = selectedMountTypes.find(mt => mt.is_default);
    setSelectedMountType(defaultMountType || (selectedMountTypes.length > 0 ? selectedMountTypes[0] : null));

    // Select default control type
    const defaultControlType = selectedControlTypes.find(ct => ct.is_default);
    setSelectedControlType(defaultControlType || (selectedControlTypes.length > 0 ? selectedControlTypes[0] : null));

    // Select default fabric
    const defaultFabric = selectedFabrics.find(f => f.is_default);
    setSelectedFabric(defaultFabric || (selectedFabrics.length > 0 ? selectedFabrics[0] : null));

    // Select default headrail
    const defaultHeadrail = selectedHeadrails.find(h => h.is_default);
    setSelectedHeadrail(defaultHeadrail || (selectedHeadrails.length > 0 ? selectedHeadrails[0] : null));

    // Select default bottom rail
    const defaultBottomRail = selectedBottomRails.find(r => r.is_default);
    setSelectedBottomRail(defaultBottomRail || (selectedBottomRails.length > 0 ? selectedBottomRails[0] : null));

    // Initialize selected specialty options (no defaults)
    setSelectedOptions([]);
  }, [selectedMountTypes, selectedControlTypes, selectedFabrics, selectedHeadrails, selectedBottomRails, selectedSpecialtyOptions]);

  // Calculate price whenever selections change
  useEffect(() => {
    calculatePrice();
  }, [width, height, selectedMountType, selectedControlType, selectedFabric, selectedHeadrail, selectedBottomRail, selectedOptions, productBasePrice]);

  // Handle width change
  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseFloat(event.target.value);
    if (!isNaN(newWidth) && newWidth >= dimensions.min_width && newWidth <= dimensions.max_width) {
      setWidth(newWidth);
    }
  };

  // Handle height change
  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseFloat(event.target.value);
    if (!isNaN(newHeight) && newHeight >= dimensions.min_height && newHeight <= dimensions.max_height) {
      setHeight(newHeight);
    }
  };

  // Toggle specialty option selection
  const toggleSpecialtyOption = (option: any) => {
    if (selectedOptions.some(opt => opt.specialty_id === option.specialty_id)) {
      setSelectedOptions(selectedOptions.filter(opt => opt.specialty_id !== option.specialty_id));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  // Calculate price based on selections
  const calculatePrice = () => {
    setIsLoading(true);

    // Base price from product
    let basePrice = productBasePrice;

    // Size adjustment - 10% increase for every 12 inches over minimum size
    const extraWidth = Math.max(0, width - dimensions.min_width);
    const extraHeight = Math.max(0, height - dimensions.min_height);
    const extraWidthRatio = extraWidth / 12; // per foot
    const extraHeightRatio = extraHeight / 12; // per foot

    // Size adjustment is calculated as percentage of base price
    const sizeRatio = Math.max(0, (extraWidthRatio + extraHeightRatio) * 0.1); // 10% per foot
    const sizeAdjustment = basePrice * sizeRatio;

    // Mount type adjustment
    const mountTypeAdjustment = selectedMountType ? selectedMountType.price_adjustment || 0 : 0;

    // Control type adjustment - base adjustment + additional
    const controlBaseAdjustment = selectedControlType?.control?.price_adjustment || 0;
    const controlAdditionalAdjustment = selectedControlType?.additional_price_adjustment || 0;
    const controlTypeAdjustment = controlBaseAdjustment + controlAdditionalAdjustment;

    // Fabric adjustment
    const fabricAdjustment = selectedFabric ? selectedFabric.price_adjustment || 0 : 0;

    // Headrail adjustment
    const headrailBaseAdjustment = selectedHeadrail?.headrail?.price_adjustment || 0;
    const headrailAdditionalAdjustment = selectedHeadrail?.additional_price_adjustment || 0;
    const headrailAdjustment = headrailBaseAdjustment + headrailAdditionalAdjustment;

    // Bottom rail adjustment
    const bottomRailBaseAdjustment = selectedBottomRail?.rail?.price_adjustment || 0;
    const bottomRailAdditionalAdjustment = selectedBottomRail?.additional_price_adjustment || 0;
    const bottomRailAdjustment = bottomRailBaseAdjustment + bottomRailAdditionalAdjustment;

    // Specialty options adjustment
    const specialtyOptionsAdjustment = selectedOptions.reduce((total, option) => {
      return total + (option.additional_price_adjustment || 0);
    }, 0);

    // Calculate total price
    const total = basePrice +
                 sizeAdjustment +
                 mountTypeAdjustment +
                 controlTypeAdjustment +
                 fabricAdjustment +
                 headrailAdjustment +
                 bottomRailAdjustment +
                 specialtyOptionsAdjustment;

    // Update price breakdown
    setPriceBreakdown({
      basePrice,
      sizeAdjustment,
      mountTypeAdjustment,
      controlTypeAdjustment,
      fabricAdjustment,
      headrailAdjustment,
      bottomRailAdjustment,
      specialtyOptionsAdjustment,
      total
    });

    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Price Calculator</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width (inches)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={width}
              onChange={handleWidthChange}
              step={dimensions.width_increment}
              min={dimensions.min_width}
              max={dimensions.max_width}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="ml-2 text-sm text-gray-500">
              Min: {dimensions.min_width}" / Max: {dimensions.max_width}"
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (inches)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={height}
              onChange={handleHeightChange}
              step={dimensions.height_increment}
              min={dimensions.min_height}
              max={dimensions.max_height}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="ml-2 text-sm text-gray-500">
              Min: {dimensions.min_height}" / Max: {dimensions.max_height}"
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {/* Mount Type Selection */}
        {selectedMountTypes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mount Type
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedMountTypes.map((mountType) => (
                <button
                  key={mountType.mount_id}
                  type="button"
                  onClick={() => setSelectedMountType(mountType)}
                  className={`py-1 px-3 rounded-md text-sm font-medium ${
                    selectedMountType?.mount_id === mountType.mount_id
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {mountType.mount?.name || 'Unknown'}
                  {mountType.price_adjustment > 0 && ` (+$${mountType.price_adjustment.toFixed(2)})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Control Type Selection */}
        {selectedControlTypes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Control Type
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedControlTypes.map((controlType) => {
                const basePrice = controlType.control?.price_adjustment || 0;
                const additionalPrice = controlType.additional_price_adjustment || 0;
                const totalPrice = basePrice + additionalPrice;

                return (
                  <button
                    key={controlType.control_id}
                    type="button"
                    onClick={() => setSelectedControlType(controlType)}
                    className={`py-1 px-3 rounded-md text-sm font-medium ${
                      selectedControlType?.control_id === controlType.control_id
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {controlType.control?.name || 'Unknown'}
                    {totalPrice > 0 && ` (+$${totalPrice.toFixed(2)})`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fabric Selection */}
        {selectedFabrics.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fabric / Color
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedFabrics.map((fabric) => (
                <button
                  key={`${fabric.fabric_id}-${fabric.color_code}`}
                  type="button"
                  onClick={() => setSelectedFabric(fabric)}
                  className={`py-1 px-3 rounded-md text-sm font-medium flex items-center ${
                    selectedFabric?.fabric_id === fabric.fabric_id && selectedFabric?.color_code === fabric.color_code
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {fabric.color_image_url && (
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                      style={{ backgroundColor: fabric.color_code }}
                    ></div>
                  )}
                  {fabric.color_name || 'Unknown'}
                  {fabric.price_adjustment > 0 && ` (+$${fabric.price_adjustment.toFixed(2)})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Headrail Selection */}
        {selectedHeadrails.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headrail Type
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedHeadrails.map((headrail) => {
                const basePrice = headrail.headrail?.price_adjustment || 0;
                const additionalPrice = headrail.additional_price_adjustment || 0;
                const totalPrice = basePrice + additionalPrice;

                return (
                  <button
                    key={headrail.headrail_id}
                    type="button"
                    onClick={() => setSelectedHeadrail(headrail)}
                    className={`py-1 px-3 rounded-md text-sm font-medium ${
                      selectedHeadrail?.headrail_id === headrail.headrail_id
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {headrail.headrail?.name || 'Unknown'}
                    {totalPrice > 0 && ` (+$${totalPrice.toFixed(2)})`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Rail Selection */}
        {selectedBottomRails.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bottom Rail Type
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedBottomRails.map((rail) => {
                const basePrice = rail.rail?.price_adjustment || 0;
                const additionalPrice = rail.additional_price_adjustment || 0;
                const totalPrice = basePrice + additionalPrice;

                return (
                  <button
                    key={rail.rail_id}
                    type="button"
                    onClick={() => setSelectedBottomRail(rail)}
                    className={`py-1 px-3 rounded-md text-sm font-medium ${
                      selectedBottomRail?.rail_id === rail.rail_id
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {rail.rail?.name || 'Unknown'}
                    {totalPrice > 0 && ` (+$${totalPrice.toFixed(2)})`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Specialty Options */}
        {selectedSpecialtyOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialty Options
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSpecialtyOptions.map((option) => {
                const isSelected = selectedOptions.some(o => o.specialty_id === option.specialty_id);

                return (
                  <button
                    key={option.specialty_id}
                    type="button"
                    onClick={() => toggleSpecialtyOption(option)}
                    className={`py-1 px-3 rounded-md text-sm font-medium ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {option.specialty?.name || 'Unknown'}
                    {option.additional_price_adjustment > 0 && ` (+$${option.additional_price_adjustment.toFixed(2)})`}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Price Breakdown</h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Price:</span>
            <span className="font-medium">${priceBreakdown.basePrice.toFixed(2)}</span>
          </div>

          {priceBreakdown.sizeAdjustment > 0 && (
            <div className="flex justify-between">
              <span>Size Adjustment:</span>
              <span>+${priceBreakdown.sizeAdjustment.toFixed(2)}</span>
            </div>
          )}

          {priceBreakdown.mountTypeAdjustment > 0 && (
            <div className="flex justify-between">
              <span>Mount Type:</span>
              <span>+${priceBreakdown.mountTypeAdjustment.toFixed(2)}</span>
            </div>
          )}

          {priceBreakdown.controlTypeAdjustment > 0 && (
            <div className="flex justify-between">
              <span>Control Type:</span>
              <span>+${priceBreakdown.controlTypeAdjustment.toFixed(2)}</span>
            </div>
          )}

          {priceBreakdown.fabricAdjustment > 0 && (
            <div className="flex justify-between">
              <span>Fabric/Color:</span>
              <span>+${priceBreakdown.fabricAdjustment.toFixed(2)}</span>
            </div>
          )}

          {priceBreakdown.headrailAdjustment > 0 && (
            <div className="flex justify-between">
              <span>Headrail:</span>
              <span>+${priceBreakdown.headrailAdjustment.toFixed(2)}</span>
            </div>
          )}

          {priceBreakdown.bottomRailAdjustment > 0 && (
            <div className="flex justify-between">
              <span>Bottom Rail:</span>
              <span>+${priceBreakdown.bottomRailAdjustment.toFixed(2)}</span>
            </div>
          )}

          {priceBreakdown.specialtyOptionsAdjustment > 0 && (
            <div className="flex justify-between">
              <span>Specialty Options:</span>
              <span>+${priceBreakdown.specialtyOptionsAdjustment.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-base">Total Price:</span>
            <span className="text-lg font-bold text-blue-700">${priceBreakdown.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
