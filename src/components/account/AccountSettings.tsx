import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, updateUserPreferences, UserProfile, UserPreferences } from '../../services/userService';

const AccountSettings: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for profile form
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    profileImage: ''
  });

  // State for password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: {
      orderStatus: true,
      promotions: false,
      productUpdates: true,
      reminders: true
    },
    smsNotifications: false,
    defaultMeasurementUnit: 'inches' as 'inches' | 'centimeters'
  });

  // State for account deletion confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // State for success/error messages
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const profile = await getUserProfile();
        setUserProfile(profile);

        // Set initial form values
        setProfileForm({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber || '',
          profileImage: profile.profileImage || ''
        });

        // Set initial notification preferences
        setNotificationPreferences(profile.preferences);
      } catch (err: any) {
        setError(err.message || 'Failed to load user profile');
        console.error('Error loading user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  // Handle notification preference changes
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    if (name.includes('.')) {
      // Handle nested properties (e.g., emailNotifications.orderStatus)
      const [parent, child] = name.split('.');
      setNotificationPreferences({
        ...notificationPreferences,
        [parent]: {
          ...notificationPreferences[parent as keyof UserPreferences],
          [child]: checked
        }
      });
    } else {
      // Handle top-level properties
      setNotificationPreferences({
        ...notificationPreferences,
        [name]: checked
      });
    }
  };

  // Handle measurement unit change
  const handleMeasurementUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNotificationPreferences({
      ...notificationPreferences,
      defaultMeasurementUnit: e.target.value as 'inches' | 'centimeters'
    });
  };

  // Submit profile changes
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProfileMessage(null);

    try {
      const updatedProfile = await updateUserProfile(profileForm);
      setUserProfile(updatedProfile);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile' });
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setProfileMessage(null);
    }, 3000);
  };

  // Submit password change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    // In a real app, you would call an API to change the password
    // For now, we'll just show a success message
    setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });

    // Reset form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      setPasswordMessage(null);
    }, 3000);
  };

  // Submit notification preferences
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotificationMessage(null);

    try {
      const updatedPreferences = await updateUserPreferences(notificationPreferences);
      setNotificationPreferences(updatedPreferences);
      setNotificationMessage({ type: 'success', text: 'Notification preferences updated successfully!' });
    } catch (err: any) {
      setNotificationMessage({ type: 'error', text: err.message || 'Failed to update notification preferences' });
      console.error('Error updating notification preferences:', err);
    } finally {
      setIsLoading(false);
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000);
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() !== 'delete my account') {
      alert('Please type "delete my account" to confirm.');
      return;
    }

    // In a real app, you would call an API to delete the account
    alert('Account deletion initiated. You will receive a confirmation email.');
    setShowDeleteConfirmation(false);
    setDeleteConfirmText('');
  };

  // Render loading state
  if (isLoading && !userProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  // Render error state
  if (error && !userProfile) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-700 underline mt-1"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

        {/* Profile Information Section */}
        <div className="mb-10 border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">Profile Information</h3>

          {profileMessage && (
            <div className={`mb-4 p-3 rounded ${
              profileMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {profileMessage.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={profileForm.phoneNumber}
                onChange={handleProfileChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image URL
              </label>
              <input
                type="url"
                id="profileImage"
                name="profileImage"
                value={profileForm.profileImage}
                onChange={handleProfileChange}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a URL for your profile image. For best results, use a square image.
              </p>
            </div>

            {profileForm.profileImage && (
              <div className="mb-4 flex justify-center">
                <img
                  src={profileForm.profileImage}
                  alt="Profile preview"
                  className="w-24 h-24 object-cover rounded-full border border-gray-200"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="mb-10 border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">Change Password</h3>

          {passwordMessage && (
            <div className={`mb-4 p-3 rounded ${
              passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4 max-w-lg">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long and include uppercase, lowercase, and numbers.
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
                >
                  Update Password
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Notification Preferences Section */}
        <div className="mb-10 border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">Notification Preferences</h3>

          {notificationMessage && (
            <div className={`mb-4 p-3 rounded ${
              notificationMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {notificationMessage.text}
            </div>
          )}

          <form onSubmit={handleNotificationSubmit}>
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Email Notifications</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications.orderStatus"
                  name="emailNotifications.orderStatus"
                  checked={notificationPreferences.emailNotifications.orderStatus}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="emailNotifications.orderStatus" className="ml-3 text-sm font-medium text-gray-700">
                  Order updates and shipping notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications.promotions"
                  name="emailNotifications.promotions"
                  checked={notificationPreferences.emailNotifications.promotions}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="emailNotifications.promotions" className="ml-3 text-sm font-medium text-gray-700">
                  Promotional emails and special offers
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications.productUpdates"
                  name="emailNotifications.productUpdates"
                  checked={notificationPreferences.emailNotifications.productUpdates}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="emailNotifications.productUpdates" className="ml-3 text-sm font-medium text-gray-700">
                  Product recommendations based on your browsing
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications.reminders"
                  name="emailNotifications.reminders"
                  checked={notificationPreferences.emailNotifications.reminders}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="emailNotifications.reminders" className="ml-3 text-sm font-medium text-gray-700">
                  Installation tips and maintenance reminders
                </label>
              </div>

              <h4 className="text-lg font-medium pt-4">SMS Notifications</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  name="smsNotifications"
                  checked={notificationPreferences.smsNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="smsNotifications" className="ml-3 text-sm font-medium text-gray-700">
                  SMS alerts for order updates (messaging rates may apply)
                </label>
              </div>

              <h4 className="text-lg font-medium pt-4">Measurement Units</h4>
              <div className="max-w-xs">
                <label htmlFor="defaultMeasurementUnit" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred measurement unit
                </label>
                <select
                  id="defaultMeasurementUnit"
                  name="defaultMeasurementUnit"
                  value={notificationPreferences.defaultMeasurementUnit}
                  onChange={handleMeasurementUnitChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                >
                  <option value="inches">Inches</option>
                  <option value="centimeters">Centimeters</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Privacy and Data Section */}
        <div className="mb-10 border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">Privacy and Data</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium mb-2">Download Your Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                You can request a copy of your personal data that we store, including your orders, account information, and preferences.
              </p>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition">
                Request Data Export
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-lg font-medium mb-2">Delete Search History</h4>
              <p className="text-sm text-gray-600 mb-3">
                Clear your search history and browsed products from our records.
              </p>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition">
                Clear Search History
              </button>
            </div>
          </div>
        </div>

        {/* Account Deletion Section */}
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <h3 className="text-xl font-medium mb-4 text-red-700">Delete Account</h3>

          <p className="text-sm text-gray-700 mb-4">
            Deleting your account will remove all of your information from our database. This cannot be undone.
          </p>

          {!showDeleteConfirmation ? (
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-red-600">
                Please type "delete my account" to confirm you want to proceed with account deletion:
              </p>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-md border border-red-300 p-2 focus:border-red-500 focus:outline-none focus:ring-red-500"
                placeholder="Type 'delete my account'"
              />

              <div className="flex space-x-4">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  disabled={deleteConfirmText.toLowerCase() !== 'delete my account'}
                >
                  Confirm Deletion
                </button>

                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
