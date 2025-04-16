import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getShipmentById,
  reportDamage,
  addShipmentNote,
  Shipment,
  ShippingStatus
} from '../../services/shippingService';

const ShipmentTracking: React.FC = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportingDamage, setReportingDamage] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (shipmentId) {
      loadShipment();
    }
  }, [shipmentId]);

  const loadShipment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!shipmentId) {
        throw new Error('Shipment ID is required');
      }

      const shipmentData = await getShipmentById(shipmentId);
      setShipment(shipmentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipment');
      console.error('Error loading shipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentId || !damageDescription.trim()) return;

    try {
      setLoading(true);
      await reportDamage(shipmentId, damageDescription);
      setDamageDescription('');
      setReportingDamage(false);
      setSuccessMessage('Damage report submitted successfully. Our customer service team will contact you shortly.');

      // Refresh shipment data
      await loadShipment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report damage');
      console.error('Error reporting damage:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentId || !noteText.trim()) return;

    try {
      setLoading(true);
      await addShipmentNote(shipmentId, {
        noteType: 'customer',
        text: noteText
      });
      setNoteText('');
      setAddingNote(false);
      setSuccessMessage('Note added successfully.');

      // Refresh shipment data
      await loadShipment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
      console.error('Error adding note:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: ShippingStatus) => {
    switch (status) {
      case ShippingStatus.PENDING:
        return 'bg-gray-100 text-gray-800';
      case ShippingStatus.CREATED:
        return 'bg-blue-100 text-blue-800';
      case ShippingStatus.IN_TRANSIT:
        return 'bg-yellow-100 text-yellow-800';
      case ShippingStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case ShippingStatus.EXCEPTION:
        return 'bg-red-100 text-red-800';
      case ShippingStatus.RETURNED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !shipment) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !shipment) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={loadShipment}
          className="mt-3 bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">Shipment Not Found</h3>
        <p className="mt-2 text-yellow-700">The requested shipment could not be found or you don't have permission to view it.</p>
        <Link
          to="/account/orders"
          className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      {loading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded">
          <p>{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="mt-2 text-sm text-green-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tracking Information</h1>
          <p className="text-gray-600">
            {shipment.trackingNumber ? `Tracking: ${shipment.trackingNumber}` : 'No tracking number available'}
          </p>
        </div>
        <Link
          to={`/account/orders/${shipment.orderId}`}
          className="mt-2 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Order
        </Link>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <span className="font-medium text-gray-700 mr-3">Status:</span>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(shipment.status)}`}>
              {shipment.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {!shipment.damagedReported && shipment.status !== ShippingStatus.PENDING && (
              <button
                onClick={() => setReportingDamage(true)}
                className="px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50 text-sm"
              >
                Report Damage
              </button>
            )}
            <button
              onClick={() => setAddingNote(true)}
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
            >
              Add Note
            </button>
            {shipment.trackingUrl && (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                View on Carrier Site
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Shipment Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Shipment Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Carrier:</span>
              <span className="font-medium">{shipment.carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Level:</span>
              <span className="font-medium">{shipment.serviceLevel}</span>
            </div>
            {shipment.shippingDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Ship Date:</span>
                <span className="font-medium">{new Date(shipment.shippingDate).toLocaleDateString()}</span>
              </div>
            )}
            {shipment.estimatedDeliveryDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Est. Delivery:</span>
                <span className="font-medium">{new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}</span>
              </div>
            )}
            {shipment.actualDeliveryDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivered On:</span>
                <span className="font-medium">{new Date(shipment.actualDeliveryDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Return Information</h2>
          {shipment.isReturn ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Return Status:</span>
                <span className="font-medium">{shipment.status.replace('_', ' ').toUpperCase()}</span>
              </div>
              {shipment.returnReason && (
                <div>
                  <span className="text-gray-600 block mb-1">Return Reason:</span>
                  <p className="bg-white p-2 rounded border border-gray-200">{shipment.returnReason}</p>
                </div>
              )}
              {shipment.returnAuthorizedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Authorized On:</span>
                  <span className="font-medium">{new Date(shipment.returnAuthorizedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">This is not a return shipment.</p>
          )}
        </div>
      </div>

      {/* Track Progress */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Tracking Timeline</h2>
        {shipment.events && shipment.events.length > 0 ? (
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
            <ul className="space-y-6">
              {[...shipment.events].reverse().map((event, index) => (
                <li key={index} className="relative pl-10">
                  <div className="absolute left-0 top-1 flex items-center justify-center w-12 h-12">
                    <div className={`w-5 h-5 rounded-full border-4 ${index === 0 ? 'border-blue-500 bg-white' : 'border-gray-300 bg-white'}`}></div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}</span>
                      <span className="text-gray-500 text-sm">{new Date(event.eventDate).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600">{event.description}</p>
                    {event.location && <p className="text-sm text-gray-500 mt-1">{event.location}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">No tracking events available yet.</p>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Notes</h2>
        {shipment.notes && shipment.notes.length > 0 ? (
          <div className="space-y-4">
            {shipment.notes.map((note, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    note.noteType === 'customer' ? 'text-blue-600' :
                    note.noteType === 'vendor' ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                    {note.noteType.charAt(0).toUpperCase() + note.noteType.slice(1)} Note
                  </span>
                  {note.createdAt && (
                    <span className="text-gray-500 text-sm">{new Date(note.createdAt).toLocaleString()}</span>
                  )}
                </div>
                <p className="text-gray-700">{note.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">No notes available.</p>
          </div>
        )}
      </div>

      {/* Report Damage Modal */}
      {reportingDamage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Report Damage</h3>
            <form onSubmit={handleReportDamage}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please describe the damage:
                </label>
                <textarea
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                  placeholder="Describe what's damaged and how it happened if you know"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setReportingDamage(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Report Damage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {addingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Note</h3>
            <form onSubmit={handleAddNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your note:
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                  placeholder="Add any additional information about the shipment"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAddingNote(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentTracking;
