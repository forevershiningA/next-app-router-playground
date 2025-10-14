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

export type Color = {
  id: string;
  name: string;
  image: string;
  hex: string;
  category: string;
};

export type Font = {
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
  { id: '2', name: 'Materials', slug: 'materials', categories: ['2'] },
  { id: '3', name: 'Motifs', slug: 'motifs', categories: ['3'] },
  { id: '4', name: 'Images', slug: 'images', categories: ['4'] },
  { id: '5', name: 'Emblems', slug: 'emblems', categories: ['5'] },
];

const categories: Category[] = [
  { id: '1', name: 'Shapes', slug: 'shapes', section: '1', shapes: ['1'] },
  {
    id: '2',
    name: 'Materials',
    slug: 'materials',
    section: '2',
    materials: ['1'],
  },
  { id: '3', name: 'Motifs', slug: 'motifs', section: '3', products: ['3'] },
  { id: '4', name: 'Images', slug: 'images', section: '4', products: ['4'] },
  { id: '5', name: 'Emblems', slug: 'emblems', section: '5', products: ['5'] },
];

const products: Product[] = [
  {
    id: '4',
    name: 'Laser-etched Black Granite Headstone',
    image: 'laser-etched-black-granite-headstone.webp',
    category: '1',
  },
  {
    id: '5',
    name: 'Bronze Plaque',
    image: 'bronze-plaque.webp',
    category: '1',
  },
  {
    id: '22',
    name: 'Laser-etched Black Granite Mini Headstone',
    image: 'laser-etched-black-granite-mini-headstone.webp',
    category: '1',
  },
  {
    id: '30',
    name: 'Laser-etched Black Granite Colour',
    image: 'laser-etched-black-granite-plaque.webp',
    category: '1',
  },
  {
    id: '32',
    name: 'Full Colour Plaque',
    image: 'full-color-plaque.webp',
    category: '1',
  },
  {
    id: '34',
    name: 'Traditional Engraved Plaque',
    image: 'traditional-engraved-plaque.webp',
    category: '1',
  },
  {
    id: '52',
    name: 'YAG Lasered Stainless Steel Plaque',
    image: 'yag-lasered-stainless-steel-plaque.webp',
    category: '1',
  },
  {
    id: '124',
    name: 'Traditional Engraved Headstone',
    image: 'traditional-engraved-headstone.webp',
    category: '1',
  },
  {
    id: '100',
    name: 'Laser-etched Black Granite Full Monument',
    image: 'laser-etched-black-granite-full-monument.webp',
    category: '1',
  },
  {
    id: '101',
    name: 'Traditional Engraved Full Monument',
    image: 'traditional-engraved-full-monument.webp',
    category: '1',
  },
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
  {
    id: '3',
    name: 'Australian Calca',
    image: 'Australian-Calca.jpg',
    category: '2',
  },
  {
    id: '4',
    name: 'Australian Grandee',
    image: 'Australian-Grandee.jpg',
    category: '2',
  },
  {
    id: '5',
    name: 'Balmoral Green',
    image: 'Balmoral-Green.jpg',
    category: '2',
  },
  { id: '6', name: 'Balmoral Red', image: 'Balmoral-Red.jpg', category: '2' },
  { id: '7', name: 'Blue Pearl', image: 'Blue-Pearl.jpg', category: '2' },
  { id: '8', name: 'Chinese Calca', image: 'Chinese-Calca.jpg', category: '2' },
  { id: '9', name: 'Darwin Brown', image: 'Darwin-Brown.jpg', category: '2' },
  { id: '10', name: 'Darwin Brown', image: 'Darwin-Brown.jpg', category: '2' },
  {
    id: '11',
    name: 'Emerald Pearl',
    image: 'Emerald-Pearl.jpg',
    category: '2',
  },
  {
    id: '12',
    name: 'English Brown',
    image: 'English-Brown.jpg',
    category: '2',
  },
  { id: '13', name: 'G439', image: 'G439.jpg', category: '2' },
  { id: '14', name: 'G623', image: 'G623.jpg', category: '2' },
  { id: '15', name: 'G633', image: 'G633.jpg', category: '2' },
  { id: '16', name: 'G654', image: 'G654.jpg', category: '2' },
  { id: '17', name: 'G788', image: 'G788.jpg', category: '2' },
  {
    id: '18',
    name: 'Glory Gold Spots',
    image: 'Glory-Black-1.jpg',
    category: '2',
  },
  { id: '19', name: 'Glory Black', image: 'Glory-Black-2.jpg', category: '2' },
  { id: '20', name: 'G9426', image: 'G9426.jpg', category: '2' },
  { id: '21', name: 'Imperial Red', image: 'Imperial-Red.jpg', category: '2' },
  { id: '22', name: 'Marron Brown', image: 'Marron-Brown.jpg', category: '2' },
  {
    id: '23',
    name: 'Multicolour Red',
    image: 'Multicolour-Red.jpg',
    category: '2',
  },
  { id: '24', name: 'Noble Black', image: 'Noble-Black.jpg', category: '2' },
  { id: '25', name: 'Noble Red', image: 'Noble-Red.jpg', category: '2' },
  { id: '26', name: 'Paradiso', image: 'Paradiso.jpg', category: '2' },
  { id: '27', name: 'Sandstone', image: 'Sandstone.jpg', category: '2' },
  {
    id: '28',
    name: 'Sapphire Brown',
    image: 'Saphire-Brown.jpg',
    category: '2',
  },
  { id: '29', name: 'Visage Blue', image: 'Vizage-Blue.jpg', category: '2' },
  {
    id: '30',
    name: 'White Carrara',
    image: 'White-Carrara.jpg',
    category: '2',
  },
];

const colors: Color[] = [
  { id: '1', name: 'Gold Gilding', image: '01.jpg', hex: '#c99d44', category: '3' },
  { id: '2', name: 'Silver Gilding', image: '35.jpg', hex: '#eeeeee', category: '3' },
  { id: '3', name: 'Alizarin', image: '02.jpg', hex: '#f6303e', category: '3' },
  { id: '4', name: 'Tangerine (gold drop)', image: '03.jpg', hex: '#f28b00', category: '3' },
  { id: '5', name: 'Tangerine yellow', image: '04.jpg', hex: '#ffce00', category: '3' },
  { id: '6', name: 'Sherwood Green', image: '05.jpg', hex: '#154733', category: '3' },
  { id: '7', name: 'Java', image: '06.jpg', hex: '#19988b', category: '3' },
  { id: '8', name: 'Indigo', image: '07.jpg', hex: '#510b76', category: '3' },
  { id: '9', name: 'Black', image: '08.jpg', hex: '#000000', category: '3' },
  { id: '10', name: 'Brown', image: '09.jpg', hex: '#a22b2a', category: '3' },
  { id: '11', name: 'International Orange', image: '10.jpg', hex: '#fd4f00', category: '3' },
  { id: '12', name: 'Gorse', image: '11.jpg', hex: '#fee123', category: '3' },
  { id: '13', name: 'La Rioja', image: '12.jpg', hex: '#c3d600', category: '3' },
  { id: '14', name: 'Dark Turquoise', image: '13.jpg', hex: '#00c2df', category: '3' },
  { id: '15', name: 'East Side', image: '14.jpg', hex: '#bd83cb', category: '3' },
  { id: '16', name: 'Mako', image: '15.jpg', hex: '#4e5859', category: '3' },
  { id: '17', name: 'Chantilly', image: '16.jpg', hex: '#f0b3cb', category: '3' },
  { id: '18', name: 'Texas Rose', image: '17.jpg', hex: '#ffb35a', category: '3' },
  { id: '19', name: 'Vis Vis', image: '18.jpg', hex: '#f7de8c', category: '3' },
  { id: '20', name: 'Caribbean Green', image: '19.jpg', hex: '#00ce7d', category: '3' },
  { id: '21', name: 'Summer Sky', image: '20.jpg', hex: '#3b8ede', category: '3' },
  { id: '22', name: 'Wistful', image: '21.jpg', hex: '#a8a4e0', category: '3' },
  { id: '23', name: 'Submarine', image: '22.jpg', hex: '#8f9d9d', category: '3' },
  { id: '24', name: 'Ruby', image: '23.jpg', hex: '#d41568', category: '3' },
  { id: '25', name: 'Dark Brown', image: '24.jpg', hex: '#643c1f', category: '3' },
  { id: '26', name: 'Watercourse', image: '25.jpg', hex: '#006746', category: '3' },
  { id: '27', name: 'Riptide', image: '26.jpg', hex: '#87e2d1', category: '3' },
  { id: '28', name: 'Smalt', image: '27.jpg', hex: '#00269a', category: '3' },
  { id: '29', name: 'Tiara', image: '28.jpg', hex: '#bdc6c2', category: '3' },
  { id: '30', name: 'Chocolate', image: '30.jpg', hex: '#c26b13', category: '3' },
  { id: '31', name: 'Christi', image: '31.jpg', hex: '#799a05', category: '3' },
  { id: '32', name: 'Robins Egg Blue', image: '32.jpg', hex: '#1fcfcb', category: '3' },
  { id: '33', name: 'Jordy Blue', image: '33.jpg', hex: '#7aa4dd', category: '3' },
  { id: '34', name: 'White', image: '34.jpg', hex: '#ffffff', category: '3' },
];

const fonts: Font[] = [
  { id: '1', name: 'Adorable', image: 'Adorable.otf', category: '1' },
  { id: '2', name: 'Arial', image: 'arial.ttf', category: '1' },
  { id: '3', name: 'Chopin Script', image: 'ChopinScript.otf', category: '1' },
  { id: '4', name: 'Dobkin', image: 'Dobkin.ttf', category: '1' },
  {
    id: '5',
    name: 'Franklin Gothic',
    image: 'FranklinGothic.ttf',
    category: '1',
  },
  {
    id: '6',
    name: 'French Script',
    image: 'French Script Std Regular.otf',
    category: '1',
  },
  { id: '7', name: 'Garamond', image: 'Garamond.ttf', category: '1' },
  {
    id: '8',
    name: 'Great Vibes',
    image: 'GreatVibes-Regular.ttf',
    category: '1',
  },
  {
    id: '9',
    name: 'Lucida Calligraphy',
    image: 'LucidaUnicodeCalligraphy.ttf',
    category: '1',
  },
  { id: '10', name: 'Xirwena', image: 'xirwena1.ttf', category: '1' },
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
        description:
          'Products come in a range of shapes for you to choose from. Custom shapes are available upon request. Please call us for more information.',
      },
      {
        slug: 'select-size',
        name: 'Select Size',
        description:
          'The size of headstones range from 300mm ~ 1200mm in width & height in 1mm increments. The thickness of the headstone depends on the width &amp; height of the headstone. As examples, 300mm square will be 40mm thick, 600mm square will be 60mm thick, and 1200mm square will be 100mm thick. Please be aware that cemeteries often have regulations on allowable dimensions including thickness of memorials.',
      },
      {
        slug: 'select-material',
        name: 'Select Material',
        description:
          'Traditional Engraved Plaques and Headstones are available in a number of different granites, marbles and sandstone. Our most popular material for this product is Blue Pearl.',
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
        slug: 'additions',
        name: 'Additions',
        description:
          'Additions are three dimensional mouldings highlighted in bronze. They come in a variety of themes in a number of fixed sizes. Emblems help express feelings and ideas that might not be possible with words.',
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

export const data = {
  sections,
  categories,
  products,
  shapes,
  materials,
  colors,
  fonts,
  demos,
};
