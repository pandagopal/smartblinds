export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  order: number;
  isActive: boolean;
}

// Sample category data
export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Cellular Shades",
    slug: "cellular-shades",
    image: "https://ext.same-assets.com/2035588304/1164789503.jpeg",
    description: "Energy-efficient honeycomb design that traps air and helps insulate your home.",
    order: 1,
    isActive: true
  },
  {
    id: 2,
    name: "Faux Wood Blinds",
    slug: "faux-wood-blinds",
    image: "https://ext.same-assets.com/2035588304/2318792146.jpeg",
    description: "Get the look of real wood at a fraction of the cost with moisture-resistant faux wood blinds.",
    order: 2,
    isActive: true
  },
  {
    id: 3,
    name: "Roller Shades",
    slug: "roller-shades",
    image: "https://ext.same-assets.com/2035588304/3952014568.jpeg",
    description: "Clean, simple window coverings available in a variety of fabrics and opacities.",
    order: 3,
    isActive: true
  },
  {
    id: 4,
    name: "Woven Wood Shades",
    slug: "woven-wood-shades",
    image: "https://ext.same-assets.com/2035588304/1489675324.jpeg",
    description: "Natural, eco-friendly window coverings made from bamboo, reeds, and grasses.",
    order: 4,
    isActive: true
  },
  {
    id: 5,
    name: "Roman Shades",
    slug: "roman-shades",
    image: "https://ext.same-assets.com/2035588304/3075921648.jpeg",
    description: "Soft fabric shades that fold up neatly when raised, adding elegance to any room.",
    order: 5,
    isActive: true
  },
  {
    id: 6,
    name: "Wood Blinds",
    slug: "wood-blinds",
    image: "https://ext.same-assets.com/2035588304/4152674893.jpeg",
    description: "Classic, real wood blinds that add warmth and style to your home.",
    order: 6,
    isActive: true
  }
];
