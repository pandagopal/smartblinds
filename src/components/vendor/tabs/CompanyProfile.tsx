import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../../../services/authService';

interface CompanyProfileData {
  businessName: string;
  businessDescription: string;
  logo: string | null;
  banner: string | null;
}

const CompanyProfile: React.FC = () => {
  const [formData, setFormData] = useState<CompanyProfileData>({
    businessName: '',
    businessDescription: '',
    logo: null,
    banner: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Load vendor data
  useEffect(() => {
    const loadVendorData = () => {
      const user = authService.getCurrentUser();

      if (user?.vendorInfo) {
        setFormData({
          businessName: user.vendorInfo.businessName || '',
          businessDescription: user.vendorInfo.businessDescription || '',
          logo: user.vendorInfo.logo || null,
          banner: user.vendorInfo.banner || null
        });
      }

      setIsLoading(false);
    };

    loadVendorData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size should be less than 5MB');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData(prev => ({ ...prev, [fieldName]: event.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (fieldName: 'logo' | 'banner') => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));

    // Reset the file input
    if (fieldName === 'logo' && logoInputRef.current) {
      logoInputRef.current.value = '';
    } else if (fieldName === 'banner' && bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // In a real app, this would be an API call to update vendor info
      // For demo, we'll simulate by updating the user in authService

      const user = authService.getCurrentUser();

      if (user) {
        const updatedUser = {
          ...user,
          vendorInfo: {
            ...user.vendorInfo,
            businessName: formData.businessName,
            businessDescription: formData.businessDescription,
            logo: formData.logo,
            banner: formData.banner
          }
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update user in localStorage (in a real app, this would be stored in a database)
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccessMessage('Company profile updated successfully');
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      setErrorMessage('Failed to update company profile');
      console.error('Error updating company profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Company Profile</h2>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Company Name*
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Company Description */}
        <div className="space-y-2">
          <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
            Company Description
          </label>
          <textarea
            id="businessDescription"
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your business, mission, and products"
          />
        </div>

        {/* Company Logo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Company Logo
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {formData.logo ? (
              <div className="relative">
                <img
                  src={formData.logo}
                  alt="Company Logo"
                  className="h-20 w-20 object-contain border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile('logo')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-md"
                  aria-label="Remove logo"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <input
                ref={logoInputRef}
                type="file"
                id="logo"
                name="logo"
                onChange={(e) => handleFileChange(e, 'logo')}
                accept="image/*"
                className="sr-only"
              />
              <label
                htmlFor="logo"
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                {formData.logo ? 'Change Logo' : 'Upload Logo'}
              </label>
              <p className="mt-1 text-xs text-gray-500">Recommended size: 200x200px. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Company Banner */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Company Banner
          </label>
          <div className="mt-1 space-y-4">
            {formData.banner ? (
              <div className="relative">
                <img
                  src={formData.banner}
                  alt="Company Banner"
                  className="w-full h-48 object-cover border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile('banner')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-md"
                  aria-label="Remove banner"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-1 text-sm">Upload a banner image</p>
                </div>
              </div>
            )}
            <div>
              <input
                ref={bannerInputRef}
                type="file"
                id="banner"
                name="banner"
                onChange={(e) => handleFileChange(e, 'banner')}
                accept="image/*"
                className="sr-only"
              />
              <label
                htmlFor="banner"
                className="inline-block px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                {formData.banner ? 'Change Banner' : 'Upload Banner'}
              </label>
              <p className="mt-1 text-xs text-gray-500">Recommended size: 1200x300px. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
