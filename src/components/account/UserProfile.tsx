import React, { useState } from 'react';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  createdAt: Date;
  preferredContactMethod: string;
}

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    street: user.address.street,
    city: user.address.city,
    state: user.address.state,
    zipCode: user.address.zipCode,
    country: user.address.country,
    preferredContactMethod: user.preferredContactMethod
  });

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, you would send an API request to update the user profile
    // For now, we'll just show a success message
    setSuccessMessage('Profile updated successfully!');

    // Hide the success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
      setIsEditing(false);
    }, 3000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
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
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
            </div>
          </div>

          <h3 className="text-xl font-medium mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
            </div>
          </div>

          <h3 className="text-xl font-medium mb-4">Preferences</h3>
          <div className="mb-6">
            <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact Method
            </label>
            <select
              id="preferredContactMethod"
              name="preferredContactMethod"
              value={formData.preferredContactMethod}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm text-gray-500">First Name</h3>
              <p className="text-lg">{user.firstName}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Last Name</h3>
              <p className="text-lg">{user.lastName}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Email</h3>
              <p className="text-lg">{user.email}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Phone</h3>
              <p className="text-lg">{user.phone}</p>
            </div>
          </div>

          <h3 className="text-xl font-medium mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <h3 className="text-sm text-gray-500">Street Address</h3>
              <p className="text-lg">{user.address.street}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">City</h3>
              <p className="text-lg">{user.address.city}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">State/Province</h3>
              <p className="text-lg">{user.address.state}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">ZIP/Postal Code</h3>
              <p className="text-lg">{user.address.zipCode}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Country</h3>
              <p className="text-lg">{user.address.country}</p>
            </div>
          </div>

          <h3 className="text-xl font-medium mb-4">Preferences</h3>
          <div>
            <h3 className="text-sm text-gray-500">Preferred Contact Method</h3>
            <p className="text-lg">{user.preferredContactMethod}</p>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-xl font-medium mb-4">Account Information</h3>
            <p className="text-sm text-gray-500">
              Member since: {user.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
