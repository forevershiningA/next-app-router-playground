import type { Shape, GraniteMaterial } from './types';

/* ── Traditional headstone shapes (from parent project SVGs) ── */
/* shapeIndex = zero-based position in catalog-id-102.xml <shapes> list */
export const shapes: Shape[] = [
  { id: '1',  name: 'Cropped Peak',  svgFile: 'cropped_peak.svg', shapeIndex: 0 },
  { id: '2',  name: 'Curved Gable',  svgFile: 'curved_gable.svg', shapeIndex: 1 },
  { id: '3',  name: 'Curved Peak',   svgFile: 'curved_peak.svg', shapeIndex: 2 },
  { id: '4',  name: 'Curved Top',    svgFile: 'curved_top.svg', shapeIndex: 3 },
  { id: '5',  name: 'Half Round',    svgFile: 'half_round.svg', shapeIndex: 5 },
  { id: '6',  name: 'Gable',         svgFile: 'gable.svg', shapeIndex: 4 },
  { id: '7',  name: 'Left Wave',     svgFile: 'left_wave.svg', shapeIndex: 6 },
  { id: '8',  name: 'Peak',          svgFile: 'peak.svg', shapeIndex: 7 },
  { id: '9',  name: 'Right Wave',    svgFile: 'right_wave.svg', shapeIndex: 8 },
  { id: '10', name: 'Serpentine',     svgFile: 'serpentine.svg', shapeIndex: 9 },
  { id: '11', name: 'Square',        svgFile: 'square.svg', shapeIndex: 10 },
];

/* ── Granite / stone materials (textures from parent project) ── */
export const materials: GraniteMaterial[] = [
  { id: '1',  name: 'Sandstone',          textureFile: 'Sandstone.webp' },
  { id: '2',  name: 'White Carrara',      textureFile: 'White-Carrara.webp' },
  { id: '3',  name: 'G633',               textureFile: 'G633.webp' },
  { id: '4',  name: 'G439',               textureFile: 'G439.webp' },
  { id: '5',  name: 'G623',               textureFile: 'G623.webp' },
  { id: '6',  name: 'G654',               textureFile: 'G654.webp' },
  { id: '7',  name: 'G788',               textureFile: 'G788.webp' },
  { id: '8',  name: 'Australian Grandee',  textureFile: 'Australian-Grandee.webp' },
  { id: '9',  name: 'African Black',      textureFile: 'African-Black.webp' },
  { id: '10', name: 'Glory Gold Spots',   textureFile: 'Glory-Gold-Spots.webp' },
  { id: '11', name: 'Glory Black',        textureFile: 'Glory-Black-2.webp' },
  { id: '12', name: 'Sapphire Brown',     textureFile: 'Saphire-Brown.webp' },
  { id: '13', name: 'African Red',        textureFile: 'African-Red.webp' },
  { id: '14', name: 'Balmoral Red',       textureFile: 'Balmoral-Red.webp' },
  { id: '15', name: 'Imperial Red',       textureFile: 'Imperial-Red.webp' },
  { id: '16', name: 'Multicolour Red',    textureFile: 'Multicolour-red.webp' },
  { id: '17', name: 'Noble Red',          textureFile: 'Noble-Red.webp' },
  { id: '18', name: 'Chinese Calca',      textureFile: 'Chinese-Calca.webp' },
  { id: '19', name: 'English Brown',      textureFile: 'English-Brown.webp' },
  { id: '20', name: 'Paradiso',           textureFile: 'Paradiso.webp' },
  { id: '21', name: 'Blue Pearl',         textureFile: 'Blue-Pearl.webp' },
  { id: '22', name: 'Vizage Blue',        textureFile: 'Vizage-Blue.webp' },
  { id: '23', name: 'Emerald Pearl',      textureFile: 'Emerald-Pearl.webp' },
  { id: '24', name: 'Australian Calca',   textureFile: 'Australian-Calca.webp' },
  { id: '25', name: 'Balmoral Green',     textureFile: 'Balmoral-Green.webp' },
  { id: '26', name: 'Marron Brown',       textureFile: 'Marron-Brown.webp' },
  { id: '27', name: 'Noble Black',        textureFile: 'Noble-Black.webp' },
  { id: '28', name: 'Darwin Brown',       textureFile: 'Darwin-Brown.webp' },
  { id: '29', name: 'G9426',              textureFile: 'G9426.webp' },
];

/* ── Inscription colour samples ── */
export const inscriptionColors = [
  { name: 'Gold Gilding',    hex: '#c99d44' },
  { name: 'Silver Gilding',  hex: '#eeeeee' },
  { name: 'White',           hex: '#ffffff' },
  { name: 'Black',           hex: '#000000' },
  { name: 'Sherwood Green',  hex: '#154733' },
  { name: 'Indigo',          hex: '#510b76' },
  { name: 'International Orange', hex: '#fd4f00' },
  { name: 'Ruby',            hex: '#d41568' },
  { name: 'Smalt Blue',      hex: '#00269a' },
];

/* ── Fonts available in the designer ── */
export const fonts = [
  'Adorable', 'Arial', 'Chopin Script', 'Dobkin', 'Franklin Gothic',
  'French Script', 'Garamond', 'Great Vibes', 'Lucida Calligraphy', 'Xirwena',
];

/* ── Motif category samples ── */
export const motifCategories = [
  'Religious', 'Flowers', 'Hearts & Ribbons', 'Birds', 'Butterflies',
  'Australiana', 'Celtic & Tribal', 'Music & Dance', 'Sports & Fitness',
  'Nautical', 'Military & Official', 'Plants & Trees',
];

/* ── How-it-works steps ── */
export const steps = [
  {
    num: 1,
    title: 'Choose a Shape',
    desc: 'Pick from 11 classic headstone profiles — serpentine, peak, gable, and more.',
  },
  {
    num: 2,
    title: 'Select Your Granite',
    desc: 'Over 25 natural stone colours from Australian sandstone to African black granite.',
  },
  {
    num: 3,
    title: 'Set the Size',
    desc: "Adjust width and height to meet your cemetery's regulations (300\u2009–\u20091\u2009200\u2009mm).",
  },
  {
    num: 4,
    title: 'Add Inscriptions',
    desc: '10 professional fonts, 30+ colours including gold and silver gilding.',
  },
  {
    num: 5,
    title: 'Add Motifs & Get a Quote',
    desc: 'Browse hundreds of decorative motifs, then receive an instant price breakdown.',
  },
];
