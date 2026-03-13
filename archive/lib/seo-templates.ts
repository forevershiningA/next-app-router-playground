// lib/seo-templates.ts
// SEO templates and data for programmatic SEO

export type TemplateType = 'dedication' | 'memorial' | 'achievement' | 'tribute' | 'honor';

export type UseCase = {
  slug: string;
  name: string;
  keywords: string[];
  description: string;
};

export type DedicationTemplate = {
  id: string;
  venue: string;
  venueSlug: string;
  inscription: string;
  inscriptionSlug: string;
  category: 'education' | 'military' | 'civic' | 'sports' | 'arts' | 'religious' | 'corporate';
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
};

export type MemorialTemplate = {
  id: string;
  nameExample: string;
  nameSlug: string;
  dates: string;
  datesSlug: string;
  epitaph: string;
  epitaphSlug: string;
  shape?: string;
  material?: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
};

// Bronze Plaque Dedication Templates
export const bronzePlaqueDedications: DedicationTemplate[] = [
  {
    id: 'bd-001',
    venue: 'The Science Hall',
    venueSlug: 'the-science-hall',
    inscription: 'Knowledge is the seed of progress',
    inscriptionSlug: 'knowledge-is-the-seed-of-progress',
    category: 'education',
    metadata: {
      title: 'Bronze Plaque Dedication for The Science Hall - Knowledge is the Seed of Progress',
      description: 'Design a custom bronze dedication plaque for The Science Hall with the inspiring inscription "Knowledge is the seed of progress". Professional engraving, worldwide shipping.',
      keywords: ['bronze plaque', 'science hall dedication', 'educational plaque', 'bronze dedication', 'knowledge inscription'],
    },
  },
  {
    id: 'bd-002',
    venue: 'Memorial Garden',
    venueSlug: 'memorial-garden',
    inscription: 'In loving memory of those who served',
    inscriptionSlug: 'in-loving-memory-of-those-who-served',
    category: 'military',
    metadata: {
      title: 'Bronze Memorial Garden Plaque - In Loving Memory of Those Who Served',
      description: 'Create a dignified bronze plaque for your memorial garden honoring those who served. Custom engraving with military-grade quality.',
      keywords: ['memorial garden plaque', 'military memorial', 'bronze memorial', 'those who served', 'veteran memorial'],
    },
  },
  {
    id: 'bd-003',
    venue: 'Community Center',
    venueSlug: 'community-center',
    inscription: 'Built with pride for our community',
    inscriptionSlug: 'built-with-pride-for-our-community',
    category: 'civic',
    metadata: {
      title: 'Community Center Bronze Dedication Plaque - Built with Pride',
      description: 'Design a bronze dedication plaque for your community center. Honor builders and donors with professional engraving.',
      keywords: ['community center plaque', 'civic dedication', 'bronze plaque', 'community pride', 'building dedication'],
    },
  },
  {
    id: 'bd-004',
    venue: 'University Library',
    venueSlug: 'university-library',
    inscription: 'Gateway to wisdom and discovery',
    inscriptionSlug: 'gateway-to-wisdom-and-discovery',
    category: 'education',
    metadata: {
      title: 'University Library Bronze Plaque - Gateway to Wisdom and Discovery',
      description: 'Custom bronze dedication plaque for university libraries. Elegant design with premium engraving quality.',
      keywords: ['university library plaque', 'library dedication', 'bronze plaque', 'academic dedication', 'wisdom inscription'],
    },
  },
  {
    id: 'bd-005',
    venue: 'Athletic Field',
    venueSlug: 'athletic-field',
    inscription: 'Where champions are made',
    inscriptionSlug: 'where-champions-are-made',
    category: 'sports',
    metadata: {
      title: 'Athletic Field Bronze Dedication Plaque - Where Champions Are Made',
      description: 'Design a bronze plaque for sports facilities. Celebrate athletic excellence with weather-resistant bronze.',
      keywords: ['athletic field plaque', 'sports dedication', 'bronze plaque', 'champions inscription', 'stadium plaque'],
    },
  },
  {
    id: 'bd-006',
    venue: 'Art Gallery',
    venueSlug: 'art-gallery',
    inscription: 'Celebrating creativity and vision',
    inscriptionSlug: 'celebrating-creativity-and-vision',
    category: 'arts',
    metadata: {
      title: 'Art Gallery Bronze Dedication Plaque - Celebrating Creativity',
      description: 'Custom bronze plaque for art galleries and museums. Honor donors and artists with elegant engraving.',
      keywords: ['art gallery plaque', 'museum dedication', 'bronze plaque', 'creativity inscription', 'art dedication'],
    },
  },
  {
    id: 'bd-007',
    venue: 'Chapel',
    venueSlug: 'chapel',
    inscription: 'A sanctuary of peace and reflection',
    inscriptionSlug: 'a-sanctuary-of-peace-and-reflection',
    category: 'religious',
    metadata: {
      title: 'Chapel Bronze Dedication Plaque - Sanctuary of Peace',
      description: 'Design a bronze dedication plaque for chapels and places of worship. Reverent inscriptions with quality craftsmanship.',
      keywords: ['chapel plaque', 'religious dedication', 'bronze plaque', 'sanctuary inscription', 'worship dedication'],
    },
  },
  {
    id: 'bd-008',
    venue: 'Hospital Wing',
    venueSlug: 'hospital-wing',
    inscription: 'Dedicated to healing and hope',
    inscriptionSlug: 'dedicated-to-healing-and-hope',
    category: 'civic',
    metadata: {
      title: 'Hospital Wing Bronze Plaque - Dedicated to Healing and Hope',
      description: 'Custom bronze dedication plaque for hospitals and healthcare facilities. Honor donors and medical staff.',
      keywords: ['hospital plaque', 'medical dedication', 'bronze plaque', 'healing inscription', 'healthcare dedication'],
    },
  },
  {
    id: 'bd-009',
    venue: 'Corporate Headquarters',
    venueSlug: 'corporate-headquarters',
    inscription: 'Excellence through innovation',
    inscriptionSlug: 'excellence-through-innovation',
    category: 'corporate',
    metadata: {
      title: 'Corporate Headquarters Bronze Plaque - Excellence Through Innovation',
      description: 'Professional bronze dedication plaque for corporate buildings. Premium quality for business environments.',
      keywords: ['corporate plaque', 'business dedication', 'bronze plaque', 'innovation inscription', 'headquarters plaque'],
    },
  },
  {
    id: 'bd-010',
    venue: 'Veterans Memorial Park',
    venueSlug: 'veterans-memorial-park',
    inscription: 'Honoring courage, sacrifice, and service',
    inscriptionSlug: 'honoring-courage-sacrifice-and-service',
    category: 'military',
    metadata: {
      title: 'Veterans Memorial Park Bronze Plaque - Honoring Courage and Service',
      description: 'Design a bronze memorial plaque for veterans parks. Durable, weather-resistant tribute to military service.',
      keywords: ['veterans memorial', 'military plaque', 'bronze memorial', 'courage inscription', 'veteran tribute'],
    },
  },
];

// Memorial Headstone Templates
export const memorialHeadstoneTemplates: MemorialTemplate[] = [
  {
    id: 'mh-001',
    nameExample: 'John Smith',
    nameSlug: 'john-smith',
    dates: '1950-2023',
    datesSlug: '1950-2023',
    epitaph: 'Forever in our hearts',
    epitaphSlug: 'forever-in-our-hearts',
    shape: 'serpentine',
    material: 'imperial-red',
    metadata: {
      title: 'Memorial Headstone - Forever in Our Hearts',
      description: 'Design a beautiful memorial headstone with the inscription "Forever in our hearts". Customize in Imperial Red granite with Serpentine shape.',
      keywords: ['memorial headstone', 'forever in our hearts', 'imperial red granite', 'serpentine headstone', 'memorial inscription'],
    },
  },
  {
    id: 'mh-002',
    nameExample: 'Mary Johnson',
    nameSlug: 'mary-johnson',
    dates: '1945-2024',
    datesSlug: '1945-2024',
    epitaph: 'A life well lived',
    epitaphSlug: 'a-life-well-lived',
    shape: 'curved-top',
    material: 'blue-pearl',
    metadata: {
      title: 'Memorial Headstone - A Life Well Lived',
      description: 'Create a memorial headstone with "A life well lived" inscription. Blue Pearl granite with curved top design.',
      keywords: ['memorial headstone', 'life well lived', 'blue pearl granite', 'curved top headstone', 'memorial stone'],
    },
  },
  {
    id: 'mh-003',
    nameExample: 'Robert Williams',
    nameSlug: 'robert-williams',
    dates: '1940-2023',
    datesSlug: '1940-2023',
    epitaph: 'Beloved father and grandfather',
    epitaphSlug: 'beloved-father-and-grandfather',
    shape: 'peak',
    material: 'emerald-pearl',
    metadata: {
      title: 'Memorial Headstone - Beloved Father and Grandfather',
      description: 'Design a memorial headstone honoring a beloved father and grandfather. Emerald Pearl granite with Peak shape.',
      keywords: ['memorial headstone', 'father memorial', 'grandfather memorial', 'emerald pearl', 'peak headstone'],
    },
  },
  {
    id: 'mh-004',
    nameExample: 'Elizabeth Brown',
    nameSlug: 'elizabeth-brown',
    dates: '1955-2024',
    datesSlug: '1955-2024',
    epitaph: 'Gone but never forgotten',
    epitaphSlug: 'gone-but-never-forgotten',
    shape: 'gothic',
    material: 'african-black',
    metadata: {
      title: 'Memorial Headstone - Gone But Never Forgotten',
      description: 'Create a memorial headstone with "Gone but never forgotten" inscription. African Black granite with Gothic arch design.',
      keywords: ['memorial headstone', 'never forgotten', 'african black granite', 'gothic headstone', 'memorial tribute'],
    },
  },
  {
    id: 'mh-005',
    nameExample: 'James Davis',
    nameSlug: 'james-davis',
    dates: '1948-2023',
    datesSlug: '1948-2023',
    epitaph: 'In loving memory',
    epitaphSlug: 'in-loving-memory',
    shape: 'serpentine',
    material: 'balmoral-red',
    metadata: {
      title: 'Memorial Headstone - In Loving Memory',
      description: 'Design a memorial headstone with classic "In loving memory" inscription. Balmoral Red granite with Serpentine shape.',
      keywords: ['memorial headstone', 'in loving memory', 'balmoral red granite', 'serpentine memorial', 'granite headstone'],
    },
  },
];

// Product SEO data extension
export type ProductSEO = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  templateTypes: TemplateType[];
  useCases: UseCase[];
  h1: string;
  h2: string;
  featuredKeywords: string[];
};

export const productSEOData: Record<string, ProductSEO> = {
  'bronze-plaque': {
    slug: 'bronze-plaque',
    metaTitle: 'Bronze Plaque - Custom Dedication & Memorial Plaques | DYO',
    metaDescription: 'Design custom bronze plaques for dedications, memorials, and honors. Professional engraving, premium bronze, worldwide installation. Get instant pricing.',
    keywords: [
      'bronze plaque',
      'custom bronze plaque',
      'dedication plaque',
      'memorial plaque bronze',
      'bronze dedication plaque',
      'custom engraved bronze',
      'bronze memorial plaque',
      'dedication plaque bronze',
      'bronze plaque design',
      'engraved bronze plaque',
    ],
    templateTypes: ['dedication', 'memorial', 'achievement', 'honor'],
    useCases: [
      {
        slug: 'building-dedications',
        name: 'Building Dedications',
        keywords: ['building dedication', 'cornerstone plaque', 'foundation plaque'],
        description: 'Honor building openings, renovations, and dedications with custom bronze plaques.',
      },
      {
        slug: 'memorial-gardens',
        name: 'Memorial Gardens',
        keywords: ['memorial garden', 'remembrance garden', 'memorial park'],
        description: 'Create lasting tributes in memorial gardens and parks with weather-resistant bronze.',
      },
      {
        slug: 'donor-recognition',
        name: 'Donor Recognition',
        keywords: ['donor plaque', 'donor wall', 'recognition plaque'],
        description: 'Recognize donors and benefactors with elegant bronze plaques.',
      },
      {
        slug: 'sports-facilities',
        name: 'Sports Facilities',
        keywords: ['athletic dedication', 'sports plaque', 'stadium plaque'],
        description: 'Commemorate sports facilities, fields, and achievements with durable bronze.',
      },
    ],
    h1: 'Custom Bronze Plaques - Design Your Dedication or Memorial',
    h2: 'Professional Bronze Plaque Design & Engraving',
    featuredKeywords: ['bronze', 'dedication', 'memorial', 'custom engraving', 'professional'],
  },
  'laser-etched-black-granite-headstone': {
    slug: 'laser-etched-black-granite-headstone',
    metaTitle: 'Laser-Etched Black Granite Headstone - Custom Memorial Design | DYO',
    metaDescription: 'Design a laser-etched black granite headstone with photographic quality. Custom shapes, sizes, and inscriptions. Professional installation worldwide.',
    keywords: [
      'laser etched headstone',
      'black granite headstone',
      'laser etched black granite',
      'custom headstone',
      'granite memorial',
      'laser engraved headstone',
      'photo headstone',
      'laser etching headstone',
      'black granite memorial',
      'custom memorial headstone',
    ],
    templateTypes: ['memorial', 'tribute'],
    useCases: [
      {
        slug: 'photo-memorials',
        name: 'Photo Memorials',
        keywords: ['photo headstone', 'portrait headstone', 'laser etched photo'],
        description: 'Preserve memories with photographic-quality laser etching on black granite.',
      },
      {
        slug: 'family-memorials',
        name: 'Family Memorials',
        keywords: ['family headstone', 'family memorial', 'companion headstone'],
        description: 'Design companion headstones for family members with matching designs.',
      },
      {
        slug: 'custom-designs',
        name: 'Custom Designs',
        keywords: ['custom headstone', 'unique memorial', 'personalized headstone'],
        description: 'Create truly unique memorials with unlimited laser etching possibilities.',
      },
    ],
    h1: 'Laser-Etched Black Granite Headstone - Custom Memorial Design',
    h2: 'Photographic Quality Laser Etching on Premium Black Granite',
    featuredKeywords: ['laser-etched', 'black granite', 'photo quality', 'custom memorial'],
  },
  'traditional-engraved-headstone': {
    slug: 'traditional-engraved-headstone',
    metaTitle: 'Traditional Engraved Headstone - Classic Memorial Design | DYO',
    metaDescription: 'Design a traditional hand-engraved headstone. Classic carved appearance, multiple granite colors, timeless elegance. Custom shapes and inscriptions.',
    keywords: [
      'traditional headstone',
      'engraved headstone',
      'hand engraved memorial',
      'classic headstone',
      'carved headstone',
      'traditional memorial',
      'engraved granite headstone',
      'classic memorial stone',
      'hand carved headstone',
      'traditional grave marker',
    ],
    templateTypes: ['memorial', 'tribute'],
    useCases: [
      {
        slug: 'classic-memorials',
        name: 'Classic Memorials',
        keywords: ['classic headstone', 'traditional memorial', 'timeless design'],
        description: 'Timeless traditional designs that honor heritage and tradition.',
      },
      {
        slug: 'religious-memorials',
        name: 'Religious Memorials',
        keywords: ['religious headstone', 'christian memorial', 'faith memorial'],
        description: 'Traditional engravings with religious symbols and inscriptions.',
      },
    ],
    h1: 'Traditional Engraved Headstone - Classic Memorial Design',
    h2: 'Hand-Engraved Quality with Timeless Elegance',
    featuredKeywords: ['traditional', 'hand-engraved', 'classic', 'timeless'],
  },
};

// Material SEO data
export type MaterialSEO = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  properties: string[];
  bestFor: string[];
  h1: string;
};

export const materialSEOData: Record<string, MaterialSEO> = {
  'imperial-red': {
    slug: 'imperial-red',
    name: 'Imperial Red',
    metaTitle: 'Imperial Red Granite Headstone - Premium Red Granite Memorial | DYO',
    metaDescription: 'Design a headstone in Imperial Red granite. Rich red color, exceptional durability, available in all shapes and sizes. Custom engraving.',
    keywords: ['imperial red granite', 'red granite headstone', 'red memorial stone', 'imperial red memorial'],
    properties: ['Rich red color', 'Fine grain texture', 'Excellent durability', 'Weather resistant'],
    bestFor: ['Traditional memorials', 'Outdoor installations', 'Long-lasting tributes'],
    h1: 'Imperial Red Granite Headstone Material',
  },
  'blue-pearl': {
    slug: 'blue-pearl',
    name: 'Blue Pearl',
    metaTitle: 'Blue Pearl Granite Headstone - Elegant Blue Granite Memorial | DYO',
    metaDescription: 'Create a Blue Pearl granite headstone. Distinctive blue shimmer, premium Norwegian granite, all shapes available. Custom design.',
    keywords: ['blue pearl granite', 'blue granite headstone', 'blue memorial stone', 'norwegian granite'],
    properties: ['Blue shimmer effect', 'Norwegian origin', 'Premium quality', 'Unique appearance'],
    bestFor: ['Distinguished memorials', 'Modern designs', 'Elegant tributes'],
    h1: 'Blue Pearl Granite Headstone Material',
  },
  'emerald-pearl': {
    slug: 'emerald-pearl',
    name: 'Emerald Pearl',
    metaTitle: 'Emerald Pearl Granite Headstone - Green Granite Memorial | DYO',
    metaDescription: 'Design an Emerald Pearl granite headstone. Rich green color with pearl effect, Norwegian quality, custom shapes and sizes.',
    keywords: ['emerald pearl granite', 'green granite headstone', 'green memorial stone', 'pearl granite'],
    properties: ['Green pearl effect', 'Norwegian granite', 'Distinctive color', 'High quality'],
    bestFor: ['Nature-inspired memorials', 'Unique designs', 'Premium tributes'],
    h1: 'Emerald Pearl Granite Headstone Material',
  },
  'african-black': {
    slug: 'african-black',
    name: 'African Black',
    metaTitle: 'African Black Granite Headstone - Premium Black Granite Memorial | DYO',
    metaDescription: 'Create an African Black granite headstone. Deep black color, ideal for laser etching, all shapes. Professional engraving.',
    keywords: ['african black granite', 'black granite headstone', 'black memorial stone', 'laser etching granite'],
    properties: ['Deep black color', 'Perfect for laser etching', 'Dense grain', 'Premium quality'],
    bestFor: ['Laser-etched photos', 'Modern memorials', 'Photo headstones'],
    h1: 'African Black Granite Headstone Material',
  },
};

// Shape SEO data
export type ShapeSEO = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  style: string;
  bestFor: string[];
  h1: string;
};

export const shapeSEOData: Record<string, ShapeSEO> = {
  'serpentine': {
    slug: 'serpentine',
    name: 'Serpentine',
    metaTitle: 'Serpentine Headstone Shape - Classic Memorial Design | DYO',
    metaDescription: 'Design a serpentine-shaped headstone. Classic curved top design, available in all materials and sizes. Timeless elegance.',
    keywords: ['serpentine headstone', 'curved top headstone', 'classic headstone shape', 'serpentine memorial'],
    style: 'Classic',
    bestFor: ['Traditional memorials', 'Timeless designs', 'Classic elegance'],
    h1: 'Serpentine Headstone Shape',
  },
  'peak': {
    slug: 'peak',
    name: 'Peak',
    metaTitle: 'Peak Headstone Shape - Pointed Memorial Design | DYO',
    metaDescription: 'Create a peak-shaped headstone. Distinctive pointed top, all materials, custom sizes. Professional design.',
    keywords: ['peak headstone', 'pointed headstone', 'peak memorial', 'pointed top headstone'],
    style: 'Distinctive',
    bestFor: ['Distinguished memorials', 'Modern designs', 'Statement pieces'],
    h1: 'Peak Headstone Shape',
  },
  'gothic': {
    slug: 'gothic',
    name: 'Gothic',
    metaTitle: 'Gothic Headstone Shape - Gothic Arch Memorial Design | DYO',
    metaDescription: 'Design a Gothic arch headstone. Traditional Gothic style, all granite colors, custom inscriptions. Classic design.',
    keywords: ['gothic headstone', 'gothic arch memorial', 'gothic arch headstone', 'traditional gothic'],
    style: 'Traditional',
    bestFor: ['Religious memorials', 'Traditional designs', 'Historic style'],
    h1: 'Gothic Headstone Shape',
  },
  'square': {
    slug: 'square',
    name: 'Square',
    metaTitle: 'Square Headstone Shape - Modern Memorial Design | DYO',
    metaDescription: 'Create a square headstone. Clean modern lines, all materials, custom sizes. Contemporary elegance.',
    keywords: ['square headstone', 'modern headstone', 'square memorial', 'contemporary headstone'],
    style: 'Modern',
    bestFor: ['Modern memorials', 'Clean designs', 'Contemporary style'],
    h1: 'Square Headstone Shape',
  },
};

// Helper functions
export function generateProductMetadata(productSlug: string, params?: any): ProductSEO {
  const baseData = productSEOData[productSlug];
  if (!baseData) {
    return productSEOData['bronze-plaque']; // fallback
  }
  return baseData;
}

export function generateMaterialMetadata(materialSlug: string): MaterialSEO {
  const baseData = materialSEOData[materialSlug];
  if (!baseData) {
    return materialSEOData['imperial-red']; // fallback
  }
  return baseData;
}

export function generateShapeMetadata(shapeSlug: string): ShapeSEO {
  const baseData = shapeSEOData[shapeSlug];
  if (!baseData) {
    return shapeSEOData['serpentine']; // fallback
  }
  return baseData;
}

export function getDedicationTemplate(venueSlug: string, inscriptionSlug: string): DedicationTemplate | null {
  return bronzePlaqueDedications.find(
    t => t.venueSlug === venueSlug && t.inscriptionSlug === inscriptionSlug
  ) || null;
}

export function getMemorialTemplate(params: { nameSlug?: string; epitaphSlug?: string }): MemorialTemplate | null {
  return memorialHeadstoneTemplates.find(
    t => (params.nameSlug ? t.nameSlug === params.nameSlug : true) &&
         (params.epitaphSlug ? t.epitaphSlug === params.epitaphSlug : true)
  ) || null;
}
