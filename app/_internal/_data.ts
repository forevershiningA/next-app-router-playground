// This is a mock database used to simplify parts of the app not
// relevant to the demo. In a real app, this data would live in
// a relational database like PostgreSQL or MySQL, accessed through
// a database client or ORM.

export type Product = {
  id: string;
  name: string;
  image: string;
  category: string;
};

export type Shape = {
  id: string;
  name: string;
  image: string;
  category: string;
};

export type Material = {
  id: string;
  name: string;
  image: string;
  category: string;
};

export type Section = {
  id: string;
  name: string;
  slug: string;
  categories: string[];
};

export type Category = {
  id: string;
  name: string;
  section: string;
  slug: string;
  products?: string[];
  shapes?: string[];
  materials?: string[];
  motifs?: string[];
  images?: string[];
};

export type Demo = {
  slug: string;
  name: string;
  nav_title?: string;
  description: string;
};

export type DemoCategory = { name: string; items: Demo[] };

const sections: Section[] = [
  { id: '1', name: 'Shapes', slug: 'shapes', categories: ['1'] },
  { id: '2', name: 'Materials', slug: 'materials', categories: ['2'],},
  { id: '3', name: 'Motifs', slug: 'motifs', categories: ['3'],},
  { id: '4', name: 'Images', slug: 'images', categories: ['4'],},
  { id: '5', name: 'Emblems', slug: 'emblems', categories: ['5'],},
];

const categories: Category[] = [
  { id: '1', name: 'Shapes', slug: 'shapes', section: '1', shapes: ['1'] },
  { id: '2', name: 'Materials', slug: 'materials', section: '2', materials: ['1'] },
  { id: '3', name: 'Motifs', slug: 'motifs', section: '3', products: ['3'] },
  { id: '4', name: 'Images', slug: 'images', section: '4', products: ['4'] },
  { id: '5', name: 'Emblems', slug: 'emblems', section: '5', products: ['5'] },
];

const products: Product[] = [
  { id: '4', name: 'Laser-etched Black Granite Headstone', image: 'laser-etched-black-granite-headstone.webp', category: '1' },
  { id: '5', name: 'Bronze Plaque', image: 'bronze-plaque.webp', category: '1' },
  { id: '22', name: 'Laser-etched Black Granite Mini Headstone', image: 'laser-etched-black-granite-mini-headstone.webp', category: '1' },
  { id: '30', name: 'Laser-etched Black Granite Colour', image: 'laser-etched-black-granite-plaque.webp', category: '1' },
  { id: '32', name: 'Full Colour Plaque', image: 'full-color-plaque.webp', category: '1' },
  { id: '34', name: 'Traditional Engraved Plaque', image: 'traditional-engraved-plaque.webp', category: '1' },
  { id: '52', name: 'YAG Lasered Stainless Steel Plaque', image: 'yag-lasered-stainless-steel-plaque.webp', category: '1' },
  { id: '124', name: 'Traditional Engraved Headstone', image: 'traditional-engraved-headstone.webp', category: '1' },
  { id: '100', name: 'Laser-etched Black Granite Full Monument', image: 'laser-etched-black-granite-full-monument.webp', category: '1' },
  { id: '101', name: 'Traditional Engraved Full Monument', image: 'traditional-engraved-full-monument.webp', category: '1' },

];

const shapes: Shape[] = [
  { id: '1', name: 'Serpentine', image: 'serpentine.svg', category: '1' },
  { id: '2', name: 'Cropped Peak', image: 'cropped_peak.svg', category: '1' },
  { id: '3', name: 'Curved Gable', image: 'curved_gable.svg', category: '1' },
  { id: '4', name: 'Curved Peak', image: 'curved_peak.svg', category: '1' },
  { id: '5', name: 'Curved Top', image: 'curved_top.svg', category: '1' },
  { id: '6', name: 'Gable', image: 'gable.svg', category: '1' },
  { id: '7', name: 'Half Roung', image: 'half_round.svg', category: '1' },
  { id: '8', name: 'Left Wave', image: 'left_wave.svg', category: '1' },
  { id: '9', name: 'Peak', image: 'peak.svg', category: '1' },
  { id: '10', name: 'Right Wave', image: 'right_wave.svg', category: '1' },
  { id: '11', name: 'Square', image: 'square.svg', category: '1' },
  { id: '12', name: 'Headstone 1', image: 'headstone_1.svg', category: '1' },
  { id: '13', name: 'Headstone 2', image: 'headstone_2.svg', category: '1' },
  { id: '14', name: 'Buddha', image: 'buddha.svg', category: '1' },
];

const materials: Material[] = [
  { id: '1', name: 'African Black', image: 'African-Black.jpg', category: '2' },
  { id: '2', name: 'African Red', image: 'African-Red.jpg', category: '2' },
  { id: '3', name: 'Australian Calca', image: 'Australian-Calca.jpg', category: '2' },
  { id: '4', name: 'Australian Grandee', image: 'Australian-Grandee.jpg', category: '2' },
  { id: '5', name: 'Balmoral Green', image: 'Balmoral-Green.jpg', category: '2' },
  { id: '6', name: 'Balmoral Red', image: 'Balmoral-Red.jpg', category: '2' },
  { id: '7', name: 'Blue Pearl', image: 'Blue-Pearl.jpg', category: '2' },
  { id: '8', name: 'Chinese Calca', image: 'Chinese-Calca.jpg', category: '2' },
  { id: '9', name: 'Darwin Brown', image: 'Darwin-Brown.jpg', category: '2' },
  { id: '10', name: 'Darwin Brown', image: 'Darwin-Brown.jpg', category: '2' },
  { id: '11', name: 'Emerald Pearl', image: 'Emerald-Pearl.jpg', category: '2' },
  { id: '12', name: 'English Brown', image: 'English-Brown.jpg', category: '2' },
  { id: '13', name: 'G439', image: 'G439.jpg', category: '2' },
  { id: '14', name: 'G623', image: 'G623.jpg', category: '2' },
  { id: '15', name: 'G633', image: 'G633.jpg', category: '2' },
  { id: '16', name: 'G654', image: 'G654.jpg', category: '2' },
  { id: '17', name: 'G788', image: 'G788.jpg', category: '2' },
  { id: '18', name: 'Glory Gold Spots', image: 'Glory-Black-1.jpg', category: '2' },
  { id: '19', name: 'Glory Black', image: 'Glory-Black-2.jpg', category: '2' },
  { id: '20', name: 'G9426', image: 'G9426.jpg', category: '2' },
  { id: '21', name: 'Imperial Red', image: 'Imperial-Red.jpg', category: '2' },
  { id: '22', name: 'Maroon Brown', image: 'Maroon-Brown.jpg', category: '2' },
  { id: '23', name: 'Multicolour Red', image: 'Multicolour-Red.jpg', category: '2' },
  { id: '24', name: 'Noble Black', image: 'Noble-Black.jpg', category: '2' },
  { id: '25', name: 'Noble Red', image: 'Noble-Red.jpg', category: '2' },
  { id: '26', name: 'Paradiso', image: 'Paradiso.jpg', category: '2' },
  { id: '27', name: 'Sandstone', image: 'Sandstone.jpg', category: '2' },
  { id: '28', name: 'Sapphire Brown', image: 'Saphire-Brown.jpg', category: '2' },
  { id: '29', name: 'Visage Blue', image: 'Vizage-Blue.jpg', category: '2' },
  { id: '30', name: 'White Carrara', image: 'White-Carrara.jpg', category: '2' },
];

const demos = [
  {
    name: 'Start',
    items: [
      {
        slug: 'select-product',
        name: 'Select Product',
        description: 'Create Error UI for specific parts of an app',
      },
      {
        slug: 'select-shape',
        name: 'Select Shape',
        description: 'Products come in a range of shapes for you to choose from. Custom shapes are available upon request. Please call us for more information.',
      },
      {
        slug: 'select-size',
        name: 'Select Size',
        description: 'The size of headstones range from 300mm ~ 1200mm in width & height in 1mm increments. The thickness of the headstone depends on the width &amp; height of the headstone. As examples, 300mm square will be 40mm thick, 600mm square will be 60mm thick, and 1200mm square will be 100mm thick. Please be aware that cemeteries often have regulations on allowable dimensions including thickness of memorials.',
      },
      {
        slug: 'select-material',
        name: 'Select Material',
        description: 'Traditional Engraved Plaques and Headstones are available in a number of different granites, marbles and sandstone. Our most popular material for this product is Blue Pearl.',
      },
    ],
  },
 {
    name: 'Personalization',
    items: [
      {
        slug: 'inscriptions',
        name: 'Inscriptions',
        description:
          'Inscriptions commemorate the lost family member or friend in an individual way.',
      },
      {
        slug: 'not-found',
        name: 'Not Found',
        description: 'Create Not Found UI for specific parts of an app',
      },
    ],
  },
  {
    name: 'Caching',
    items: [
      {
        slug: 'cached-routes',
        name: 'Cached Route Segments',
        nav_title: 'Cached Routes',
        description: 'Cache the rendered output of a route segment',
      },
      {
        slug: 'cached-components',
        name: 'Cached React Server Components',
        nav_title: 'Cached Components',
        description:
          'Cache the rendered output of an individual React Server Component',
      },
      {
        slug: 'cached-functions',
        name: 'Cached Functions',
        description: 'Cache the computed result of a regular function',
      },
    ],
  },
  {
    name: 'APIs',
    items: [
      {
        slug: 'use-link-status',
        name: 'useLinkStatus',
        description: 'Create inline visual feedback for link interactions',
      },
    ],
  },
  {
    name: 'Misc',
    items: [
      {
        slug: 'view-transitions',
        name: 'View Transitions',
        description:
          'Use animations to help users understand the relationship between the two views',
      },
      {
        slug: 'context',
        name: 'Client Context',
        description:
          'Pass context between Client Components that cross Server/Client Component boundary',
      },
    ],
  },
  
] as const satisfies DemoCategory[];

export type DemoSlug = (typeof demos)[number]['items'][number]['slug'];

export const data = { sections, categories, products, shapes, materials, demos };
