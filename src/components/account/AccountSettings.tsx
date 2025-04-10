import React, { useState } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  preferredContactMethod: string;
}

interface AccountSettingsProps {
  user: User;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  // State for password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    orderUpdates: true,
    promotionalEmails: true,
    productRecommendations: false,
    installationTips: true,
    smsAlerts: false
  });

  // State for account deletion confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // State for success/error messages
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
    setNotificationPreferences({
      ...notificationPreferences,
      [name]: checked
    });
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
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, you would call an API to update notification preferences
    // For now, we'll just show a success message
    setNotificationMessage({ type: 'success', text: 'Notification preferences updated successfully!' });

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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="orderUpdates"
                  name="orderUpdates"
                  checked={notificationPreferences.orderUpdates}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="orderUpdates" className="ml-3 text-sm font-medium text-gray-700">
                  Order updates and shipping notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="promotionalEmails"
                  name="promotionalEmails"
                  checked={notificationPreferences.promotionalEmails}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="promotionalEmails" className="ml-3 text-sm font-medium text-gray-700">
                  Promotional emails and special offers
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="productRecommendations"
                  name="productRecommendations"
                  checked={notificationPreferences.productRecommendations}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="productRecommendations" className="ml-3 text-sm font-medium text-gray-700">
                  Product recommendations based on your browsing
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="installationTips"
                  name="installationTips"
                  checked={notificationPreferences.installationTips}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="installationTips" className="ml-3 text-sm font-medium text-gray-700">
                  Installation tips and maintenance reminders
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsAlerts"
                  name="smsAlerts"
                  checked={notificationPreferences.smsAlerts}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red rounded"
                />
                <label htmlFor="smsAlerts" className="ml-3 text-sm font-medium text-gray-700">
                  SMS alerts for order updates (messaging rates may apply)
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
                >
                  Save Preferences
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
