import React, { useState, useRef } from 'react';

interface ProductImage {
  image_id?: number;
  image_url: string;
  alt_text?: string;
  image_type?: string;
  is_primary?: boolean;
  display_order?: number;
}

interface ImageGalleryProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onChange,
  maxImages = 10,
  className = ''
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`You can upload up to ${maxImages} images. You already have ${images.length}.`);
      return;
    }

    // Generate preview URLs for the new images
    const newImages: ProductImage[] = [...images];

    Array.from(files).forEach((file, index) => {
      // In a real app, you would upload the file to a server/storage
      // For now, create object URLs
      const previewUrl = URL.createObjectURL(file);

      newImages.push({
        image_url: previewUrl,
        alt_text: file.name,
        image_type: 'product',
        is_primary: images.length === 0 && index === 0, // First image is primary if no other images
        display_order: images.length + index
      });
    });

    onChange(newImages);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    const updatedImages = images.map((image, i) => ({
      ...image,
      is_primary: i === index
    }));
    onChange(updatedImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    // You can add visual indicators here for where the image will be placed
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Reorder the images array
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // Update display order
    const reorderedImages = newImages.map((image, index) => ({
      ...image,
      display_order: index
    }));

    onChange(reorderedImages);
    setDraggedIndex(null);
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Product Images
        </label>
        <span className="text-xs text-gray-500">
          {images.length} of {maxImages} images
        </span>
      </div>

      {/* Image upload button */}
      <div className="mb-4">
        <div className="flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            id="images"
            name="images"
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="sr-only"
            disabled={images.length >= maxImages}
          />
          <label
            htmlFor="images"
            className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
              images.length >= maxImages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Images
          </label>
          <span className="ml-3 text-sm text-gray-500">
            JPG, PNG or GIF, up to 5MB each
          </span>
        </div>
        {images.length >= maxImages && (
          <p className="mt-1 text-xs text-amber-600">
            Maximum of {maxImages} images reached.
          </p>
        )}
      </div>

      {/* Image gallery grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative border rounded-md overflow-hidden ${
                image.is_primary ? 'ring-2 ring-blue-500' : ''
              }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="h-32 bg-gray-100">
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2 bg-white">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    disabled={image.is_primary}
                    className={`text-xs px-2 py-1 rounded ${
                      image.is_primary
                        ? 'bg-blue-100 text-blue-700 cursor-default'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {image.is_primary ? 'Primary' : 'Set as Primary'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No images uploaded yet.</p>
      )}

      {images.length > 1 && (
        <p className="mt-2 text-xs text-gray-500">
          Tip: Drag and drop images to reorder them. The first image will be shown as the main product image.
        </p>
      )}
    </div>
  );
};

export default ImageGallery;
