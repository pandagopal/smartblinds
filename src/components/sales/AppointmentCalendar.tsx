import React, { useState, useEffect } from 'react';
import { Appointment, SAMPLE_APPOINTMENTS, SAMPLE_CUSTOMERS, Customer, Address } from '../../models/Customer';

// Days of the week
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Time slots (30-minute intervals from 8am to 6pm)
const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const AppointmentCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    date: new Date(),
    startTime: '09:00',
    endTime: '10:30',
    type: 'initial consultation',
    status: 'scheduled',
    reminderSent: false,
    confirmationSent: false,
    priority: 'medium',
  });

  // Month navigation
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    // Simulated API fetch for appointments and customers
    setAppointments(SAMPLE_APPOINTMENTS);
    setCustomers(SAMPLE_CUSTOMERS);

    // Initial computation of filtered customers
    if (customerSearchQuery) {
      const query = customerSearchQuery.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (customer) =>
            `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
            customer.email.toLowerCase().includes(query) ||
            customer.phone.includes(customerSearchQuery)
        )
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearchQuery, customers]);

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Determine the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Generate calendar grid (6 weeks x 7 days)
    const calendarDays = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];

      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startingDayOfWeek) || day > daysInMonth) {
          // Empty cell
          week.push(null);
        } else {
          // Valid day
          const date = new Date(year, month, day);
          week.push({
            date,
            dayOfMonth: day,
            appointments: appointments.filter(
              (appointment) =>
                appointment.date.getFullYear() === date.getFullYear() &&
                appointment.date.getMonth() === date.getMonth() &&
                appointment.date.getDate() === date.getDate()
            ),
          });
          day++;
        }
      }

      calendarDays.push(week);

      // Stop if we've reached the end of the month
      if (day > daysInMonth) break;
    }

    return calendarDays;
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreatingAppointment(false);
    setShowAppointmentDetails(false);
  };

  const handleNewAppointmentClick = () => {
    setIsCreatingAppointment(true);
    setShowAppointmentDetails(false);
    setNewAppointment({
      ...newAppointment,
      date: selectedDate,
    });
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
    setIsCreatingAppointment(false);
  };

  const getDayAppointments = () => {
    return appointments.filter(
      (appointment) =>
        appointment.date.getFullYear() === selectedDate.getFullYear() &&
        appointment.date.getMonth() === selectedDate.getMonth() &&
        appointment.date.getDate() === selectedDate.getDate()
    );
  };

  const handleNewAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAppointment({
      ...newAppointment,
      [name]: value,
    });
  };

  const handleCustomerSelect = (customer: Customer) => {
    const address = customer.addresses.find(a => a.isDefault) || customer.addresses[0];

    setNewAppointment({
      ...newAppointment,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      address: address as Address,
    });

    setCustomerSearchQuery('');
  };

  const handleCreateAppointment = () => {
    if (!newAppointment.customerId || !newAppointment.date || !newAppointment.startTime || !newAppointment.endTime) {
      alert('Please fill in all required fields.');
      return;
    }

    // Create a new appointment
    const appointment: Appointment = {
      id: `appointment-${Date.now()}`,
      customerId: newAppointment.customerId as string,
      customerName: newAppointment.customerName as string,
      salesRepId: 'sr123', // Would be current user ID in production
      salesRepName: 'Sarah Parker', // Would be current user name in production
      type: newAppointment.type as Appointment['type'],
      date: newAppointment.date as Date,
      startTime: newAppointment.startTime as string,
      endTime: newAppointment.endTime as string,
      status: newAppointment.status as Appointment['status'],
      address: newAppointment.address as Address,
      notes: newAppointment.notes,
      reminderSent: false,
      confirmationSent: false,
      priority: newAppointment.priority as Appointment['priority'],
    };

    // Add the appointment to the list
    setAppointments([...appointments, appointment]);

    // Reset form and state
    setIsCreatingAppointment(false);
    setNewAppointment({
      date: new Date(),
      startTime: '09:00',
      endTime: '10:30',
      type: 'initial consultation',
      status: 'scheduled',
      reminderSent: false,
      confirmationSent: false,
      priority: 'medium',
    });
  };

  const handleSendReminder = (appointmentId: string) => {
    // In a real implementation, this would call an API to send an email/SMS
    console.log(`Sending reminder for appointment ${appointmentId}`);

    // Update the appointment's reminderSent flag
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === appointmentId
        ? { ...appointment, reminderSent: true }
        : appointment
    );

    setAppointments(updatedAppointments);

    if (selectedAppointment && selectedAppointment.id === appointmentId) {
      setSelectedAppointment({ ...selectedAppointment, reminderSent: true });
    }

    alert('Reminder sent to customer successfully.');
  };

  const handleSendConfirmation = (appointmentId: string) => {
    // In a real implementation, this would call an API to send an email/SMS
    console.log(`Sending confirmation for appointment ${appointmentId}`);

    // Update the appointment's confirmationSent flag
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === appointmentId
        ? { ...appointment, confirmationSent: true }
        : appointment
    );

    setAppointments(updatedAppointments);

    if (selectedAppointment && selectedAppointment.id === appointmentId) {
      setSelectedAppointment({ ...selectedAppointment, confirmationSent: true });
    }

    alert('Confirmation sent to customer successfully.');
  };

  const handleUpdateStatus = (appointmentId: string, status: Appointment['status']) => {
    // Update the appointment's status
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === appointmentId
        ? { ...appointment, status }
        : appointment
    );

    setAppointments(updatedAppointments);

    if (selectedAppointment && selectedAppointment.id === appointmentId) {
      setSelectedAppointment({ ...selectedAppointment, status });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2 py-1 text-sm rounded hover:bg-gray-100"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                {day.substring(0, 3)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={`empty-${weekIndex}-${dayIndex}`} className="h-24 bg-gray-50"></div>;
                }

                const isSelected =
                  selectedDate.getFullYear() === day.date.getFullYear() &&
                  selectedDate.getMonth() === day.date.getMonth() &&
                  selectedDate.getDate() === day.date.getDate();

                const isToday =
                  new Date().getFullYear() === day.date.getFullYear() &&
                  new Date().getMonth() === day.date.getMonth() &&
                  new Date().getDate() === day.date.getDate();

                return (
                  <div
                    key={`day-${day.dayOfMonth}`}
                    className={`h-24 p-1 border overflow-hidden ${
                      isSelected ? 'border-primary-red bg-red-50' : 'border-gray-200'
                    } ${isToday ? 'bg-blue-50' : 'bg-white'}`}
                    onClick={() => handleDayClick(day.date)}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>
                        {day.dayOfMonth}
                      </span>
                      {day.appointments.length > 0 && (
                        <span className="text-xs bg-primary-red text-white px-1 rounded-full">
                          {day.appointments.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
                      {day.appointments.slice(0, 2).map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`text-xs p-1 rounded truncate ${
                            appointment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'cancelled'
                              ? 'bg-gray-100 text-gray-800'
                              : appointment.status === 'no-show'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointmentClick(appointment);
                          }}
                        >
                          {appointment.startTime} - {appointment.customerName.split(' ')[0]}
                        </div>
                      ))}
                      {day.appointments.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{day.appointments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              {selectedDate.toLocaleDateString('default', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
            <button
              onClick={handleNewAppointmentClick}
              className="px-3 py-1 bg-primary-red text-white text-sm rounded hover:bg-red-700"
            >
              New Appointment
            </button>
          </div>

          {isCreatingAppointment ? (
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-medium text-gray-800 mb-3">New Appointment</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  {newAppointment.customerId ? (
                    <div className="flex justify-between items-center p-2 border border-gray-200 rounded bg-gray-50">
                      <span>{newAppointment.customerName}</span>
                      <button
                        onClick={() => {
                          setNewAppointment({
                            ...newAppointment,
                            customerId: undefined,
                            customerName: undefined,
                            address: undefined,
                          });
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search for a customer..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                        />
                        {customerSearchQuery && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => (
                                <div
                                  key={customer.id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleCustomerSelect(customer)}
                                >
                                  <div className="font-medium">
                                    {customer.firstName} {customer.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">{customer.email}</div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">No customers found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <select
                      name="startTime"
                      value={newAppointment.startTime}
                      onChange={handleNewAppointmentChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                    >
                      {TIME_SLOTS.map((time) => (
                        <option key={`start-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <select
                      name="endTime"
                      value={newAppointment.endTime}
                      onChange={handleNewAppointmentChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                    >
                      {TIME_SLOTS.map((time) => (
                        <option key={`end-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Type
                  </label>
                  <select
                    name="type"
                    value={newAppointment.type}
                    onChange={handleNewAppointmentChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                  >
                    <option value="initial consultation">Initial Consultation</option>
                    <option value="measurement">Measurement</option>
                    <option value="quote presentation">Quote Presentation</option>
                    <option value="installation">Installation</option>
                    <option value="service">Service</option>
                    <option value="follow-up">Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={newAppointment.priority}
                    onChange={handleNewAppointmentChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={newAppointment.notes || ''}
                    onChange={handleNewAppointmentChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsCreatingAppointment(false)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAppointment}
                    className="px-4 py-2 text-sm bg-primary-red text-white rounded hover:bg-red-700"
                    disabled={!newAppointment.customerId}
                  >
                    Create Appointment
                  </button>
                </div>
              </div>
            </div>
          ) : showAppointmentDetails && selectedAppointment ? (
            <div className="border border-gray-200 rounded p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-800">Appointment Details</h4>
                <button
                  onClick={() => setShowAppointmentDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Customer</div>
                  <div className="font-medium">{selectedAppointment.customerName}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Time</div>
                  <div>
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Type</div>
                  <div className="capitalize">{selectedAppointment.type}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Address</div>
                  <div className="text-sm">
                    <div>{selectedAppointment.address.street}</div>
                    <div>
                      {selectedAppointment.address.city}, {selectedAppointment.address.state} {selectedAppointment.address.zip}
                    </div>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Notes</div>
                    <div className="text-sm">{selectedAppointment.notes}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <select
                    value={selectedAppointment.status}
                    onChange={(e) => handleUpdateStatus(selectedAppointment.id, e.target.value as Appointment['status'])}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-red focus:border-primary-red"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No-show</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => handleSendReminder(selectedAppointment.id)}
                    disabled={selectedAppointment.reminderSent}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {selectedAppointment.reminderSent ? 'Reminder Sent' : 'Send Reminder Email'}
                  </button>

                  <button
                    onClick={() => handleSendConfirmation(selectedAppointment.id)}
                    disabled={selectedAppointment.confirmationSent}
                    className="w-full px-4 py-2 text-sm bg-primary-red text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {selectedAppointment.confirmationSent ? 'Confirmation Sent' : 'Send Confirmation Email'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Appointments</h4>

              {getDayAppointments().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments scheduled for this day.
                </div>
              ) : (
                <div className="space-y-3">
                  {getDayAppointments().map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{appointment.customerName}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'cancelled'
                              ? 'bg-gray-100 text-gray-800'
                              : appointment.status === 'no-show'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 mt-1">
                        {appointment.startTime} - {appointment.endTime}
                      </div>

                      <div className="text-sm capitalize mt-1">
                        {appointment.type}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
