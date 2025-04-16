import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MountTypeSelector from './configurator/MountTypeSelector';
import DimensionsConfigurator from './configurator/DimensionsConfigurator';
import FabricSelector from './configurator/FabricSelector';
import ControlTypeSelector from './configurator/ControlTypeSelector';
import RoomRecommendations from './configurator/RoomRecommendations';
import PricingCalculator from './configurator/PricingCalculator';
import ProductPreview from './configurator/ProductPreview';
import SwatchImageUploader from './configurator/SwatchImageUploader';
import InventoryManager from './configurator/InventoryManager';

interface ProductConfigOptionsProps {
  productId: number;
}

const ProductConfigOptions: React.FC<ProductConfigOptionsProps> = ({ productId }) => {
  // State for each component
  const [activeTab, setActiveTab] = useState<string>('mount-types');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Options data from API
  const [mountTypes, setMountTypes] = useState<any[]>([]);
  const [controlTypes, setControlTypes] = useState<any[]>([]);
  const [fabricTypes, setFabricTypes] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [headrailOptions, setHeadrailOptions] = useState<any[]>([]);
  const [bottomRailOptions, setBottomRailOptions] = useState<any[]>([]);
  const [specialtyOptions, setSpecialtyOptions] = useState<any[]>([]);

  // Selected configuration options
  const [selectedMountTypes, setSelectedMountTypes] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState<any>({
    min_width: 12,
    max_width: 72,
    min_height: 12,
    max_height: 84,
    width_increment: 0.125,
    height_increment: 0.125
  });
  const [selectedFabrics, setSelectedFabrics] = useState<any[]>([]);
  const [selectedControlTypes, setSelectedControlTypes] = useState<any[]>([]);
  const [selectedHeadrails, setSelectedHeadrails] = useState<any[]>([]);
  const [selectedBottomRails, setSelectedBottomRails] = useState<any[]>([]);
  const [selectedSpecialtyOptions, setSelectedSpecialtyOptions] = useState<any[]>([]);
  const [roomRecommendations, setRoomRecommendations] = useState<any[]>([]);
  const [fabricSwatches, setFabricSwatches] = useState<any[]>([]);

  // Fetch all configuration options on component mount
  useEffect(() => {
    const fetchAllOptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch mount types
        const mountTypesResponse = await axios.get('/api/vendor/mount-types');
        setMountTypes(mountTypesResponse.data.data);

        // Fetch control types
        const controlTypesResponse = await axios.get('/api/vendor/control-types');
        setControlTypes(controlTypesResponse.data.data);

        // Fetch fabric types
        const fabricTypesResponse = await axios.get('/api/vendor/fabric-types');
        setFabricTypes(fabricTypesResponse.data.data);

        // Fetch room types
        const roomTypesResponse = await axios.get('/api/vendor/room-types');
        setRoomTypes(roomTypesResponse.data.data);

        // Fetch headrail options
        const headrailOptionsResponse = await axios.get('/api/vendor/headrail-options');
        setHeadrailOptions(headrailOptionsResponse.data.data);

        // Fetch bottom rail options
        const bottomRailOptionsResponse = await axios.get('/api/vendor/bottom-rail-options');
        setBottomRailOptions(bottomRailOptionsResponse.data.data);

        // Fetch specialty options
        const specialtyOptionsResponse = await axios.get('/api/vendor/specialty-options');
        setSpecialtyOptions(specialtyOptionsResponse.data.data);

        // If we have a product ID, fetch existing product configuration
        if (productId) {
          await fetchProductConfiguration();
        }
      } catch (err) {
        console.error('Error fetching configuration options:', err);
        setError('Failed to load configuration options. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllOptions();
  }, [productId]);

  // Fetch existing product configuration
  const fetchProductConfiguration = async () => {
    try {
      // Fetch product details with dimensions
      const productResponse = await axios.get(`/api/vendor/products/${productId}`);
      const productData = productResponse.data.data;

      // Set dimensions if available
      if (productData.dimensions) {
        setDimensions(productData.dimensions);
      }

      // Fetch mount types
      const mountTypesResponse = await axios.get(`/api/vendor/products/${productId}/mount-types`);
      if (mountTypesResponse.data?.data) {
        setSelectedMountTypes(mountTypesResponse.data.data);
      }

      // Fetch control types
      const controlTypesResponse = await axios.get(`/api/vendor/products/${productId}/control-types`);
      if (controlTypesResponse.data?.data) {
        setSelectedControlTypes(controlTypesResponse.data.data);
      }

      // Fetch fabrics
      const fabricsResponse = await axios.get(`/api/vendor/products/${productId}/fabrics`);
      if (fabricsResponse.data?.data) {
        setSelectedFabrics(fabricsResponse.data.data);

        // Generate fabric swatches from fabrics
        const swatches = fabricsResponse.data.data.map(fabric => ({
          id: `${fabric.fabric_id}_${fabric.color_code.replace('#', '')}`,
          image_url: fabric.color_image_url || 'https://via.placeholder.com/100',
          color_code: fabric.color_code,
          color_name: fabric.color_name
        }));
        setFabricSwatches(swatches);
      }

      // Fetch room recommendations
      const recommendationsResponse = await axios.get(`/api/vendor/products/${productId}/room-recommendations`);
      if (recommendationsResponse.data?.data) {
        setRoomRecommendations(recommendationsResponse.data.data);
      }

      // Fetch headrails
      const headrailsResponse = await axios.get(`/api/vendor/products/${productId}/headrails`);
      if (headrailsResponse.data?.data) {
        setSelectedHeadrails(headrailsResponse.data.data);
      }

      // Fetch bottom rails
      const bottomRailsResponse = await axios.get(`/api/vendor/products/${productId}/bottom-rails`);
      if (bottomRailsResponse.data?.data) {
        setSelectedBottomRails(bottomRailsResponse.data.data);
      }

      // Fetch specialty options
      const specialtyOptionsResponse = await axios.get(`/api/vendor/products/${productId}/specialty-options`);
      if (specialtyOptionsResponse.data?.data) {
        setSelectedSpecialtyOptions(specialtyOptionsResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching product configuration:', err);
      setError('Failed to load existing product configuration. Please try again.');
    }
  };

  // Handler functions for saving each configuration
  const handleSaveMountTypes = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`/api/vendor/products/${productId}/mount-types`, {
        mountTypes: selectedMountTypes
      });
      setSuccess('Mount types saved successfully!');
    } catch (err) {
      console.error('Error saving mount types:', err);
      setError('Failed to save mount types. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDimensions = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`/api/vendor/products/${productId}/dimensions`, dimensions);
      setSuccess('Dimensions saved successfully!');
    } catch (err) {
      console.error('Error saving dimensions:', err);
      setError('Failed to save dimensions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFabrics = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`/api/vendor/products/${productId}/fabrics`, {
        fabrics: selectedFabrics
      });
      setSuccess('Fabrics and colors saved successfully!');
    } catch (err) {
      console.error('Error saving fabrics:', err);
      setError('Failed to save fabrics. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveControlTypes = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`/api/vendor/products/${productId}/control-types`, {
        controlTypes: selectedControlTypes
      });
      setSuccess('Control types saved successfully!');
    } catch (err) {
      console.error('Error saving control types:', err);
      setError('Failed to save control types. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRoomRecommendations = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`/api/vendor/products/${productId}/room-recommendations`, {
        recommendations: roomRecommendations
      });
      setSuccess('Room recommendations saved successfully!');
    } catch (err) {
      console.error('Error saving room recommendations:', err);
      setError('Failed to save room recommendations. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product configuration options...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'mount-types':
        return (
          <MountTypeSelector
            mountTypes={mountTypes}
            selectedMountTypes={selectedMountTypes}
            onChange={setSelectedMountTypes}
            onSave={handleSaveMountTypes}
            isSaving={isSaving}
          />
        );

      case 'dimensions':
        return (
          <DimensionsConfigurator
            dimensions={dimensions}
            onChange={setDimensions}
            onSave={handleSaveDimensions}
            isSaving={isSaving}
          />
        );

      case 'fabrics':
        return (
          <FabricSelector
            fabricTypes={fabricTypes}
            selectedFabrics={selectedFabrics}
            onChange={setSelectedFabrics}
            onSave={handleSaveFabrics}
            isSaving={isSaving}
          />
        );

      case 'control-types':
        return (
          <ControlTypeSelector
            controlTypes={controlTypes}
            selectedControlTypes={selectedControlTypes}
            onChange={setSelectedControlTypes}
            onSave={handleSaveControlTypes}
            isSaving={isSaving}
          />
        );

      case 'room-recommendations':
        return (
          <RoomRecommendations
            roomTypes={roomTypes}
            recommendations={roomRecommendations}
            onChange={setRoomRecommendations}
            onSave={handleSaveRoomRecommendations}
            isSaving={isSaving}
          />
        );

      case 'pricing-calculator':
        return (
          <PricingCalculator
            productId={productId}
            dimensions={dimensions}
            selectedMountTypes={selectedMountTypes}
            selectedControlTypes={selectedControlTypes}
            selectedFabrics={selectedFabrics}
            selectedHeadrails={selectedHeadrails}
            selectedBottomRails={selectedBottomRails}
            selectedSpecialtyOptions={selectedSpecialtyOptions}
          />
        );

      case 'product-preview':
        return (
          <ProductPreview
            width={dimensions.min_width + (dimensions.max_width - dimensions.min_width) / 2}
            height={dimensions.min_height + (dimensions.max_height - dimensions.min_height) / 2}
            selectedMountType={selectedMountTypes.find(mt => mt.is_default) || (selectedMountTypes.length > 0 ? selectedMountTypes[0] : undefined)}
            selectedControlType={selectedControlTypes.find(ct => ct.is_default) || (selectedControlTypes.length > 0 ? selectedControlTypes[0] : undefined)}
            selectedFabric={selectedFabrics.find(f => f.is_default) || (selectedFabrics.length > 0 ? selectedFabrics[0] : undefined)}
            selectedHeadrail={selectedHeadrails.find(h => h.is_default) || (selectedHeadrails.length > 0 ? selectedHeadrails[0] : undefined)}
            selectedBottomRail={selectedBottomRails.find(r => r.is_default) || (selectedBottomRails.length > 0 ? selectedBottomRails[0] : undefined)}
          />
        );

      case 'swatch-image-uploader':
        return (
          <SwatchImageUploader
            initialSwatches={fabricSwatches}
            onSwatchesChange={(newSwatches) => {
              setFabricSwatches(newSwatches);
              // Update selected fabrics with new color information
              const updatedFabrics = selectedFabrics.map(fabric => {
                const matchingSwatch = newSwatches.find(s =>
                  s.id === `${fabric.fabric_id}_${fabric.color_code.replace('#', '')}` ||
                  s.color_name === fabric.color_name
                );
                if (matchingSwatch) {
                  return {
                    ...fabric,
                    color_code: matchingSwatch.color_code,
                    color_name: matchingSwatch.color_name,
                    color_image_url: matchingSwatch.image_url
                  };
                }
                return fabric;
              });
              setSelectedFabrics(updatedFabrics);
            }}
          />
        );

      case 'inventory-manager':
        return (
          <InventoryManager
            productId={productId}
            selectedMountTypes={selectedMountTypes}
            selectedControlTypes={selectedControlTypes}
            selectedFabrics={selectedFabrics}
            selectedHeadrails={selectedHeadrails}
            selectedBottomRails={selectedBottomRails}
            selectedSpecialtyOptions={selectedSpecialtyOptions}
          />
        );

      default:
        return (
          <div className="p-8 text-center text-gray-500">
            Select a configuration option from the tabs above.
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tab navigation */}
      <div className="border-b">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('mount-types')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'mount-types'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mount Types
          </button>
          <button
            onClick={() => setActiveTab('dimensions')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'dimensions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Dimensions
          </button>
          <button
            onClick={() => setActiveTab('fabrics')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'fabrics'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fabrics & Colors
          </button>
          <button
            onClick={() => setActiveTab('control-types')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'control-types'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Control Types
          </button>
          <button
            onClick={() => setActiveTab('room-recommendations')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'room-recommendations'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Room Recommendations
          </button>
          <button
            onClick={() => setActiveTab('pricing-calculator')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'pricing-calculator'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pricing Calculator
          </button>
          <button
            onClick={() => setActiveTab('product-preview')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'product-preview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Product Preview
          </button>
          <button
            onClick={() => setActiveTab('swatch-image-uploader')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'swatch-image-uploader'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Swatch Image Uploader
          </button>
          <button
            onClick={() => setActiveTab('inventory-manager')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'inventory-manager'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Inventory Manager
          </button>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-500 focus:outline-none focus:text-red-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccess(null)}
                className="inline-flex text-green-500 focus:outline-none focus:text-green-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProductConfigOptions;
