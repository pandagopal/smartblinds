import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';

interface ContactInfo {
  primaryEmail: string;
  primaryPhone: string;
  website: string;
  salesEmail: string;
  salesPhone: string;
  supportEmail: string;
  supportPhone: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
}

const ContactInformation: React.FC = () => {
  const [formData, setFormData] = useState<ContactInfo>({
    primaryEmail: '',
    primaryPhone: '',
    website: '',
    salesEmail: '',
    salesPhone: '',
    supportEmail: '',
    supportPhone: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load contact data
  useEffect(() => {
    const loadContactData = () => {
      const user = authService.getCurrentUser();

      if (user?.vendorInfo?.contactInfo) {
        setFormData(user.vendorInfo.contactInfo);
      } else if (user) {
        // Set primary email from user account if no contact info exists
        setFormData(prev => ({
          ...prev,
          primaryEmail: user.email || ''
        }));
      }

      setIsLoading(false);
    };

    loadContactData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle nested social media fields
    if (name.startsWith('social-')) {
      const socialPlatform = name.replace('social-', '');
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialPlatform]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // Validate email formats
      const emailFields = ['primaryEmail', 'salesEmail', 'supportEmail'];
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      for (const field of emailFields) {
        const email = formData[field as keyof ContactInfo] as string;
        if (email && !emailRegex.test(email)) {
          throw new Error(`Invalid email format for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
      }

      // Validate website format
      if (formData.website && !formData.website.match(/^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/)) {
        throw new Error('Invalid website URL format');
      }

      // In a real app, this would be an API call to update contact info
      const user = authService.getCurrentUser();

      if (user) {
        const updatedUser = {
          ...user,
          vendorInfo: {
            ...user.vendorInfo,
            contactInfo: formData
          }
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update user in localStorage (in a real app, this would be stored in a database)
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccessMessage('Contact information updated successfully');
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to update contact information');
      console.error('Error updating contact information:', error);
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
      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

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
        {/* Primary Contact Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Primary Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="primaryEmail" className="block text-sm font-medium text-gray-700">
                Primary Email*
              </label>
              <input
                type="email"
                id="primaryEmail"
                name="primaryEmail"
                value={formData.primaryEmail}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="primaryPhone" className="block text-sm font-medium text-gray-700">
                Primary Phone
              </label>
              <input
                type="tel"
                id="primaryPhone"
                name="primaryPhone"
                value={formData.primaryPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., +1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., https://yourcompany.com"
              />
            </div>
          </div>
        </div>

        {/* Sales Contact Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Sales Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="salesEmail" className="block text-sm font-medium text-gray-700">
                Sales Email
              </label>
              <input
                type="email"
                id="salesEmail"
                name="salesEmail"
                value={formData.salesEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., sales@yourcompany.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salesPhone" className="block text-sm font-medium text-gray-700">
                Sales Phone
              </label>
              <input
                type="tel"
                id="salesPhone"
                name="salesPhone"
                value={formData.salesPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., +1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Support Contact Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Support Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700">
                Support Email
              </label>
              <input
                type="email"
                id="supportEmail"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., support@yourcompany.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="supportPhone" className="block text-sm font-medium text-gray-700">
                Support Phone
              </label>
              <input
                type="tel"
                id="supportPhone"
                name="supportPhone"
                value={formData.supportPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., +1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="social-facebook" className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  facebook.com/
                </span>
                <input
                  type="text"
                  id="social-facebook"
                  name="social-facebook"
                  value={formData.socialMedia.facebook}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="yourbusiness"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="social-twitter" className="block text-sm font-medium text-gray-700">
                Twitter
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  twitter.com/
                </span>
                <input
                  type="text"
                  id="social-twitter"
                  name="social-twitter"
                  value={formData.socialMedia.twitter}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="yourbusiness"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="social-instagram" className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  instagram.com/
                </span>
                <input
                  type="text"
                  id="social-instagram"
                  name="social-instagram"
                  value={formData.socialMedia.instagram}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="yourbusiness"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="social-linkedin" className="block text-sm font-medium text-gray-700">
                LinkedIn
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  linkedin.com/company/
                </span>
                <input
                  type="text"
                  id="social-linkedin"
                  name="social-linkedin"
                  value={formData.socialMedia.linkedin}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="yourbusiness"
                />
              </div>
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

export default ContactInformation;
