import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';

interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
}

interface ProductionBlackout {
  id: string;
  reason: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface BusinessScheduleData {
  businessHours: BusinessHours[];
  holidays: Holiday[];
  productionBlackouts: ProductionBlackout[];
  timezone: string;
}

const BusinessSchedule: React.FC = () => {
  const defaultBusinessHours: BusinessHours[] = [
    { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Saturday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
    { day: 'Sunday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
  ];

  const [formData, setFormData] = useState<BusinessScheduleData>({
    businessHours: defaultBusinessHours,
    holidays: [],
    productionBlackouts: [],
    timezone: 'America/New_York',
  });

  const [newHoliday, setNewHoliday] = useState<Omit<Holiday, 'id'>>({
    name: '',
    date: '',
    isRecurring: false,
  });

  const [newBlackout, setNewBlackout] = useState<Omit<ProductionBlackout, 'id'>>({
    reason: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Pacific/Honolulu', 'America/Anchorage', 'Europe/London', 'Europe/Paris',
    'Asia/Tokyo', 'Australia/Sydney'
  ];

  // Load business schedule data
  useEffect(() => {
    const loadBusinessSchedule = () => {
      const user = authService.getCurrentUser();

      if (user?.vendorInfo?.businessSchedule) {
        setFormData(user.vendorInfo.businessSchedule);
      }

      setIsLoading(false);
    };

    loadBusinessSchedule();
  }, []);

  const handleHoursChange = (index: number, field: keyof BusinessHours, value: string | boolean) => {
    const updatedBusinessHours = [...formData.businessHours];
    updatedBusinessHours[index] = {
      ...updatedBusinessHours[index],
      [field]: value
    };
    setFormData({ ...formData, businessHours: updatedBusinessHours });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNewHolidayChange = (field: keyof Omit<Holiday, 'id'>, value: string | boolean) => {
    setNewHoliday({ ...newHoliday, [field]: value });
  };

  const handleNewBlackoutChange = (field: keyof Omit<ProductionBlackout, 'id'>, value: string) => {
    setNewBlackout({ ...newBlackout, [field]: value });
  };

  const handleAddHoliday = () => {
    if (!newHoliday.name.trim() || !newHoliday.date) {
      setErrorMessage('Please enter both holiday name and date');
      return;
    }

    const holiday: Holiday = {
      ...newHoliday,
      id: `holiday-${Date.now()}`
    };

    setFormData({
      ...formData,
      holidays: [...formData.holidays, holiday]
    });

    setNewHoliday({
      name: '',
      date: '',
      isRecurring: false
    });

    setErrorMessage(null);
  };

  const handleRemoveHoliday = (id: string) => {
    setFormData({
      ...formData,
      holidays: formData.holidays.filter(holiday => holiday.id !== id)
    });
  };

  const handleAddBlackout = () => {
    if (!newBlackout.reason.trim() || !newBlackout.startDate || !newBlackout.endDate) {
      setErrorMessage('Please fill in all required blackout fields');
      return;
    }

    // Validate dates
    if (new Date(newBlackout.startDate) > new Date(newBlackout.endDate)) {
      setErrorMessage('End date must be after start date');
      return;
    }

    const blackout: ProductionBlackout = {
      ...newBlackout,
      id: `blackout-${Date.now()}`
    };

    setFormData({
      ...formData,
      productionBlackouts: [...formData.productionBlackouts, blackout]
    });

    setNewBlackout({
      reason: '',
      startDate: '',
      endDate: '',
      description: ''
    });

    setErrorMessage(null);
  };

  const handleRemoveBlackout = (id: string) => {
    setFormData({
      ...formData,
      productionBlackouts: formData.productionBlackouts.filter(blackout => blackout.id !== id)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // In a real app, this would be an API call to update business schedule
      const user = authService.getCurrentUser();

      if (user) {
        const updatedUser = {
          ...user,
          vendorInfo: {
            ...user.vendorInfo,
            businessSchedule: formData
          }
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccessMessage('Business schedule updated successfully');
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to update business schedule');
      console.error('Error updating business schedule:', error);
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
      <h2 className="text-xl font-semibold mb-4">Business Hours & Schedule</h2>

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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Timezone */}
        <div className="max-w-md">
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
            Business Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>
                {tz.replace('_', ' ')}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            All business hours are displayed in this timezone
          </p>
        </div>

        {/* Business Hours */}
        <div>
          <h3 className="text-lg font-medium mb-4">Business Hours</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.businessHours.map((hours, index) => (
                  <tr key={hours.day}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {hours.day}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.isOpen}
                          onChange={(e) => handleHoursChange(index, 'isOpen', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2">{hours.isOpen ? 'Open' : 'Closed'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={hours.openTime}
                          onChange={(e) => handleHoursChange(index, 'openTime', e.target.value)}
                          disabled={!hours.isOpen}
                          className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hours.closeTime}
                          onChange={(e) => handleHoursChange(index, 'closeTime', e.target.value)}
                          disabled={!hours.isOpen}
                          className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Holidays */}
        <div>
          <h3 className="text-lg font-medium mb-4">Holidays</h3>

          {formData.holidays.length > 0 ? (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holiday Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recurring
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.holidays.map((holiday) => (
                    <tr key={holiday.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {holiday.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(holiday.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {holiday.isRecurring ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveHoliday(holiday.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 mb-4">No holidays have been added.</p>
          )}

          {/* Add Holiday Form */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="text-md font-medium mb-3">Add Holiday</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="holidayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name*
                </label>
                <input
                  type="text"
                  id="holidayName"
                  value={newHoliday.name}
                  onChange={(e) => handleNewHolidayChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Christmas Day"
                />
              </div>
              <div>
                <label htmlFor="holidayDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date*
                </label>
                <input
                  type="date"
                  id="holidayDate"
                  value={newHoliday.date}
                  onChange={(e) => handleNewHolidayChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center h-full mb-2">
                  <input
                    type="checkbox"
                    id="holidayRecurring"
                    checked={newHoliday.isRecurring}
                    onChange={(e) => handleNewHolidayChange('isRecurring', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="holidayRecurring" className="ml-2 block text-sm text-gray-700">
                    Recurring yearly
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddHoliday}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Holiday
              </button>
            </div>
          </div>
        </div>

        {/* Production Blackouts */}
        <div>
          <h3 className="text-lg font-medium mb-4">Production Blackouts</h3>

          {formData.productionBlackouts.length > 0 ? (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.productionBlackouts.map((blackout) => (
                    <tr key={blackout.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {blackout.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(blackout.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(blackout.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {blackout.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveBlackout(blackout.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 mb-4">No production blackouts have been added.</p>
          )}

          {/* Add Blackout Form */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="text-md font-medium mb-3">Add Production Blackout</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="blackoutReason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason*
                </label>
                <input
                  type="text"
                  id="blackoutReason"
                  value={newBlackout.reason}
                  onChange={(e) => handleNewBlackoutChange('reason', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Factory Maintenance"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="blackoutStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date*
                  </label>
                  <input
                    type="date"
                    id="blackoutStartDate"
                    value={newBlackout.startDate}
                    onChange={(e) => handleNewBlackoutChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="blackoutEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date*
                  </label>
                  <input
                    type="date"
                    id="blackoutEndDate"
                    value={newBlackout.endDate}
                    onChange={(e) => handleNewBlackoutChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="blackoutDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  id="blackoutDescription"
                  value={newBlackout.description}
                  onChange={(e) => handleNewBlackoutChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional additional details"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddBlackout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Blackout
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200">
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

export default BusinessSchedule;
