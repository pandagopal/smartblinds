// Product model and types
export interface ProductOption {
  name: string;
  values: string[];
  selectedValue: string;
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
}

export interface ProductAttributes {
  color?: string;
  material?: string;
  opacity?: string;
  style?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  cordless?: boolean;
  motorized?: boolean;
  roomDarkening?: boolean;
  energyEfficient?: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  additionalImages?: string[];
  category: string;
  categoryId: number;
  features: string[];
  specs: ProductSpec[];
  options: ProductOption[];
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  special: boolean;
  price?: number;
  salePrice?: number;
  basePrice?: number;
  inStock?: boolean;
  createdAt?: string;
  attributes?: ProductAttributes;
}

export function getProductBasePrice(product: Product): number {
  // Simplified pricing logic
  return product.basePrice || 79.99;
}

export function getProductPrice(product: Product, width?: number, height?: number, options?: Record<string, string>): number {
  const basePrice = getProductBasePrice(product);
  // Apply any size multipliers
  let price = basePrice;

  if (width && height) {
    // Simple size-based pricing - larger sizes cost more
    const sizeMultiplier = (width * height) / (24 * 36); // Base size is 24x36
    price = price * Math.max(1, sizeMultiplier);
  }

  // Apply options pricing adjustments
  if (options) {
    // Premium options like motorized controls add to the price
    if (options['Control Type'] === 'Motorized') {
      price += 50;
    } else if (options['Control Type'] === 'Cordless') {
      price += 20;
    }

    // Blackout material costs more
    if (options['Opacity'] === 'Blackout') {
      price += 15;
    }
  }

  return Math.round(price * 100) / 100;
}

// Add product attributes for filtering purposes
export function addProductAttributes(product: Product): Product {
  // This is a helper function that can be used to ensure products have attribute data
  if (!product.attributes) {
    // If no attributes, create default ones based on product properties
    const defaultAttributes: ProductAttributes = {
      color: product.options.find(o => o.name.toLowerCase() === 'color')?.selectedValue || 'White',
      material: product.specs.find(s => s.name.toLowerCase().includes('material'))?.value ||
                (product.category.includes('Wood') ? 'Wood' : 'Fabric'),
      opacity: product.specs.find(s => s.name.toLowerCase().includes('opacity'))?.value ||
              (product.title.toLowerCase().includes('blackout') ? 'Blackout' : 'Light Filtering'),
      style: product.category || 'Classic',
      cordless: product.title.toLowerCase().includes('cordless'),
      motorized: product.title.toLowerCase().includes('motorized'),
      roomDarkening: product.title.toLowerCase().includes('darkening'),
      energyEfficient: product.title.toLowerCase().includes('energy') || product.features.some(f => f.toLowerCase().includes('energy'))
    };

    return {
      ...product,
      attributes: defaultAttributes
    };
  }

  return product;
}

// Sample product data with attributes for filtering
export const SAMPLE_PRODUCTS: Product[] = [
  // Cellular Shades (categoryId: 1)
  {
    id: "product-1",
    title: "Energy-Efficient Cellular Shades",
    description: "Honeycomb cellular shades that provide excellent insulation and energy efficiency while adding a clean, modern look to your windows.",
    image: "https://www.sunburstshutters.com/corporate/uploads/grabercellularshades22.jpg",
    additionalImages: [
      "https://ext.same-assets.com/2035588304/1457834125.jpeg",
      "https://ext.same-assets.com/2035588304/1457834125.jpeg",
      "https://ext.same-assets.com/2035588304/3581946532.jpeg"
    ],
    category: "Cellular Shades",
    categoryId: 1, // Match "Cellular Shades" from SAMPLE_CATEGORIES
    features: [
      "Unique honeycomb design traps air for superior insulation",
      "Helps reduce energy costs year-round",
      "Available in single-cell or double-cell options",
      "Offers excellent sound absorption",
      "Clean, streamlined appearance"
    ],
    specs: [
      { name: "Material", value: "Polyester Fabric" },
      { name: "Cell Size", value: "3/8 inch or 3/4 inch" },
      { name: "Cell Construction", value: "Single or Double Cell" },
      { name: "Light Control", value: "Light Filtering to Blackout" },
      { name: "Privacy", value: "Excellent" },
      { name: "Warranty", value: "Limited Lifetime" }
    ],
    options: [
      {
        name: "Room Type",
        values: ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office"],
        selectedValue: "Living Room"
      },
      {
        name: "Color",
        values: ["White", "Snow", "Alabaster", "Sand", "Gray", "Slate"],
        selectedValue: "White"
      },
      {
        name: "Mount Type",
        values: ["Inside Mount", "Outside Mount"],
        selectedValue: "Inside Mount"
      },
      {
        name: "Cell Type",
        values: ["Single Cell", "Double Cell"],
        selectedValue: "Single Cell"
      },
      {
        name: "Opacity",
        values: ["Light Filtering", "Room Darkening", "Blackout"],
        selectedValue: "Light Filtering"
      },
      {
        name: "Control Type",
        values: ["Standard Cord", "Cordless", "Motorized"],
        selectedValue: "Standard Cord"
      },
      {
        name: "Control Side",
        values: ["Left", "Right", "Center"],
        selectedValue: "Left"
      },
      {
        name: "Valance Type",
        values: ["Standard", "Deluxe", "None"],
        selectedValue: "Standard"
      },
      {
        name: "Bottom Bar Style",
        values: ["Standard", "Contoured", "Fabric Wrapped"],
        selectedValue: "Standard"
      },
      {
        name: "Light Blocker",
        values: ["None", "Side Channels", "Full Blackout Kit"],
        selectedValue: "None"
      }
    ],
    rating: 4.7,
    reviewCount: 1247,
    reviews: [],
    special: true,
    basePrice: 89.99,
    createdAt: "2023-04-10T08:00:00",
    attributes: {
      color: "White",
      material: "Polyester Fabric",
      opacity: "Light Filtering",
      style: "Cellular",
      cordless: false,
      motorized: false,
      roomDarkening: false,
      energyEfficient: true
    }
  },
  // Premium Day/Night Cellular Shades
  {
    id: "product-2",
    title: "Premium Day/Night Cellular Shades",
    description: "Versatile day/night cellular shades feature dual layers that let you adjust between light filtering and room darkening.",
    image: "https://ext.same-assets.com/2035588304/3456789012.jpeg",
    additionalImages: [
      "https://ext.same-assets.com/2035588304/3456789123.jpeg",
      "https://ext.same-assets.com/2035588304/3456789234.jpeg"
    ],
    category: "Cellular Shades",
    categoryId: 1,
    features: [
      "Two shades in one with light filtering and room darkening layers",
      "Operate each shade independently for complete light control",
      "Superior energy efficiency with double-cell construction",
      "Cordless lift option for enhanced safety",
      "Premium fabric with refined texture"
    ],
    specs: [
      { name: "Material", value: "Premium Polyester" },
      { name: "Cell Size", value: "1/2 inch" },
      { name: "Cell Construction", value: "Double Cell" },
      { name: "Light Control", value: "Dual Opacity System" },
      { name: "Privacy", value: "Superior" },
      { name: "Warranty", value: "Limited Lifetime" }
    ],
    options: [
      {
        name: "Room Type",
        values: ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office"],
        selectedValue: "Bedroom"
      },
      {
        name: "Color",
        values: ["White", "Cream", "Beige", "Gray", "Charcoal", "Navy"],
        selectedValue: "Cream"
      },
      {
        name: "Mount Type",
        values: ["Inside Mount", "Outside Mount"],
        selectedValue: "Inside Mount"
      },
      {
        name: "Control Type",
        values: ["Standard Cord", "Cordless", "Motorized"],
        selectedValue: "Cordless"
      },
      {
        name: "Control Side",
        values: ["Left", "Right", "Center"],
        selectedValue: "Left"
      },
      {
        name: "Valance Type",
        values: ["Standard", "Deluxe", "None"],
        selectedValue: "Deluxe"
      },
      {
        name: "Bottom Bar Style",
        values: ["Standard", "Contoured", "Fabric Wrapped"],
        selectedValue: "Contoured"
      },
      {
        name: "Light Blocker",
        values: ["None", "Side Channels", "Full Blackout Kit"],
        selectedValue: "Side Channels"
      }
    ],
    rating: 4.8,
    reviewCount: 836,
    reviews: [],
    special: true,
    basePrice: 139.99,
    createdAt: "2023-08-15T10:00:00",
    attributes: {
      color: "Cream",
      material: "Premium Polyester",
      opacity: "Room Darkening",
      style: "Day/Night",
      cordless: true,
      motorized: false,
      roomDarkening: true,
      energyEfficient: true
    }
  },
  // Cordless Light Filtering Cellular Shades
  {
    id: "product-3",
    title: "Cordless Light Filtering Cellular Shades",
    description: "Child-safe cordless cellular shades that gently filter light while providing privacy and energy efficiency.",
    image: "https://ext.same-assets.com/2035588304/4567890123.jpeg",
    additionalImages: [
      "https://ext.same-assets.com/2035588304/4567890234.jpeg",
      "https://ext.same-assets.com/2035588304/4567890345.jpeg"
    ],
    category: "Cellular Shades",
    categoryId: 1,
    features: [
      "Cordless design for enhanced child and pet safety",
      "Smooth and easy operation with no dangling cords",
      "Light filtering fabric for soft, diffused natural light",
      "Excellent privacy without sacrificing natural light",
      "Energy-efficient honeycomb design"
    ],
    specs: [
      { name: "Material", value: "Spun Lace Fabric" },
      { name: "Cell Size", value: "3/8 inch" },
      { name: "Cell Construction", value: "Single Cell" },
      { name: "Light Control", value: "Light Filtering" },
      { name: "Privacy", value: "Very Good" },
      { name: "Warranty", value: "10 Year Limited" }
    ],
    options: [
      {
        name: "Color",
        values: ["White", "Ivory", "Sand", "Linen", "Stone"],
        selectedValue: "Ivory"
      },
      {
        name: "Mount Type",
        values: ["Inside Mount", "Outside Mount"],
        selectedValue: "Inside Mount"
      }
    ],
    rating: 4.6,
    reviewCount: 689,
    reviews: [],
    special: false,
    basePrice: 49.99,
    salePrice: 59.99,
    createdAt: "2023-11-05T09:30:00",
    attributes: {
      color: "Ivory",
      material: "Spun Lace Fabric",
      opacity: "Light Filtering",
      style: "Cellular",
      cordless: true,
      motorized: false,
      roomDarkening: false,
      energyEfficient: true
    }
  },
  // Premium Faux Wood Blinds
  {
    id: "product-4",
    title: "Premium Faux Wood Blinds",
    description: "Classic faux wood blinds that combine the beautiful look of real wood with enhanced durability and moisture resistance.",
    image: "https://ext.same-assets.com/2035588304/5678901234.jpeg",
    additionalImages: [
      "https://ext.same-assets.com/2035588304/5678901345.jpeg",
      "https://ext.same-assets.com/2035588304/5678901456.jpeg"
    ],
    category: "Faux Wood Blinds",
    categoryId: 2,
    features: [
      "Authentic wood look with superior durability",
      "Resistant to warping, fading, and moisture damage",
      "Perfect for kitchens, bathrooms, and high-humidity areas",
      "Wider slats that let in more light when open",
      "Easy to clean and maintain"
    ],
    specs: [
      { name: "Material", value: "PVC/Composite Wood" },
      { name: "Slat Size", value: "2 inch" },
      { name: "Headrail", value: "Steel Valance" },
      { name: "Light Control", value: "Excellent" },
      { name: "Privacy", value: "Excellent" },
      { name: "Warranty", value: "5 Year Limited" }
    ],
    options: [
      {
        name: "Color",
        values: ["White", "Alabaster", "Mocha", "Golden Oak", "Mahogany"],
        selectedValue: "Golden Oak"
      },
      {
        name: "Mount Type",
        values: ["Inside Mount", "Outside Mount"],
        selectedValue: "Inside Mount"
      },
      {
        name: "Control Type",
        values: ["Standard Cord", "Cordless", "Smart Home Compatible"],
        selectedValue: "Standard Cord"
      }
    ],
    rating: 4.5,
    reviewCount: 512,
    reviews: [],
    special: false,
    basePrice: 59.99,
    createdAt: "2023-06-20T11:45:00",
    attributes: {
      color: "Golden Oak",
      material: "PVC/Composite Wood",
      opacity: "Room Darkening",
      style: "Horizontal Blinds",
      cordless: false,
      motorized: false,
      roomDarkening: true,
      energyEfficient: false
    }
  },
  // Motorized Blackout Roller Shades
  {
    id: "product-5",
    title: "Motorized Blackout Roller Shades",
    description: "Smart home compatible motorized roller shades with complete blackout capabilities for bedrooms and media rooms.",
    image: "https://ext.same-assets.com/2035588304/6789012345.jpeg",
    additionalImages: [
      "https://ext.same-assets.com/2035588304/6789012456.jpeg",
      "https://ext.same-assets.com/2035588304/6789012567.jpeg"
    ],
    category: "Roller Shades",
    categoryId: 3,
    features: [
      "100% blackout fabric blocks all light",
      "Whisper-quiet motorized operation",
      "Compatible with most smart home systems",
      "Control via remote, app, or voice commands",
      "Custom fit side channels prevent light leakage"
    ],
    specs: [
      { name: "Material", value: "Triple-Weave Blackout Fabric" },
      { name: "Thickness", value: "Heavy" },
      { name: "Battery Life", value: "1 Year" },
      { name: "Light Control", value: "Blackout" },
      { name: "Privacy", value: "Complete" },
      { name: "Warranty", value: "7 Year Limited" }
    ],
    options: [
      {
        name: "Color",
        values: ["White", "Gray", "Black", "Navy", "Burgundy"],
        selectedValue: "Black"
      },
      {
        name: "Mount Type",
        values: ["Inside Mount", "Outside Mount"],
        selectedValue: "Outside Mount"
      },
      {
        name: "Smart Home System",
        values: ["None", "Amazon Alexa", "Google Home", "Apple HomeKit"],
        selectedValue: "Amazon Alexa"
      }
    ],
    rating: 4.9,
    reviewCount: 324,
    reviews: [],
    special: true,
    basePrice: 199.99,
    createdAt: "2024-01-15T14:00:00",
    attributes: {
      color: "Black",
      material: "Triple-Weave Blackout Fabric",
      opacity: "Blackout",
      style: "Roller",
      cordless: true,
      motorized: true,
      roomDarkening: true,
      energyEfficient: false
    }
  },
  // Bamboo Woven Wood Shades
  {
    id: "product-6",
    title: "Bamboo Woven Wood Shades",
    description: "Natural bamboo and woven wood shades that bring organic texture and warmth to any room.",
    image: "https://ext.same-assets.com/2035588304/7890123456.jpeg",
    additionalImages: [
      "https://ext.same-assets.com/2035588304/7890123567.jpeg",
      "https://ext.same-assets.com/2035588304/7890123678.jpeg"
    ],
    category: "Woven Wood Shades",
    categoryId: 4,
    features: [
      "Sustainably harvested natural bamboo and wood materials",
      "Each shade has unique natural variations in color and texture",
      "Optional privacy liner available",
      "Adds natural warmth and texture to any décor",
      "Environmentally friendly option"
    ],
    specs: [
      { name: "Material", value: "Natural Bamboo/Wood" },
      { name: "Weave", value: "Medium" },
      { name: "Light Control", value: "Light Filtering" },
      { name: "Privacy", value: "Good" },
      { name: "Warranty", value: "3 Year Limited" }
    ],
    options: [
      {
        name: "Color",
        values: ["Natural", "Caramel", "Ebony", "Tortoise"],
        selectedValue: "Natural"
      },
      {
        name: "Mount Type",
        values: ["Inside Mount", "Outside Mount"],
        selectedValue: "Inside Mount"
      },
      {
        name: "Control Type",
        values: ["Standard Cord", "Cordless"],
        selectedValue: "Standard Cord"
      },
      {
        name: "Privacy Liner",
        values: ["None", "Light Filtering", "Blackout"],
        selectedValue: "None"
      }
    ],
    rating: 4.4,
    reviewCount: 278,
    reviews: [],
    special: false,
    basePrice: 89.99,
    salePrice: 109.99,
    createdAt: "2023-09-08T09:15:00",
    attributes: {
      color: "Natural",
      material: "Natural Bamboo/Wood",
      opacity: "Light Filtering",
      style: "Woven Wood",
      cordless: false,
      motorized: false,
      roomDarkening: false,
      energyEfficient: true
    }
  }
];
