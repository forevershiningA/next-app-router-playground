/**
 * Product utilities for mapping product IDs to products and generating slugs
 */

import { data } from '#/app/_internal/_data';

const { products } = data;

export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
}

/**
 * Get product by ID
 */
export function getProductFromId(productId: number | string): Product | null {
  const id = String(productId);
  return products.find(p => p.id === id) || null;
}

/**
 * Generate URL-friendly slug from product name
 */
export function getProductSlug(product: Product): string {
  return product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get product type from product name
 */
export function getProductType(product: Product): 'headstone' | 'plaque' | 'monument' {
  const name = product.name.toLowerCase();
  
  if (name.includes('headstone') || name.includes('mini headstone')) {
    return 'headstone';
  } else if (name.includes('monument')) {
    return 'monument';
  } else {
    return 'plaque';
  }
}

/**
 * Get product type category (for better categorization)
 */
export function getProductTypeCategory(product: Product): string {
  const type = getProductType(product);
  const name = product.name.toLowerCase();
  
  // Specific product categories
  if (name.includes('bronze')) return 'bronze-plaque';
  if (name.includes('stainless steel')) return 'stainless-steel-plaque';
  if (name.includes('full colour') || name.includes('full color')) return 'full-colour-plaque';
  if (name.includes('traditional engraved') && type === 'plaque') return 'traditional-plaque';
  if (name.includes('traditional engraved') && type === 'headstone') return 'traditional-headstone';
  if (name.includes('laser-etched') && name.includes('colour')) return 'laser-colour-plaque';
  if (name.includes('laser-etched') && type === 'headstone') return 'laser-headstone';
  if (name.includes('laser-etched') && type === 'plaque') return 'laser-plaque';
  if (name.includes('monument')) return 'monument';
  
  return type;
}

/**
 * Map of product IDs to their types for quick lookup
 */
export const PRODUCT_TYPE_MAP: Record<string, 'headstone' | 'plaque' | 'monument'> = {
  '4': 'headstone',   // Laser-etched Black Granite Headstone
  '5': 'plaque',      // Bronze Plaque
  '22': 'headstone',  // Laser-etched Black Granite Mini Headstone
  '30': 'plaque',     // Laser-etched Black Granite Colour
  '32': 'plaque',     // Full Colour Plaque
  '34': 'plaque',     // Traditional Engraved Plaque
  '52': 'plaque',     // YAG Lasered Stainless Steel Plaque
  '124': 'headstone', // Traditional Engraved Headstone
  '100': 'monument',  // Laser-etched Black Granite Full Monument
  '101': 'monument',  // Traditional Engraved Full Monument
};

/**
 * Get product type directly from ID (faster lookup)
 */
export function getProductTypeFromId(productId: number | string): 'headstone' | 'plaque' | 'monument' | null {
  const id = String(productId);
  return PRODUCT_TYPE_MAP[id] || null;
}
