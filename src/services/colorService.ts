/**
 * Define the interface for a color option
 */
export interface ColorOption {
  id: string;
  name: string;
  value: string;
  description?: string;
}

/**
 * Get available colors based on product type
 * @param productType The type of product (e.g., 'faux wood', 'cellular', etc.)
 * @returns Array of color options
 */
export function getAvailableColors(productType: string = 'faux wood'): ColorOption[] {
  // Default faux wood colors
  const fauxWoodColors: ColorOption[] = [
    { id: 'white', name: 'White', value: '#ffffff', description: 'Pure, bright white. Perfect for modern and contemporary spaces.' },
    { id: 'off_white', name: 'Off White', value: '#f5f5f0', description: 'Soft, warm white with a subtle cream undertone.' },
    { id: 'cream', name: 'Cream', value: '#FFF8DC', description: 'Warm, neutral tone that complements traditional décor.' },
    { id: 'tan', name: 'Tan', value: '#d2b48c', description: 'Classic light brown that coordinates with many décor styles.' },
    { id: 'gray', name: 'Gray', value: '#808080', description: 'Versatile neutral that works well in contemporary spaces.' },
    { id: 'brown', name: 'Brown', value: '#8b4513', description: 'Rich, deep brown for a traditional wood look.' },
    { id: 'golden_oak', name: 'Golden Oak', value: '#deb887', description: 'Warm golden brown resembling classic oak furniture.' },
    { id: 'walnut', name: 'Walnut', value: '#654321', description: 'Deep, rich brown with subtle grain patterns.' },
    { id: 'mahogany', name: 'Mahogany', value: '#800000', description: 'Rich reddish-brown resembling fine mahogany furniture.' },
  ];

  // Return different colors based on product type
  switch (productType.toLowerCase()) {
    case 'cellular':
      return [
        { id: 'white', name: 'White', value: '#ffffff' },
        { id: 'snow', name: 'Snow', value: '#fffafa' },
        { id: 'alabaster', name: 'Alabaster', value: '#f2f0e6' },
        { id: 'sand', name: 'Sand', value: '#c2b280' },
        { id: 'gray', name: 'Gray', value: '#808080' },
        { id: 'slate', name: 'Slate', value: '#708090' }
      ];
    case 'roller':
      return [
        { id: 'white', name: 'White', value: '#ffffff' },
        { id: 'cream', name: 'Cream', value: '#FFF8DC' },
        { id: 'gray', name: 'Gray', value: '#808080' },
        { id: 'charcoal', name: 'Charcoal', value: '#36454F' },
        { id: 'linen', name: 'Linen', value: '#FAF0E6' }
      ];
    case 'wood':
      return [
        { id: 'golden_oak', name: 'Golden Oak', value: '#deb887' },
        { id: 'espresso', name: 'Espresso', value: '#3c2f2f' },
        { id: 'cherry', name: 'Cherry', value: '#9a3324' },
        { id: 'pure_white', name: 'Pure White', value: '#ffffff' },
        { id: 'antique_white', name: 'Antique White', value: '#faebd7' }
      ];
    case 'woven wood':
      return [
        { id: 'natural', name: 'Natural', value: '#dfc9a9' },
        { id: 'tortoise', name: 'Tortoise', value: '#8b5a2b' },
        { id: 'caramel', name: 'Caramel', value: '#c68e17' },
        { id: 'java', name: 'Java', value: '#5a3a22' },
        { id: 'ebony', name: 'Ebony', value: '#302420' }
      ];
    case 'roman':
      return [
        { id: 'linen', name: 'Linen', value: '#FAF0E6' },
        { id: 'ivory', name: 'Ivory', value: '#FFFFF0' },
        { id: 'graphite', name: 'Graphite', value: '#474B4E' },
        { id: 'navy', name: 'Navy', value: '#000080' },
        { id: 'stone', name: 'Stone', value: '#928E85' }
      ];
    case 'faux wood':
    default:
      return fauxWoodColors;
  }
}

/**
 * Get the color value and name by color ID
 * @param colorId The ID of the color
 * @param productType The type of product (optional, helps find the right color set)
 * @returns The color option or null if not found
 */
export function getColorById(colorId: string, productType: string = 'faux wood'): ColorOption | null {
  const colors = getAvailableColors(productType);
  return colors.find(color => color.id === colorId) || null;
}
