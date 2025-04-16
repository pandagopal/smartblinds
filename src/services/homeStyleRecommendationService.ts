import { Product } from '../models/Product';

// Types for home elements
export interface HomeElement {
  type: 'wall' | 'couch' | 'flooring';
  color: string;
  style?: string;
  material?: string;
  description?: string;
  image?: string;
}

export interface Recommendation {
  productId: string;
  score: number;
  reason: string;
  color?: string;
  opacity?: string;
  style?: string;
}

// Get user's saved home elements from localStorage
export const getSavedHomeElements = (): HomeElement[] => {
  try {
    const saved = localStorage.getItem('userHomeElements');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading saved home elements:', error);
    return [];
  }
};

// Save a home element to localStorage
export const saveHomeElement = (element: HomeElement): HomeElement[] => {
  try {
    const existingElements = getSavedHomeElements();

    // Check if element of same type exists
    const filtered = existingElements.filter(el => el.type !== element.type);

    // Add new element
    const updatedElements = [...filtered, element];
    localStorage.setItem('userHomeElements', JSON.stringify(updatedElements));
    return updatedElements;
  } catch (error) {
    console.error('Error saving home element:', error);
    return getSavedHomeElements();
  }
};

// Remove a home element
export const removeHomeElement = (elementType: 'wall' | 'couch' | 'flooring'): HomeElement[] => {
  try {
    const existingElements = getSavedHomeElements();
    const updatedElements = existingElements.filter(el => el.type !== elementType);
    localStorage.setItem('userHomeElements', JSON.stringify(updatedElements));
    return updatedElements;
  } catch (error) {
    console.error('Error removing home element:', error);
    return getSavedHomeElements();
  }
};

// Color matching algorithms
const getColorSimilarity = (color1: string, color2: string): number => {
  // In a real-world scenario, this would use proper color distance algorithms
  // like CIE Lab Delta E calculations, but for simplicity:

  const colorMap: Record<string, number[]> = {
    'white': [255, 255, 255],
    'cream': [255, 253, 208],
    'beige': [245, 245, 220],
    'tan': [210, 180, 140],
    'brown': [150, 75, 0],
    'gray': [128, 128, 128],
    'grey': [128, 128, 128],
    'black': [0, 0, 0],
    'blue': [0, 0, 255],
    'navy': [0, 0, 128],
    'red': [255, 0, 0],
    'maroon': [128, 0, 0],
    'green': [0, 128, 0],
    'yellow': [255, 255, 0],
    'orange': [255, 165, 0],
    'purple': [128, 0, 128],
    'pink': [255, 192, 203]
  };

  // Normalize color names
  const normalizeColor = (color: string): string => {
    return color.toLowerCase().trim();
  };

  const normalizedColor1 = normalizeColor(color1);
  const normalizedColor2 = normalizeColor(color2);

  // If exact match
  if (normalizedColor1 === normalizedColor2) {
    return 1;
  }

  // If both colors are in our mapping, calculate similarity
  if (colorMap[normalizedColor1] && colorMap[normalizedColor2]) {
    const rgb1 = colorMap[normalizedColor1];
    const rgb2 = colorMap[normalizedColor2];

    // Simple Euclidean distance (not perceptually accurate, but works for demo)
    const distance = Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );

    // Normalize to a similarity score between 0 and 1
    const maxDistance = Math.sqrt(Math.pow(255, 2) * 3); // Max possible distance in RGB space
    const similarity = 1 - (distance / maxDistance);
    return similarity;
  }

  // If color isn't in our map, use string matching as fallback
  return normalizedColor1.includes(normalizedColor2) ||
         normalizedColor2.includes(normalizedColor1) ? 0.5 : 0;
};

// Style compatibility rules
const getStyleCompatibility = (homeStyle: string, productStyle: string): number => {
  // Map styles to groups
  const styleGroups: Record<string, string[]> = {
    'modern': ['contemporary', 'minimalist', 'sleek', 'urban'],
    'traditional': ['classic', 'conventional', 'timeless'],
    'rustic': ['farmhouse', 'country', 'cottage', 'vintage'],
    'industrial': ['loft', 'warehouse', 'raw'],
    'scandinavian': ['nordic', 'hygge', 'minimal'],
    'bohemian': ['eclectic', 'boho', 'artistic', 'colorful'],
    'coastal': ['beach', 'nautical', 'tropical'],
    'transitional': ['blend', 'balanced', 'contemporary', 'traditional']
  };

  // Normalize style names
  const normalizeStyle = (style: string): string => {
    return style.toLowerCase().trim();
  };

  const normalizedHomeStyle = normalizeStyle(homeStyle);
  const normalizedProductStyle = normalizeStyle(productStyle);

  // If exact match
  if (normalizedHomeStyle === normalizedProductStyle) {
    return 1;
  }

  // Check if styles are in the same group
  for (const [group, styles] of Object.entries(styleGroups)) {
    const homeInGroup = styles.includes(normalizedHomeStyle) || normalizedHomeStyle === group;
    const productInGroup = styles.includes(normalizedProductStyle) || normalizedProductStyle === group;

    if (homeInGroup && productInGroup) {
      return 0.8; // High compatibility within same group
    }
  }

  // Check compatible groups (simplified version)
  const compatibleGroups: Record<string, string[]> = {
    'modern': ['scandinavian', 'industrial', 'transitional'],
    'traditional': ['transitional', 'rustic'],
    'rustic': ['traditional', 'coastal'],
    'industrial': ['modern', 'rustic'],
    'scandinavian': ['modern', 'transitional'],
    'bohemian': ['eclectic', 'coastal'],
    'coastal': ['bohemian', 'traditional'],
    'transitional': ['modern', 'traditional']
  };

  // Find home style group
  let homeStyleGroup = '';
  for (const [group, styles] of Object.entries(styleGroups)) {
    if (styles.includes(normalizedHomeStyle) || normalizedHomeStyle === group) {
      homeStyleGroup = group;
      break;
    }
  }

  // Find product style group
  let productStyleGroup = '';
  for (const [group, styles] of Object.entries(styleGroups)) {
    if (styles.includes(normalizedProductStyle) || normalizedProductStyle === group) {
      productStyleGroup = group;
      break;
    }
  }

  // Check if the groups are compatible
  if (homeStyleGroup && productStyleGroup) {
    if (compatibleGroups[homeStyleGroup]?.includes(productStyleGroup)) {
      return 0.6; // Medium compatibility between compatible groups
    }
  }

  // Default low compatibility
  return 0.2;
};

// Generate recommendations based on home elements
export const generateRecommendations = (
  products: Product[],
  homeElements: HomeElement[]
): Recommendation[] => {
  if (!homeElements.length || !products.length) {
    return [];
  }

  const recommendations: Recommendation[] = [];

  // Weight factors for different elements
  const weights = {
    wall: 0.4,
    couch: 0.3,
    flooring: 0.3
  };

  // Process each product
  for (const product of products) {
    let totalScore = 0;
    let reasons: string[] = [];

    // Get recommendation for each home element
    for (const element of homeElements) {
      let elementScore = 0;

      // Color matching with available product colors
      if (product.availableColors && product.availableColors.length > 0) {
        const colorScores = product.availableColors.map(productColor => {
          return getColorSimilarity(element.color, productColor);
        });

        // Get best matching color and its score
        const bestColorIndex = colorScores.indexOf(Math.max(...colorScores));
        const bestColor = product.availableColors[bestColorIndex];
        const colorScore = colorScores[bestColorIndex];

        if (colorScore > 0.7) {
          reasons.push(`${bestColor} blinds complement your ${element.type} color`);
        } else if (colorScore > 0.4) {
          reasons.push(`${bestColor} blinds harmonize with your ${element.type}`);
        }

        elementScore += colorScore;
      }

      // Style matching if available
      if (element.style && product.style) {
        const styleScore = getStyleCompatibility(element.style, product.style);
        elementScore += styleScore;

        if (styleScore > 0.7) {
          reasons.push(`Perfectly matches your ${element.style} ${element.type} style`);
        } else if (styleScore > 0.4) {
          reasons.push(`Complements your ${element.style} ${element.type}`);
        }
      }

      // Apply weight based on element type
      totalScore += elementScore * (weights[element.type] || 0.3);
    }

    // Normalize score to a 0-1 range
    totalScore = Math.min(totalScore, 1);

    // Add product to recommendations if score is above threshold
    if (totalScore > 0.4) {
      // Pick the top reason
      const topReason = reasons.length > 0 ? reasons[0] :
        `A good match for your home style`;

      recommendations.push({
        productId: product.id,
        score: totalScore,
        reason: topReason,
        color: product.availableColors && product.availableColors.length > 0 ?
          product.availableColors[0] : undefined,
        opacity: product.options.find(opt => opt.name === 'Opacity')?.selectedValue,
        style: product.style
      });
    }
  }

  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score);
};

// Get recommendations for a specific user
export const getUserRecommendations = (
  products: Product[],
  limit: number = 4
): { recommendations: Recommendation[], homeElements: HomeElement[] } => {
  const homeElements = getSavedHomeElements();
  const recommendations = generateRecommendations(products, homeElements);

  return {
    recommendations: recommendations.slice(0, limit),
    homeElements
  };
};
