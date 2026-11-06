export type MaterialComparison = {
  title: string;
  badge: string;
  description: string;
  bestFor: string;
  durability: string;
  features: string[];
};

export type CategoryFaq = {
  question: string;
  answer: string;
};

export type CategoryDetails = {
  slug: string;
  heroHeadline: string;
  heroSubheadline: string;
  flagshipProductId: string;
  flagshipBadge: string;
  comparisons: MaterialComparison[];
  faqs: CategoryFaq[];
};

export const PRODUCT_BADGES: Record<string, { label: string; highlight: string }> = {
  '1': { label: 'Architectural Steel', highlight: 'Cut-through glass backed inscription' },
  '4': { label: 'Most Popular', highlight: 'High-resolution photo laser etching' },
  '5': { label: 'Heritage Cast Bronze', highlight: 'Hand-poured bronze with raised gold lettering' },
  '8': { label: 'Pet Favorite', highlight: 'Compact black granite with pet portrait' },
  '9': { label: 'Garden Marker', highlight: 'Granite plaque for garden or home' },
  '22': { label: 'Mini Headstone', highlight: 'Compact black granite marker' },
  '23': { label: '316 Marine Steel', highlight: 'Mirror reflective chamfers & finish' },
  '30': { label: 'Laser Granite', highlight: 'Micro-dot portrait engraving' },
  '32': { label: 'Full Colour', highlight: 'Vivid photographic porcelain & chrome' },
  '34': { label: 'Traditional Chiseled', highlight: 'Natural Blue Pearl granite engraving' },
  '52': { label: 'YAG Laser Annealed', highlight: 'Brushed stainless steel plate' },
  '100': { label: 'Complete Monument', highlight: 'Full ledger, headstone & kerbing' },
  '101': { label: 'Classic Monument', highlight: 'Traditional stone craftsmanship' },
  '124': { label: 'Classic Engraved', highlight: 'V-cut lettering on natural stone' },
  '135': { label: 'Natural Stone', highlight: 'Laser etched heart-shaped river stone' },
  '2350': { label: 'Artisan Keepsake', highlight: 'Stainless steel with vitreous enamel' },
};

export const CATEGORY_DETAILS: Record<string, CategoryDetails> = {
  headstones: {
    slug: 'headstones',
    heroHeadline: 'Custom Upright Headstones Crafted for Generations',
    heroSubheadline:
      'Explore handcrafted black granite, traditional carved stone, and marine-grade stainless steel headstones. Personalise online with real-time 3D preview and guaranteed cemetery compliance.',
    flagshipProductId: '4',
    flagshipBadge: 'Most Popular Choice',
    comparisons: [
      {
        title: 'Laser-Etched Black Granite',
        badge: 'Photographic Precision',
        description:
          'Utilises state-of-the-art diamond laser technology to etch portraits, detailed landscapes, and fine typography directly into dense black granite.',
        bestFor: 'Photorealistic family portraits, scenic backdrops, extensive inscriptions.',
        durability: 'Lifetime weather resistance; etching will not fade, peel, or wash away.',
        features: ['Crystal-sharp micro-dots', 'Maintenance-free surface', 'Zero painted inks needed'],
      },
      {
        title: 'Traditional Engraved Stone',
        badge: 'Classic Heritage',
        description:
          'Timeless stonemasonry with V-cut carved lettering and motifs, finished with architectural gold leaf or durable enamel infill.',
        bestFor: 'Heritage cemetery requirements, classic dignified lettering, textured stone.',
        durability: '100+ years of proven outdoor durability across all climates.',
        features: ['Deep tactile V-groove relief', 'Choice of Blue Pearl, Marble & Granite', 'Accepted in all historic cemeteries'],
      },
      {
        title: 'Light-Transmitting Steel',
        badge: 'Modern Architectural',
        description:
          'Combines 316 marine-grade stainless steel with coloured art glass backing, creating a radiant memorial that glows in changing sunlight.',
        bestFor: 'Families seeking a contemporary, luminous work of art.',
        durability: 'Impervious to salt spray, frost, and coastal conditions.',
        features: ['Stunning daylight illumination', 'Cut-through typography', 'Polished chrome mirror bevels'],
      },
    ],
    faqs: [
      {
        question: 'Will my cemetery approve a headstone designed on Forever Shining?',
        answer:
          'Yes. Every cemetery has specific bylaws regarding maximum height, base depth, and material finish. Before production begins, our memorial consultants review your design against your cemetery’s exact regulations and can submit technical architectural drawings directly to the cemetery authority on your behalf.',
      },
      {
        question: 'How durable is laser etching compared to traditional engraving?',
        answer:
          'Laser etching is permanent. The high-energy laser beam micro-fractures the quartz crystals in black granite, permanently exposing the lighter natural crystalline structure beneath the polished surface. Because no paints or dyes are required, the portrait and lettering will never fade, peel, or degrade in sun or rain.',
      },
      {
        question: 'Can I see a physical proof before my headstone is carved?',
        answer:
          'In addition to our interactive 3D live preview, our drafting team prepares a high-resolution 1:1 scale production layout proof. We require family sign-off before a single stone is cut or engraved.',
      },
      {
        question: 'How are heavy granite headstones delivered and installed?',
        answer:
          'We partner with specialized memorial freight carriers. Delivery can be arranged directly to the cemetery, to your nominated local stonemason, or to a nearby commercial freight depot. We supply complete dowels, pins, and installation specifications.',
      },
      {
        question: 'What warranty is provided with Forever Shining headstones?',
        answer:
          'All headstones come with a 30-year manufacturer’s guarantee covering stone integrity, construction craftsmanship, and etching permanency against cracking or fading.',
      },
    ],
  },
  plaques: {
    slug: 'plaques',
    heroHeadline: 'Enduring Memorial Plaques in Bronze, Stone & Steel',
    heroSubheadline:
      'Honour precious memories with cast bronze wall plaques, high-resolution laser-etched black granite, and marine-grade stainless steel markers.',
    flagshipProductId: '5',
    flagshipBadge: 'Heritage Cast Bronze',
    comparisons: [
      {
        title: 'Cast Bronze Plaques',
        badge: 'Cemetery Standard',
        description:
          'Poured molten bronze alloy with hand-finished patina, raised polished letters, and classic bas-relief borders.',
        bestFor: 'Cemetery walls, garden niche walls, lawn cemetery markers.',
        durability: 'Virtually indestructible alloy, tested across centuries of outdoor exposure.',
        features: ['Raised gold-bronze relief', 'Traditional decorative borders', 'Concealed mounting lugs'],
      },
      {
        title: 'Laser-Etched Granite',
        badge: 'High Detail',
        description:
          'Flat polished black granite slab featuring high-resolution photographic portraits and fine text.',
        bestFor: 'Portraits, extensive family poetry, cemetery wall recesses.',
        durability: 'Non-porous stone unaffected by ultraviolet radiation or rain.',
        features: ['Ultra-crisp lettering', 'Edge chamfer polish', 'Drilled screw holes or adhesive mount'],
      },
      {
        title: 'Full Colour Ceramic & Stainless',
        badge: 'Vivid Photography',
        description:
          'High-temperature kiln-fired vitreous ceramic print housed within a beveled stainless steel protective frame.',
        bestFor: 'Colour portraits, vibrant landscapes, modern remembrance walls.',
        durability: 'UV-stable pigments fired into glass enamel.',
        features: ['True-to-life color', 'Mirror beveled frame', 'Weather-sealed assembly'],
      },
    ],
    faqs: [
      {
        question: 'What are standard memorial plaque dimensions?',
        answer:
          'Common plaque sizes include 300 × 200 mm, 380 × 280 mm, and 200 × 150 mm for niche walls. In our 3D Designer you can adjust dimensions in 1 mm increments to match your cemetery’s exact niche plaque specifications.',
      },
      {
        question: 'How do I mount a bronze or granite plaque?',
        answer:
          'Plaques can be supplied with rear-threaded brass pins (lugs) for masonry cement mounting, pre-drilled countersunk screw holes with rosettes, or a completely flat back for architectural adhesives.',
      },
      {
        question: 'Will full-colour outdoor plaques fade in the sun?',
        answer:
          'Our full-colour plaques use vitreous enamel inks fused at over 800°C into glass and ceramic. Unlike ordinary photo printing, this creates a ceramic glaze impervious to UV light and fading.',
      },
      {
        question: 'Can I add multiple photos and religious motifs to a plaque?',
        answer:
          'Yes. Our 3D Designer lets you add multiple photos, custom emblem artwork, military badges, and religious symbols with real-time scaling and pricing.',
      },
    ],
  },
  'full-monuments': {
    slug: 'full-monuments',
    heroHeadline: 'Grand Full Monuments & Complete Family Memorials',
    heroSubheadline:
      'Complete memorial installations combining upright headstones, matching bases, ledgers, and solid stone kerbing engineered to endure forever.',
    flagshipProductId: '100',
    flagshipBadge: 'Full Ledger Monument',
    comparisons: [
      {
        title: 'Laser-Etched Full Monument',
        badge: 'Artistic Masterpiece',
        description:
          'Complete solid granite ledger slab and upright tablet featuring extensive botanical artwork, portraits, and family tributes.',
        bestFor: 'Families wanting a prominent, maintenance-free full plot memorial.',
        durability: 'Full solid stone structure engineered for decades of structural stability.',
        features: ['Polished slab ledger', 'Headstone with custom vase pillars', 'Solid kerbing with chamfers'],
      },
      {
        title: 'Traditional Engraved Monument',
        badge: 'Heritage Stonemasonry',
        description:
          'Classic multi-tier natural stone monument featuring traditional V-carved lettering and architectural mouldings.',
        bestFor: 'Historic cemetery plots, traditional religious memorials.',
        durability: 'Massive granite sections built to heritage standards.',
        features: ['Deep chiseled lettering', 'Choice of polished or rock-pitch kerbs', 'Matching vase inserts'],
      },
    ],
    faqs: [
      {
        question: 'What is included in a Full Monument package?',
        answer:
          'A full monument includes the upright headstone (tablet), the sub-base, the full-length covering ledger slab, and the surrounding kerb walls (kerbing), plus optional flower vases and inscription work.',
      },
      {
        question: 'Do I need structural foundation engineering?',
        answer:
          'Yes. Full monuments weigh between 1,000 kg and 3,500 kg and require reinforced concrete footing piers. We provide certified structural installation specifications to ensure proper cemetery foundation approval.',
      },
      {
        question: 'Can a full monument accommodate future family inscriptions?',
        answer:
          'Absolutely. We design the inscription layout with dedicated space reserved for future generations, and matching font archives are permanently saved.',
      },
    ],
  },
  urns: {
    slug: 'urns',
    heroHeadline: 'Personalised Artisan Memorial Urns & Keepsakes',
    heroSubheadline:
      'Artisan-crafted stainless steel cremation urns featuring vibrant vitreous enamel portraits, heartfelt inscriptions, and symbolic motifs.',
    flagshipProductId: '2350',
    flagshipBadge: 'Vitreous Enamel Keepsake',
    comparisons: [
      {
        title: 'Stainless Steel Vitreous Urn',
        badge: 'Heirloom Quality',
        description:
          'Precision-formed 316 stainless steel vessel with a high-gloss vitreous enamel artwork inlay and secure threaded base plate.',
        bestFor: 'Indoor home display, columbarium niches, or outdoor memorial placement.',
        durability: 'Non-tarnishing, rustproof steel with permanent glass enamel finish.',
        features: ['Vivid personalized photo', 'Polished chrome pedestal', 'Hermetically sealable chamber'],
      },
    ],
    faqs: [
      {
        question: 'How are the ashes placed inside the memorial urn?',
        answer:
          'The urn features a precision-machined secure base plate with sealed gasket fasteners, ensuring safe and dignified placement of cremation remains.',
      },
      {
        question: 'Can the urn be placed outdoors or in an outdoor niche?',
        answer:
          'Yes. Because it is crafted from marine-grade 316 stainless steel and kiln-fired vitreous enamel, it is 100% weatherproof and resistant to oxidation.',
      },
      {
        question: 'Can I preview my custom urn with my own photo?',
        answer:
          'Yes! In our online designer, you can upload your photo, select background themes, and adjust text in real-time 3D.',
      },
    ],
  },
  'pet-memorials': {
    slug: 'pet-memorials',
    heroHeadline: 'Cherished Pet Memorials for Faithful Companions',
    heroSubheadline:
      'Keep the memory of your beloved pet alive with laser-etched black granite mini headstones, garden plaques, and heart-shaped memorial rocks.',
    flagshipProductId: '8',
    flagshipBadge: 'Laser-Etched Granite',
    comparisons: [
      {
        title: 'Pet Mini Headstones',
        badge: 'Traditional Marker',
        description:
          'Upright black granite headstone on a matching base with photo-etched portrait of your dog, cat, or companion animal.',
        bestFor: 'Pet cemetery plots or a prominent garden memorial corner.',
        durability: 'Solid outdoor granite that withstands lawn care and weather.',
        features: ['Whiskers & fur detail', 'Choice of shape', 'Included solid stone base'],
      },
      {
        title: 'Pet Memorial Rocks',
        badge: 'Natural Harmony',
        description:
          'Heart-shaped and organic natural river stone memorials that blend seamlessly into garden beds and flower borders.',
        bestFor: 'Backyard gardens, favorite resting trees, indoor keepsake display.',
        durability: 'Natural river stone permanently laser etched.',
        features: ['Warm organic shape', 'Deep laser engraving', 'Low profile'],
      },
      {
        title: 'Pet Garden Plaques',
        badge: 'Versatile Marker',
        description:
          'Compact black granite plaque for stepping stones, patio walls, or potted plant memorials.',
        bestFor: 'Subtle remembrance in apartments, gardens, or memorial trees.',
        durability: 'Scratch-proof, UV-proof polished granite.',
        features: ['Beveled edges', 'Custom paw prints & motifs', 'Compact footprint'],
      },
    ],
    faqs: [
      {
        question: 'How clear does the photo of my pet need to be?',
        answer:
          'A clear, well-lit smartphone photo works great! Our graphic artists enhance contrast, isolate your pet from the background, and sharpen fur details before laser etching.',
      },
      {
        question: 'Can these pet memorials stay outside in winter frost and rain?',
        answer:
          'Yes, 100%. We use the same commercial-grade black granite and laser etching technology used on traditional human cemetery monuments.',
      },
      {
        question: 'Can I add paw prints, breed silhouettes, or personal quotes?',
        answer:
          'Yes. Our library includes hundreds of dog breeds, cat silhouettes, equine artwork, and memorial verses at no extra cost.',
      },
    ],
  },
};
