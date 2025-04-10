const mongoose = require('mongoose');

const PriceRangeSchema = new mongoose.Schema({
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
  },
  basePrice: {
    type: Number,
    required: true
  },
  pricePerSquareInch: {
    type: Number,
    default: 0
  }
});

const OptionValueSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  priceAdjustment: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  image: String
});

const ProductOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: true
  },
  values: [OptionValueSchema],
  defaultValue: {
    type: String,
    required: true
  }
});

const ProductSpecSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

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
  title: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ProductSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  features: [{
    type: String,
    required: true
  }],
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  mainImage: {
    type: String,
    required: [true, 'Please add a main image']
  },
  images: [String],
  specs: [ProductSpecSchema],
  options: [ProductOptionSchema],
  priceRanges: [PriceRangeSchema],
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  special: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [ReviewSchema],
  numReviews: {
    type: Number,
    default: 0
  },
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
  },
  widthIncrement: {
    type: Number,
    default: 0.125
  },
  heightIncrement: {
    type: Number,
    default: 0.125
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate price based on dimensions and options
ProductSchema.methods.calculatePrice = function(width, height, selectedOptions = {}) {
  // Find the applicable price range
  const priceRange = this.priceRanges.find(range =>
    width >= range.minWidth &&
    width <= range.maxWidth &&
    height >= range.minHeight &&
    height <= range.maxHeight
  );

  if (!priceRange) {
    return this.basePrice; // Fallback to base price if no range found
  }

  // Start with the base price from the range
  let price = priceRange.basePrice;

  // Add price per square inch if specified
  if (priceRange.pricePerSquareInch > 0) {
    const squareInches = width * height;
    price += squareInches * priceRange.pricePerSquareInch;
  }

  // Add option price adjustments
  for (const [optionName, selectedValue] of Object.entries(selectedOptions)) {
    const option = this.options.find(opt => opt.name === optionName);
    if (option) {
      const valueObj = option.values.find(val => val.value === selectedValue);
      if (valueObj && valueObj.priceAdjustment) {
        price += valueObj.priceAdjustment;
      }
    }
  }

  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('Product', ProductSchema);
