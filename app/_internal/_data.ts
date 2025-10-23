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

export type Addition = {
  id: string;
  name: string;
  image: string;
  type: 'application' | 'vase' | 'statue';
  category: string;
  file?: string;
};

export type Motif = {
  id: number;
  class: string;
  name: string;
  src: string;
  img: string;
  traditional: boolean;
  ss: boolean;
  col2: boolean;
  col1: boolean;
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
  { id: '7', name: 'Half Round', image: 'half_round.svg', category: '1' },
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

const c = "motif"; // class name for all motifs
const p = "/motifs/"; // base path for motif images

// Translation keys match the Lang constants from Const.js
const motifs: Motif[] = [
  { id: 0, class: c, name: "AQUATIC", src: "Animals/Aquatic", img: p + "whale_002.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 1, class: c, name: "BIRDS", src: "Animals/Birds", img: p + "dove_002.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 2, class: c, name: "BUTTERFLIES", src: "Animals/Butterflies", img: p + "butterfly_005.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 3, class: c, name: "CATS", src: "Animals/Cats", img: p + "2_056_04.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 4, class: c, name: "DOGS", src: "Animals/Dogs", img: p + "1_137_10.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 5, class: c, name: "FARM_ANIMAL", src: "Animals/Farm-Animal", img: p + "1_138_12.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 6, class: c, name: "HORSES", src: "Animals/Horses", img: p + "horse_009.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 7, class: c, name: "INSECTS", src: "Animals/Insects", img: p + "dragonfly_03.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 8, class: c, name: "MYSTICAL_ANIMALS", src: "Animals/Mystical-Animals", img: p + "2_061_17.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 9, class: c, name: "PREHISTORIC", src: "Animals/Prehistoric", img: p + "1_135_02.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 10, class: c, name: "REPTILES", src: "Animals/Reptiles", img: p + "1_173_05.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 11, class: c, name: "WORLD_ANIMALS", src: "Animals/World-Animals", img: p + "1_145_20.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 12, class: c, name: "AUS_WILDLIFE", src: "Aus-Wildlife", img: p + "gecko_003.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 13, class: c, name: "AUS_FLORA", src: "Australiana-Flora", img: p + "banksiarufa.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 14, class: c, name: "ARCHITECTURAL", src: "Architectural", img: p + "1_217_23.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 15, class: c, name: "ARROW", src: "Arrow", img: p + "1_207_07.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 16, class: c, name: "BORDERS", src: "Borders", img: p + "1_018_10.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 17, class: c, name: "CARTOONS_AND_ANIMALS", src: "Animals", img: p + "1_055_01.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 18, class: c, name: "CORNERS", src: "Borders-Corners", img: p + "1_208_03.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 19, class: c, name: "CHILDREN_TOYS", src: "Children-Toys", img: p + "teddy-bear_003.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 20, class: c, name: "FLORISH", src: "Florish", img: p + "1_011_09.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 21, class: c, name: "FLOURISHES", src: "Flourishes", img: p + "2_139_07.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 22, class: c, name: "FLOWER_INSERTS", src: "Flowers", img: p + "flower rose_03.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 23, class: c, name: "FLOWER_INSERTS", src: "1ColRaisedMotif", img: p + "f1_0.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 24, class: c, name: "FOOD_AND_DRINK", src: "Food-and-Drink", img: p + "2_117_01.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 25, class: c, name: "HEARTS", src: "Hearts-and-Ribbons", img: p + "2_155_14.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 26, class: c, name: "HISTORY", src: "History-and-Culture", img: p + "2_079_03.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 27, class: c, name: "HOLIDAY", src: "Holiday", img: p + "clover_001.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 28, class: c, name: "HOUSEHOLD_ITEMS", src: "Household-Items", img: p + "2_092_15.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 29, class: c, name: "ISLANDER", src: "Islander", img: p + "1_140_12.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 30, class: c, name: "ICONIC_PLACES", src: "Iconic-Places", img: p + "2_111_05.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 31, class: c, name: "MOON_AND_STARS", src: "Moon-Stars-Sun", img: p + "2_082_17.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 32, class: c, name: "MUSIC_AND_DANCE", src: "Music-and-Dance", img: p + "1_172_08.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 33, class: c, name: "NAUTICLE", src: "Nauticle", img: p + "anchor_001.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 34, class: c, name: "OFFICIAL", src: "Official", img: p + "1_127_06.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 35, class: c, name: "PETS", src: "Pets", img: p + "paw_001.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 36, class: c, name: "PLANTS_AND_TREES", src: "Plants-and-Trees", img: p + "1_158_16.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 37, class: c, name: "RELIGIOUS", src: "Religious", img: p + "angel_001.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 38, class: c, name: "SHAPES_AND_PATTERNS", src: "Shapes-and-Patterns", img: p + "2_147_09.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 39, class: c, name: "SKULLS_AND_WEAPONS", src: "Skulls-and-Weapons", img: p + "1_061_07.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 40, class: c, name: "SPORT_AND_FITNESS", src: "Sport-and-Fitness", img: p + "2_120_13.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 41, class: c, name: "SYMBOLS_ZODIAC", src: "Symbols-Zodiac", img: p + "zodiac_003.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 42, class: c, name: "TEXT", src: "Text", img: p + "2_172_21.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 43, class: c, name: "TOOLS_OFFICE", src: "Tools-Office-Trades-and-Professions", img: p + "2_124_26.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 44, class: c, name: "TRIBAL", src: "Tribal", img: p + "1_206_16.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 45, class: c, name: "USA", src: "American", img: p + "1_127_23.png", traditional: true, ss: false, col2: false, col1: false },
  { id: 46, class: c, name: "VEHICLES", src: "Vehicles", img: p + "1_188_24.png", traditional: true, ss: true, col2: false, col1: false },
  { id: 47, class: c, name: "2 Colour Motifs", src: "2ColRaisedMotif", img: p + "01.png", traditional: false, ss: false, col2: true, col1: false },
  { id: 48, class: c, name: "1 Colour Motifs", src: "1ColRaisedMotif", img: p + "f1_1.png", traditional: false, ss: false, col2: false, col1: true }
];

const additions: Addition[] = [
  // Applications (parent="3001" - Biondan_Emblems)
  { id: 'B2497S', file: "2497/Art2497.glb", name: 'Applicazione Preghiera', image: '_2497.jpg', type: 'application', category: '1' },
  { id: 'B2497D', file: "2497/Art2497.glb", name: 'Applicazione Preghiera', image: '_2497.jpg', type: 'application', category: '1' },
  { id: 'B2225', file: "2225/Art2225.glb", name: 'Let Romano Spazzolato', image: '_2225.jpg', type: 'application', category: '1' },
  { id: 'B2074S', file: "207/Art207.glb", name: 'Applicazione Angelo', image: '_207.jpg', type: 'application', category: '1' },
  { id: 'B2074D', file: "207/Art207.glb", name: 'Applicazione Angelo', image: '_207.jpg', type: 'application', category: '1' },
  { id: 'B1134S', file: "1134/Art1134.glb", name: 'Applicazione Angelo', image: '_1134.jpg', type: 'application', category: '1' },
  { id: 'B1134D', file: "1134/Art1134.glb", name: 'Applicazione Angelo', image: '_1134.jpg', type: 'application', category: '1' },
  { id: 'B4599', file: "4599/Art4599.glb", name: 'Applicazione Cacciatore', image: '_4599.jpg', type: 'application', category: '1' },
  { id: 'B4597', file: "4597/Art4597.glb", name: 'Applicazione Sachetto Pescatore', image: '_4597.jpg', type: 'application', category: '1' },
  { id: 'B2600', file: "2600/Art2600.glb", name: 'Applicazione Madonna', image: '_2600.jpg', type: 'application', category: '1' },
  { id: 'B558', file: "558/558.glb", name: '[to-be-delivered]', image: '_558.jpg', type: 'application', category: '1' },
  { id: 'B1154', file: "1154/Art1154.glb", name: '[to-be-delivered]', image: '_1154.jpg', type: 'application', category: '1' },
  { id: 'B1212', file: "1212/Art1212.glb", name: 'Applicazione Madonna Bambino', image: '_1212.jpg', type: 'application', category: '1' },
  { id: 'B1334', file: "1334-1/1334-1.glb", name: 'Applicazione Cristo', image: '_1334-1.jpg', type: 'application', category: '1' },
  { id: 'B1343D', file: "1343/Art1343.glb", name: 'Applicazione Madonna', image: '_1343.jpg', type: 'application', category: '1' },
  { id: 'B1343S', file: "1343D/Art1343D.glb", name: 'Applicazione Madonna', image: '_1343D.jpg', type: 'application', category: '1' },
  { id: 'B1539', file: "1539/art1539.glb", name: '[to-be-delivered]', image: '_1539.jpg', type: 'application', category: '1' },
  { id: 'B1648', file: "1648/1648.glb", name: '[to-be-delivered]', image: '_1648.jpg', type: 'application', category: '1' },
  { id: 'B1649', file: "1649/Art1649.glb", name: 'Applicazione Fiore', image: '_1649.jpg', type: 'application', category: '1' },
  { id: 'B1774', file: "1774/art1774.glb", name: 'Croce PAR', image: '_1774.jpg', type: 'application', category: '1' },
  { id: 'B7076', file: "1827/Art1827.glb", name: 'Applicazione Madonna', image: '_1827.jpg', type: 'application', category: '1' },
  { id: 'B1834', file: "1834/Art1834.glb", name: 'Applicazione Madonna', image: '_1834.jpg', type: 'application', category: '1' },
  { id: 'B1837', file: "1837/Art1837.glb", name: 'Applicazione Cristo', image: '_1837.jpg', type: 'application', category: '1' },
  { id: 'B1881', file: "1881/Art1881.glb", name: 'Applicazione Fiore', image: '_1881.jpg', type: 'application', category: '1' },
  { id: 'B1990', file: "1990/Art1990.glb", name: 'Applicazione Cristo', image: '_1990.jpg', type: 'application', category: '1' },
  { id: 'B2046', file: "2046/2046.glb", name: '[to-be-delivered]', image: '_2046.jpg', type: 'application', category: '1' },
  { id: 'B2097', file: "2097/Art2097.glb", name: 'Applicazione Cristo', image: '_2097.jpg', type: 'application', category: '1' },
  { id: 'B2098S', file: "2098/Art2098.glb", name: 'Applicazione Madonna', image: '_2098.jpg', type: 'application', category: '1' },
  { id: 'B2098D', file: "2098/Art2098.glb", name: 'Applicazione Madonna', image: '_2098.jpg', type: 'application', category: '1' },
  { id: 'B2127', file: "2127/Art2127.glb", name: 'Croce PAR', image: '_2127.jpg', type: 'application', category: '1' },
  { id: 'B2251', file: "2251/Art2251.glb", name: 'Applicazione Cristo', image: '_2251.jpg', type: 'application', category: '1' },
  { id: 'B2254', file: "2254/2254.glb", name: '[to-be-delivered]', image: '_2254.jpg', type: 'vase', category: '2' },
  { id: 'B2304S', file: "2304/Art2304.glb", name: 'Applicazione Madonna', image: '_2304.jpg', type: 'application', category: '1' },
  { id: 'B2304D', file: "2304/Art2304.glb", name: 'Applicazione Madonna', image: '_2304.jpg', type: 'application', category: '1' },
  { id: 'B2375S', file: "2375/Art2375.glb", name: 'Applicazione Fiore', image: '_2375.jpg', type: 'application', category: '1' },
  { id: 'B2375D', file: "2375/Art2375.glb", name: 'Applicazione Fiore', image: '_2375.jpg', type: 'application', category: '1' },
  { id: 'B2381', file: "2381/Art2381.glb", name: 'Applicazione Fiore', image: '_2381.jpg', type: 'application', category: '1' },
  { id: 'B2413', file: "2413/art2413.glb", name: 'Croce PAR', image: '_2413.jpg', type: 'application', category: '1' },
  { id: 'B2434', file: "2434/Art2434.glb", name: 'Applicazione Fiore', image: '_2434.jpg', type: 'application', category: '1' },
  { id: 'B2438', file: "2438/art2438.glb", name: 'Croce PAR', image: '_2438.jpg', type: 'application', category: '1' },
  { id: 'B2441', file: "2441/Art2441.glb", name: 'Croce PAR', image: '_2441.jpg', type: 'application', category: '1' },
  { id: 'B2471', file: "2471/Art2471.glb", name: 'Applicazione Fiore', image: '_2471.jpg', type: 'application', category: '1' },
  { id: 'B2473', file: "2473/Art2473.glb", name: 'Applicazione Fiore', image: '_2473.jpg', type: 'application', category: '1' },
  { id: 'B2537', file: "2537/Art2537.glb", name: 'Croce PAR', image: '_2537.jpg', type: 'application', category: '1' },
  { id: 'B2581D', file: "2581/Art2581.glb", name: 'Applicazione Fiore', image: '_2581.jpg', type: 'application', category: '1' },
  { id: 'B2581S', file: "2581s/Art2581s.glb", name: 'Applicazione Fiore', image: '_2581s.jpg', type: 'application', category: '1' },
  { id: 'B2649', file: "2649/Art2649.glb", name: 'Applicazione Fiore', image: '_2649.jpg', type: 'application', category: '1' },
  { id: 'B2650', file: "2650/Art2650.glb", name: 'Applicazione Fiore', image: '_2650.jpg', type: 'application', category: '1' },
  { id: 'B2652', file: "2652/Art2652.glb", name: 'Applicazione Fiore', image: '_2652.jpg', type: 'application', category: '1' },
  { id: 'B2653', file: "2653/Art2653.glb", name: 'Applicazione Fiore', image: '_2653.jpg', type: 'application', category: '1' },
  { id: 'B2669', file: "2669/Art2669.glb", name: 'Applicazione Fiore', image: '_2669.jpg', type: 'application', category: '1' },
  { id: 'B2675', file: "2675/Art2675.glb", name: 'Applicazione Pieta', image: '_2675.jpg', type: 'application', category: '1' },
  { id: 'B2735', file: "2735/Art2735.glb", name: 'Applicazione Madonna', image: '_2735.jpg', type: 'application', category: '1' },
  { id: 'B2830', file: "2830/Art2830.glb", name: 'Applicazione Cristo', image: '_2830.jpg', type: 'application', category: '1' },
  { id: 'B4118', file: "4118/Art4118.glb", name: 'Applicazione Fiore', image: '_4118.jpg', type: 'application', category: '1' },
  { id: 'B4131', file: "4131/4131.glb", name: 'Applicazione Uccello Su Note', image: '_4131.jpg', type: 'application', category: '1' },
  { id: 'B4640', file: "4640/4640.glb", name: 'Applicazione Lanterna', image: '_4640.jpg', type: 'application', category: '1' },
  { id: 'B4641', file: "4641/4641.glb", name: 'Applicazione Chiave', image: '_4641.jpg', type: 'application', category: '1' },
  { id: 'B4814', file: "4814/Art4814.glb", name: 'Croce PAR', image: '_4814.jpg', type: 'application', category: '1' },
  { id: 'B4831', file: "4816/Art4816.glb", name: 'Croce PAR', image: '_4816.jpg', type: 'application', category: '1' },
  { id: 'B4824', file: "4824/4824.glb", name: 'Applicazione Scrittore', image: '_4824.jpg', type: 'application', category: '1' },
  { id: 'B4841', file: "4841/Art4841.glb", name: 'Croce PAR', image: '_4841.jpg', type: 'application', category: '1' },
  { id: 'B4844', file: "4844/4844.glb", name: 'Applicazione Candela', image: '_4844.jpg', type: 'application', category: '1' },
  { id: 'A4862', file: "4862/4862.glb", name: '[to-be-delivered]', image: '4862.jpg', type: 'application', category: '1' },
  { id: 'B4866', file: "4866/Art4866.glb", name: 'Croce PAR', image: '_4866.jpg', type: 'application', category: '1' },
  { id: 'B4882', file: "4882/4882.glb", name: 'Applicazione Lanterna', image: '_4882.jpg', type: 'application', category: '1' },
  { id: 'B7647', file: "7647/Art7647.glb", name: 'Croce PAR', image: '_7647.jpg', type: 'application', category: '1' },
  { id: 'B4405', file: "4405/4405.glb", name: '[to-be-delivered]', image: '_4405.jpg', type: 'vase', category: '2' },

  // Statues (parent="3004" - treated as statues for base mounting)
  { id: 'K0320', file: "320/320.glb", name: 'Statue Angel', image: '_320.jpg', type: 'statue', category: '3' },
  { id: 'K2064', file: "2064/2064.glb", name: 'Statue Angel', image: '_2064.jpg', type: 'statue', category: '3' },
  { id: 'K0096', file: "96/96.glb", name: 'Statue Madonna', image: '_96.jpg', type: 'statue', category: '3' },
  { id: 'K2011', file: "307/307.glb", name: 'Statue Madonna', image: '_307.jpg', type: 'statue', category: '3' },
  { id: 'K0083', file: "83/83.glb", name: 'Statue Angel', image: '_83.jpg', type: 'statue', category: '3' },
  { id: 'K0146', file: "146/146.glb", name: 'Statue Christs', image: '_146.jpg', type: 'statue', category: '3' },
  { id: 'K0383', file: "383/383.glb", name: 'Statue Angel', image: '_383.jpg', type: 'statue', category: '3' },
  { id: 'K0397', file: "397/397.glb", name: 'Statue Angel', image: '_397.jpg', type: 'statue', category: '3' },
  
  // Vases (parent="3005" - base mounted)
  { id: 'K2213', file: "2213/2213.glb", name: 'Vase Tedesche Base Mounted', image: '_2213.jpg', type: 'vase', category: '2' },
  { id: 'K2638', file: "2638/2638.glb", name: 'Vase Table Mounted', image: '_2638.jpg', type: 'vase', category: '2' },
  { id: 'K2975', file: "2975/2975.glb", name: 'Vase Floris Base Mounted', image: '_2975.jpg', type: 'vase', category: '2' },
  { id: 'K7248', file: "7248/7248.glb", name: 'Vase Floris Base Mounted', image: '_7248.jpg', type: 'vase', category: '2' },
  { id: 'K7262', file: "7262/7262.glb", name: 'Lampada Cero Ter', image: '_7262.jpg', type: 'vase', category: '2' },
  { id: 'K7252', file: "7252/7252.glb", name: 'Lampada Cero Rose', image: '_7252.jpg', type: 'vase', category: '2' },
  { id: 'K4404', file: "4404/4404.glb", name: 'Lampada Cero Rose', image: '_4404.jpg', type: 'vase', category: '2' },
  { id: 'K2180', file: "2180/2180.glb", name: 'Lampada Cero Rose', image: '_2180.jpg', type: 'vase', category: '2' },

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
      {
        slug: 'cached-components',
        name: 'Cached Components',
        description: 'Example of cached components',
      },
      {
        slug: 'cached-functions',
        name: 'Cached Functions',
        description: 'Example of cached functions',
      },
      {
        slug: 'cached-routes',
        name: 'Cached Routes',
        description: 'Example of cached routes',
      },
      {
        slug: 'use-link-status',
        name: 'Use Link Status',
        description: 'Example of using link status',
      },
      {
        slug: 'view-transitions',
        name: 'View Transitions',
        description: 'Example of view transitions',
      },
      {
        slug: 'zustand-demo',
        name: 'Zustand Demo',
        description: 'Example of Zustand state management',
      },
      {
        slug: 'traditional-engraved-headstone',
        name: 'Traditional Engraved Headstone',
        description: 'Traditional engraved headstone example',
      },
      {
        slug: 'additions',
        name: 'Additions',
        description: 'Additions example',
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
        slug: 'select-additions',
        name: 'Select Additions',
        description:
          'Additions are three dimensional mouldings highlighted in bronze. They come in a variety of themes in a number of fixed sizes. Emblems help express feelings and ideas that might not be possible with words.',
      },
      {
        slug: 'select-motifs',
        name: 'Select Motifs',
        description:
          'Browse and select from 49 categories of decorative motifs to personalize your memorial. Choose from traditional engravings, religious symbols, nature themes, and more.',
      },
      {
        slug: 'check-price',
        name: 'Check Price',
        description:
          'View a detailed breakdown of your headstone pricing including all inscriptions, motifs, and additions.',
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
  motifs,
  additions,
  demos,
};
