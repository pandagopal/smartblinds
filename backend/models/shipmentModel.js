const mongoose = require('mongoose');

/**
 * Shipment Model
 *
 * Defines the schema for shipments in the system
 */
const ShipmentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  carrier: {
    type: String,
    required: true
  },
  serviceLevel: {
    type: String,
    required: true
  },
  trackingNumber: {
    type: String,
    required: true
  },
  trackingUrl: {
    type: String
  },
  shippingLabelUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['created', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'cancelled'],
    default: 'created'
  },
  shippingDate: {
    type: Date,
    default: Date.now
  },
  estimatedDeliveryDate: {
    type: Date
  },
  deliveredDate: {
    type: Date
  },
  cost: {
    type: Number,
    required: true
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['inch', 'cm'],
      default: 'inch'
    }
  },
  packageType: {
    type: String
  },
  signature: {
    type: Boolean,
    default: false
  },
  insurance: {
    value: Number,
    provider: String
  },
  isReturn: {
    type: Boolean,
    default: false
  },
  events: [
    {
      timestamp: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        required: true
      },
      description: String,
      location: String
    }
  ],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add method to add a tracking event
ShipmentSchema.methods.addTrackingEvent = function(eventData) {
  this.events.push(eventData);

  // Update shipment status based on the new event
  if (eventData.status === 'delivered') {
    this.status = 'delivered';
    this.deliveredDate = eventData.timestamp;
  } else if (eventData.status === 'in_transit') {
    this.status = 'in_transit';
  } else if (eventData.status === 'exception') {
    this.status = 'exception';
  } else if (eventData.status === 'cancelled') {
    this.status = 'cancelled';
    this.isReturn = true;
  }

  return this.save();
};

// Add method to add a note
ShipmentSchema.methods.addNote = function(noteData) {
  this.notes = noteData;
  return this.save();
};

// Create model from schema
const Shipment = mongoose.model('Shipment', ShipmentSchema);

module.exports = Shipment;
