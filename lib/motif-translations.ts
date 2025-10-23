/**
 * Translation utilities for motif categories
 * Maps motif category names to their translated strings from XML
 */

// This will be populated by the language system
// For now, we'll use a static mapping based on XML translations
export const motifTranslations: Record<string, string> = {
  'AQUATIC': 'Aquatic',
  'BIRDS': 'Birds',
  'BUTTERFLIES': 'Butterflies',
  'CATS': 'Cats',
  'DOGS': 'Dogs',
  'FARM_ANIMAL': 'Farm Animals',
  'HORSES': 'Horses',
  'INSECTS': 'Insects',
  'MYSTICAL_ANIMALS': 'Mystical Animals',
  'PREHISTORIC': 'Prehistoric',
  'REPTILES': 'Reptiles',
  'WORLD_ANIMALS': 'World Animals',
  'AUS_WILDLIFE': 'Australian Wildlife',
  'AUS_FLORA': 'Australian Flora',
  'ARCHITECTURAL': 'Architectural',
  'ARROW': 'Arrows',
  'BORDERS': 'Borders',
  'CARTOONS_AND_ANIMALS': 'Cartoons',
  'CORNERS': 'Corners',
  'CHILDREN_TOYS': 'Children\'s Toys',
  'FLORISH': 'Florish',
  'FLOURISHES': 'Flourishes',
  'FLOWER_INSERTS': 'Flower Inserts',
  'FOOD_AND_DRINK': 'Food & Drink',
  'HEARTS': 'Hearts',
  'HISTORY': 'History',
  'HOLIDAY': 'Holiday',
  'HOUSEHOLD_ITEMS': 'Household Items',
  'ISLANDER': 'Islander',
  'ICONIC_PLACES': 'Iconic Places',
  'MOON_AND_STARS': 'Moon & Stars',
  'MUSIC_AND_DANCE': 'Music & Dance',
  'NAUTICLE': 'Nautical',
  'OFFICIAL': 'Official',
  'PETS': 'Pets',
  'PLANTS_AND_TREES': 'Plants & Trees',
  'RELIGIOUS': 'Religious',
  'SHAPES_AND_PATTERNS': 'Shapes & Patterns',
  'SKULLS_AND_WEAPONS': 'Skulls & Weapons',
  'SPORT_AND_FITNESS': 'Sport & Fitness',
  'SYMBOLS_ZODIAC': 'Symbols Zodiac',
  'TEXT': 'Text',
  'TOOLS_OFFICE': 'Tools Office',
  'TRIBAL': 'Tribal',
  'USA': 'USA',
  'VEHICLES': 'Vehicles',
  'ALL_MOTIFS': 'All Motifs',
};

/**
 * Get translated name for a motif category
 * @param key - The category key (e.g., "AQUATIC")
 * @returns Translated name or the key if not found
 */
export function getMotifCategoryName(key: string): string {
  // Try to use the global dyo.config.language if available
  if (typeof window !== 'undefined' && (window as any).dyo?.config?.language) {
    const translated = (window as any).dyo.config.language[key];
    if (translated) return translated;
  }
  
  // Fall back to static mapping
  return motifTranslations[key] || key;
}

/**
 * Get all motif category names with translations
 */
export function getAllMotifCategoryNames(): Array<{ key: string; name: string }> {
  return Object.entries(motifTranslations).map(([key, name]) => ({
    key,
    name: getMotifCategoryName(key),
  }));
}
