/**
 * Product Model
 *
 * Defines the schema for products in the system
 */
const mongoose = require('mongoose');

// Product Review Schema
const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  title: String,
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Product Schema
const ProductSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['blinds', 'shades', 'shutters', 'drapes', 'accessories']
  },
  seriesName: String,
  materialType: String,
  shortDescription: {
    type: String,
    required: true
  },
  fullDescription: {
    type: String,
    required: true
  },
  features: [String],
  benefits: [String],
  specifications: {
    type: Map,
    of: String
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      alt: String,
      isPrimary: {
        type: Boolean,
        default: false
      }
    }
  ],
  dimensions: {
    minWidth: {
      type: Number,
      required: true
    },
    maxWidth: {
      type: Number,
      required: true
    },
    minHeight: {
      type: Number,
      required: true
    },
    maxHeight: {
      type: Number,
      required: true
    }
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  priceGrid: [
    {
      width: Number,
      height: Number,
      price: Number
    }
  ],
  options: [
    {
      name: {
        type: String,
        required: true
      },
      displayName: String,
      description: String,
      isRequired: {
        type: Boolean,
        default: false
      },
      affectsPrice: {
        type: Boolean,
        default: false
      },
      values: [
        {
          value: {
            type: String,
            required: true
          },
          displayValue: String,
          description: String,
          image: String,
          priceAdjustment: {
            type: Number,
            default: 0
          }
        }
      ]
    }
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [String],
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  hasCustomOptions: {
    type: Boolean,
    default: true
  },
  inventory: {
    quantity: {
      type: Number,
      default: 0
    },
    reserved: {
      type: Number,
      default: 0
    },
    leadTime: {
      type: Number,
      default: 7 // days
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    isTrackingEnabled: {
      type: Boolean,
      default: false
    }
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [ReviewSchema],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from name
ProductSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }

  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  next();
});

// Calculate average rating when a review is added or modified
ProductSchema.methods.updateRatingStats = async function() {
  const reviews = this.reviews;

  if (reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = totalRating / reviews.length;
  this.numReviews = reviews.length;
};

// Create model from schema
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
