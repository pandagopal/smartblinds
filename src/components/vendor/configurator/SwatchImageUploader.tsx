import React, { useState, useRef, useEffect } from 'react';

interface SwatchImage {
  id?: number | string;
  image_url: string;
  color_code: string;
  color_name: string;
}

interface SwatchImageUploaderProps {
  initialSwatches?: SwatchImage[];
  onSwatchesChange: (swatches: SwatchImage[]) => void;
  maxSwatches?: number;
}

const SwatchImageUploader: React.FC<SwatchImageUploaderProps> = ({
  initialSwatches = [],
  onSwatchesChange,
  maxSwatches = 20
}) => {
  const [swatches, setSwatches] = useState<SwatchImage[]>(initialSwatches);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editColorName, setEditColorName] = useState<string>('');
  const [editColorCode, setEditColorCode] = useState<string>('#FFFFFF');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSwatches(initialSwatches);
  }, [initialSwatches]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxSwatches - swatches.length;
    if (remainingSlots <= 0) {
      alert(`Maximum number of swatches (${maxSwatches}) reached`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const imagePromises = filesToProcess.map(file => processImageFile(file));

    Promise.all(imagePromises)
      .then(newSwatches => {
        const updatedSwatches = [...swatches, ...newSwatches];
        setSwatches(updatedSwatches);
        onSwatchesChange(updatedSwatches);

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })
      .catch(error => {
        console.error('Error processing image files:', error);
        alert('Error processing image files. Please try again.');
      });
  };

  const processImageFile = (file: File): Promise<SwatchImage> => {
    return new Promise((resolve, reject) => {
      // Create a preview URL
      const imageUrl = URL.createObjectURL(file);

      // Extract color name from file name
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const colorName = fileName.replace(/-|_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      // Use color picker to extract dominant color
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Sample colors from the image (center pixel)
        const centerX = Math.floor(img.width / 2);
        const centerY = Math.floor(img.height / 2);
        const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;

        // Convert RGB to HEX
        const colorCode = `#${pixelData[0].toString(16).padStart(2, '0')}${pixelData[1].toString(16).padStart(2, '0')}${pixelData[2].toString(16).padStart(2, '0')}`;

        resolve({
          id: Date.now().toString(),
          image_url: imageUrl,
          color_code: colorCode,
          color_name: colorName
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for color analysis'));
      };

      img.src = imageUrl;
    });
  };

  const startEditing = (index: number) => {
    const swatch = swatches[index];
    setIsEditing(index);
    setEditColorName(swatch.color_name);
    setEditColorCode(swatch.color_code);
  };

  const saveEditing = () => {
    if (isEditing !== null) {
      const updatedSwatches = [...swatches];
      updatedSwatches[isEditing] = {
        ...updatedSwatches[isEditing],
        color_name: editColorName,
        color_code: editColorCode
      };

      setSwatches(updatedSwatches);
      onSwatchesChange(updatedSwatches);
      setIsEditing(null);
    }
  };

  const handleRemoveSwatch = (index: number) => {
    const updatedSwatches = swatches.filter((_, i) => i !== index);
    setSwatches(updatedSwatches);
    onSwatchesChange(updatedSwatches);

    if (isEditing === index) {
      setIsEditing(null);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updatedSwatches = [...swatches];
    const draggedSwatch = updatedSwatches[draggedIndex];
    updatedSwatches.splice(draggedIndex, 1);
    updatedSwatches.splice(dropIndex, 0, draggedSwatch);

    setSwatches(updatedSwatches);
    onSwatchesChange(updatedSwatches);
    setDraggedIndex(null);
  };

  // Handle extracting colors from existing images
  const extractColorsFromImages = () => {
    const updatedSwatches = swatches.map(swatch => {
      if (!swatch.color_code || swatch.color_code === '#FFFFFF') {
        return new Promise<SwatchImage>(resolve => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(swatch);
              return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Sample colors from the image (center pixel)
            const centerX = Math.floor(img.width / 2);
            const centerY = Math.floor(img.height / 2);
            const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;

            // Convert RGB to HEX
            const colorCode = `#${pixelData[0].toString(16).padStart(2, '0')}${pixelData[1].toString(16).padStart(2, '0')}${pixelData[2].toString(16).padStart(2, '0')}`;

            resolve({
              ...swatch,
              color_code: colorCode
            });
          };

          img.onerror = () => {
            resolve(swatch);
          };

          img.src = swatch.image_url;
        });
      }

      return Promise.resolve(swatch);
    });

    Promise.all(updatedSwatches).then(newSwatches => {
      setSwatches(newSwatches);
      onSwatchesChange(newSwatches);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Color Swatches</h3>
        <span className="text-sm text-gray-500">{swatches.length} of {maxSwatches}</span>
      </div>

      {/* Upload controls */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="sr-only"
            id="swatch-upload"
            disabled={swatches.length >= maxSwatches}
          />
          <label
            htmlFor="swatch-upload"
            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
              swatches.length >= maxSwatches
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Swatches
          </label>
        </div>

        {swatches.length > 0 && (
          <button
            onClick={extractColorsFromImages}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Extract Colors
          </button>
        )}
      </div>

      {/* Swatches grid */}
      {swatches.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {swatches.map((swatch, index) => (
            <div
              key={swatch.id || index}
              className="relative border rounded-md overflow-hidden shadow-sm bg-white"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Swatch image */}
              <div className="h-24 overflow-hidden">
                <img
                  src={swatch.image_url}
                  alt={`${swatch.color_name} swatch`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Swatch information */}
              <div className="p-2">
                {isEditing === index ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editColorName}
                      onChange={(e) => setEditColorName(e.target.value)}
                      placeholder="Color name"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <div className="flex">
                      <input
                        type="color"
                        value={editColorCode}
                        onChange={(e) => setEditColorCode(e.target.value)}
                        className="h-8 w-8 border border-gray-300 rounded-l-md"
                      />
                      <input
                        type="text"
                        value={editColorCode}
                        onChange={(e) => setEditColorCode(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 border-l-0 rounded-r-md"
                        placeholder="#RRGGBB"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setIsEditing(null)}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEditing}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: swatch.color_code }}
                      ></div>
                      <button
                        onClick={() => startEditing(index)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{swatch.color_name}</p>
                        <p className="text-xs text-gray-500">{swatch.color_code}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSwatch(index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="absolute top-0 left-0 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No color swatches uploaded yet</p>
          <p className="mt-1 text-xs text-gray-500">Upload images to create fabric/color swatches</p>
        </div>
      )}

      {swatches.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Tip: Drag and drop to reorder swatches. Click "Edit" to change color names and codes.
        </p>
      )}
    </div>
  );
};

export default SwatchImageUploader;
