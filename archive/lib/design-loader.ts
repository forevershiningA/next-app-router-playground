// lib/design-loader.ts
// Load design data from split JSON files

export type Design = {
  id: string;
  name: string;
  product: string;
  shape: string;
  motif: string;
  width: number;
  height: number;
  price: number;
  preview: string;
  tags: string;
};

// Cache for loaded designs
const designCache: Map<string, Design[]> = new Map();

export async function getDesignsByProductType(productType: string): Promise<Design[]> {
  // Check cache first
  if (designCache.has(productType)) {
    return designCache.get(productType)!;
  }

  // Fetch from JSON file
  try {
    const response = await fetch(`/data/designs/${productType}.json`);
    if (!response.ok) {
      console.error(`Failed to load designs for ${productType}`);
      return [];
    }
    
    const designs = await response.json();
    designCache.set(productType, designs);
    return designs;
  } catch (error) {
    console.error(`Error loading designs for ${productType}:`, error);
    return [];
  }
}

export async function getDesignById(id: string, productType?: string): Promise<Design | null> {
  // If we know the product type, load just that file
  if (productType) {
    const designs = await getDesignsByProductType(productType);
    return designs.find(d => d.id === id) || null;
  }

  // Otherwise, search all product types
  const index = await fetch('/data/designs/index.json').then(r => r.json());
  
  for (const pt of index.productTypes) {
    const designs = await getDesignsByProductType(pt.type);
    const found = designs.find(d => d.id === id);
    if (found) return found;
  }
  
  return null;
}

export async function getAllProductTypes(): Promise<Array<{ type: string; count: number }>> {
  try {
    const response = await fetch('/data/designs/index.json');
    const index = await response.json();
    return index.productTypes;
  } catch (error) {
    console.error('Error loading product types:', error);
    return [];
  }
}
