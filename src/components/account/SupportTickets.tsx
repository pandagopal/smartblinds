import React, { useState, useEffect } from 'react';
import {
  getSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  replySupportTicket,
  closeSupportTicket,
  SupportTicket,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketMessage
} from '../../services/supportService';

interface SupportTicketsProps {
  userId: string;
}

const SupportTickets: React.FC<SupportTicketsProps> = ({ userId }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'Order Issues',
    relatedOrderId: '',
    relatedProductId: ''
  });

  // Load support tickets
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch all tickets from the service
  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSupportTickets();
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load support tickets');
      console.error('Error loading tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // View ticket details
  const viewTicketDetails = async (ticketId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const ticket = await getSupportTicketById(ticketId);
      setSelectedTicket(ticket);
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details');
      console.error('Error loading ticket details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change for new ticket form
  const handleNewTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTicket({
      ...newTicket,
      [name]: value
    });
  };

  // Create a new support ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await createSupportTicket(newTicket);
      // Reset form and refresh the ticket list
      setNewTicket({
        subject: '',
        description: '',
        category: 'Order Issues',
        relatedOrderId: '',
        relatedProductId: ''
      });
      setShowCreateForm(false);
      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to create support ticket');
      console.error('Error creating ticket:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reply to a support ticket
  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setReplyLoading(true);
    try {
      await replySupportTicket(selectedTicket.id, replyMessage);
      // Refresh ticket details
      const updatedTicket = await getSupportTicketById(selectedTicket.id);
      setSelectedTicket(updatedTicket);
      setReplyMessage('');
      fetchTickets(); // Update the list to reflect status changes
    } catch (err: any) {
      setError(err.message || 'Failed to send reply');
      console.error('Error replying to ticket:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  // Close a support ticket
  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    if (!window.confirm('Are you sure you want to close this ticket?')) {
      return;
    }

    setIsLoading(true);
    try {
      await closeSupportTicket(selectedTicket.id);
      // Refresh ticket details and list
      const updatedTicket = await getSupportTicketById(selectedTicket.id);
      setSelectedTicket(updatedTicket);
      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to close ticket');
      console.error('Error closing ticket:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge styling based on ticket status
  const getStatusBadgeClass = (status: SupportTicketStatus) => {
    switch (status) {
      case SupportTicketStatus.OPEN:
        return 'bg-blue-100 text-blue-800';
      case SupportTicketStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case SupportTicketStatus.WAITING_FOR_CUSTOMER:
        return 'bg-purple-100 text-purple-800';
      case SupportTicketStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case SupportTicketStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date to display nicely
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter tickets based on status
  const filteredTickets = statusFilter === 'all'
    ? tickets
    : tickets.filter(ticket => ticket.status === statusFilter);

  // Render loading state
  if (isLoading && !selectedTicket && !showCreateForm) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        {!showCreateForm && !selectedTicket && (
          <button
            onClick={() => {
              setShowCreateForm(true);
              setSelectedTicket(null);
            }}
            className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
          >
            Create New Ticket
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showCreateForm ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Create New Support Ticket</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleCreateTicket}>
            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={newTicket.subject}
                onChange={handleNewTicketChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={newTicket.category}
                onChange={handleNewTicketChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                required
              >
                <option value="Order Issues">Order Issues</option>
                <option value="Installation Help">Installation Help</option>
                <option value="Product Questions">Product Questions</option>
                <option value="Account Issues">Account Issues</option>
                <option value="Return/Refund Request">Return/Refund Request</option>
                <option value="Website Issues">Website Issues</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="relatedOrderId" className="block text-sm font-medium text-gray-700 mb-1">
                Related Order ID (if applicable)
              </label>
              <input
                type="text"
                id="relatedOrderId"
                name="relatedOrderId"
                value={newTicket.relatedOrderId}
                onChange={handleNewTicketChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="relatedProductId" className="block text-sm font-medium text-gray-700 mb-1">
                Related Product ID (if applicable)
              </label>
              <input
                type="text"
                id="relatedProductId"
                name="relatedProductId"
                value={newTicket.relatedProductId}
                onChange={handleNewTicketChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={newTicket.description}
                onChange={handleNewTicketChange}
                rows={5}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                required
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      ) : selectedTicket ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">{selectedTicket.subject}</h3>
            <button
              onClick={() => {
                setSelectedTicket(null);
                setReplyMessage('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(selectedTicket.status)}`}>
                {selectedTicket.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {selectedTicket.category}
              </span>
              {selectedTicket.relatedOrderId && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  Order: {selectedTicket.relatedOrderId}
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-2">
              Created: {formatDate(selectedTicket.createdAt)}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Last updated: {formatDate(selectedTicket.updatedAt)}
            </div>

            <div className="space-y-4 mb-6">
              {selectedTicket.messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.sender === 'customer'
                      ? 'bg-blue-50 ml-0 mr-auto'
                      : 'bg-gray-100 ml-auto mr-0'
                  } max-w-[80%]`}
                >
                  <div className="font-medium text-sm mb-1">
                    {message.sender === 'customer' ? 'You' : 'Support Agent'}
                    <span className="font-normal text-xs text-gray-500 ml-2">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-700 hover:underline flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {attachment.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reply form - only show if ticket is not closed */}
            {selectedTicket.status !== SupportTicketStatus.CLOSED && (
              <form onSubmit={handleReplyTicket}>
                <div className="mb-4">
                  <label htmlFor="replyMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Reply
                  </label>
                  <textarea
                    id="replyMessage"
                    name="replyMessage"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleCloseTicket}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                    disabled={replyLoading}
                  >
                    Close Ticket
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
                    disabled={replyLoading || !replyMessage.trim()}
                  >
                    {replyLoading ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="flex-grow">
              <label htmlFor="statusFilter" className="mr-2 text-sm font-medium">Filter by Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 py-1 px-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              >
                <option value="all">All Tickets</option>
                <option value={SupportTicketStatus.OPEN}>Open</option>
                <option value={SupportTicketStatus.IN_PROGRESS}>In Progress</option>
                <option value={SupportTicketStatus.WAITING_FOR_CUSTOMER}>Waiting for Customer</option>
                <option value={SupportTicketStatus.RESOLVED}>Resolved</option>
                <option value={SupportTicketStatus.CLOSED}>Closed</option>
              </select>
            </div>
            <button
              onClick={fetchTickets}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {filteredTickets.length > 0 ? (
            <div className="space-y-4">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => viewTicketDetails(ticket.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-lg">{ticket.subject}</h4>
                      <p className="text-sm text-gray-600 mb-2">{ticket.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">{ticket.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created: {formatDate(ticket.createdAt)}</span>
                    <span>Updated: {formatDate(ticket.updatedAt)}</span>
                  </div>
                  <div className="mt-2 text-right">
                    <button className="text-xs text-primary-red hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No support tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">Get help with your orders, products, or any other questions.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Ticket
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SupportTickets;
