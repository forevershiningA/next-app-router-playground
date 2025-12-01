// lib/template-loader.ts
// Helper functions to load SEO templates into the headstone store

import { useHeadstoneStore } from './headstone-store';
import {
  getDedicationTemplate,
  getMemorialTemplate,
  type DedicationTemplate,
  type MemorialTemplate,
} from './seo-templates';

/**
 * Load a dedication template into the store
 * Call this when user lands on a template URL
 */
export function loadDedicationTemplate(venueSlug: string, inscriptionSlug: string) {
  const template = getDedicationTemplate(venueSlug, inscriptionSlug);
  
  if (!template) {
    console.warn(`Template not found: ${venueSlug}/${inscriptionSlug}`);
    return false;
  }

  // Get the store instance
  const store = useHeadstoneStore.getState();
  
  // Pre-populate the design with template data
  store.addInscriptionLine({
    text: template.venue,
    font: 'Times New Roman', // Default font, user can change
    color: '#8B7355', // Dark bronze color
    sizeMm: 80, // mm
    xPos: 0,
    yPos: 15, // mm
    rotationDeg: 0,
  });

  store.addInscriptionLine({
    text: template.inscription,
    font: 'Times New Roman',
    color: '#8B7355',
    sizeMm: 60, // mm - smaller than venue
    xPos: 0,
    yPos: 5, // mm
    rotationDeg: 0,
  });

  // Set appropriate size for bronze plaque
  store.setWidthMm(600);
  store.setHeightMm(400);

  console.log(`✅ Loaded template: ${template.id}`);
  return true;
}

/**
 * Load a memorial headstone template into the store
 */
export function loadMemorialTemplate(params: {
  nameSlug?: string;
  epitaphSlug?: string;
  shape?: string;
  material?: string;
}) {
  const template = getMemorialTemplate(params);
  
  if (!template) {
    console.warn(`Memorial template not found`);
    return false;
  }

  const store = useHeadstoneStore.getState();
  
  // Set shape if provided
  if (template.shape) {
    store.setShapeUrl(`/shapes/headstones/${template.shape}.svg`);
  }

  // Set material if provided
  if (template.material) {
    const materialMap: Record<string, string> = {
      'imperial-red': 'Imperial-Red.webp',
      'blue-pearl': 'Blue-Pearl.webp',
      'emerald-pearl': 'Emerald-Pearl.webp',
      'african-black': 'African-Black.webp',
      'balmoral-red': 'Balmoral-Red.webp',
    };
    const materialFile = materialMap[template.material];
    if (materialFile) {
      store.setHeadstoneMaterialUrl(`/textures/forever/l/${materialFile}`);
    }
  }

  // Pre-populate inscriptions
  store.addInscriptionLine({
    text: template.nameExample,
    font: 'Times New Roman',
    color: '#000000',
    sizeMm: 100,
    xPos: 0,
    yPos: 20,
    rotationDeg: 0,
  });

  if (template.dates) {
    store.addInscriptionLine({
      text: template.dates,
      font: 'Times New Roman',
      color: '#000000',
      sizeMm: 70,
      xPos: 0,
      yPos: 10,
      rotationDeg: 0,
    });
  }

  if (template.epitaph) {
    store.addInscriptionLine({
      text: template.epitaph,
      font: 'Brush Script',
      color: '#000000',
      sizeMm: 60,
      xPos: 0,
      yPos: -5,
      rotationDeg: 0,
    });
  }

  // Set appropriate size for headstone
  store.setWidthMm(900);
  store.setHeightMm(1200);

  console.log(`✅ Loaded memorial template: ${template.id}`);
  return true;
}

/**
 * Load a material + shape combination
 */
export function loadMaterialShapeCombo(materialSlug: string, shapeSlug?: string) {
  const store = useHeadstoneStore.getState();

  // Material mapping
  const materialMap: Record<string, string> = {
    'imperial-red': 'Imperial-Red.webp',
    'blue-pearl': 'Blue-Pearl.webp',
    'emerald-pearl': 'Emerald-Pearl.webp',
    'african-black': 'African-Black.webp',
    'balmoral-red': 'Balmoral-Red.webp',
    'chinese-calca': 'Chinese-Calca.webp',
    'white-carrara': 'White-Carrara.webp',
  };

  const materialFile = materialMap[materialSlug];
  if (materialFile) {
    store.setHeadstoneMaterialUrl(`/textures/forever/l/${materialFile}`);
  }

  // Shape mapping
  if (shapeSlug) {
    const shapeMap: Record<string, string> = {
      'serpentine': 'serpentine.svg',
      'peak': 'peak.svg',
      'gothic': 'gable.svg', // Using gable for gothic
      'square': 'square.svg',
      'curved-top': 'curved_top.svg',
      'half-round': 'half_round.svg',
    };

    const shapeFile = shapeMap[shapeSlug];
    if (shapeFile) {
      store.setShapeUrl(`/shapes/headstones/${shapeFile}`);
    }
  }

  console.log(`✅ Loaded material: ${materialSlug}, shape: ${shapeSlug || 'none'}`);
  return true;
}

/**
 * Parse template ID from URL params and load appropriate template
 * Use this in your page components
 */
export function loadTemplateFromParams(searchParams: URLSearchParams) {
  const templateId = searchParams.get('template');
  
  if (!templateId) {
    return false;
  }

  // Dedication templates start with 'bd-'
  if (templateId.startsWith('bd-')) {
    // Extract venue and inscription from URL or template ID
    // This is a simplified version - you'd need to store the mapping
    console.log(`Loading dedication template: ${templateId}`);
    return true;
  }

  // Memorial templates start with 'mh-'
  if (templateId.startsWith('mh-')) {
    console.log(`Loading memorial template: ${templateId}`);
    return true;
  }

  return false;
}

/**
 * Generate URL for a template
 * Useful for navigation and linking
 */
export function generateTemplateURL(template: DedicationTemplate | MemorialTemplate): string {
  if ('venueSlug' in template) {
    // Dedication template
    return `/select-product/bronze-plaque/dedication/${template.venueSlug}/${template.inscriptionSlug}`;
  } else {
    // Memorial template
    return `/select-product/laser-etched-black-granite-headstone/memorial/${template.nameSlug}/${template.epitaphSlug}`;
  }
}

/**
 * Client-side hook to load template on mount
 * Use this in your page components
 */
export function useTemplateLoader(
  type: 'dedication' | 'memorial' | 'material-shape',
  params: Record<string, string>
) {
  // This should be called in a useEffect on the client side
  if (typeof window === 'undefined') {
    return;
  }

  if (type === 'dedication') {
    loadDedicationTemplate(params.venue, params.inscription);
  } else if (type === 'memorial') {
    loadMemorialTemplate({
      nameSlug: params.name,
      epitaphSlug: params.epitaph,
      shape: params.shape,
      material: params.material,
    });
  } else if (type === 'material-shape') {
    loadMaterialShapeCombo(params.material, params.shape);
  }
}

/**
 * Helper to extract slug from name
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Helper to format display name from slug
 */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
