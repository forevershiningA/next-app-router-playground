/**
 * Migration script to populate all 49 motif categories from _data.ts
 * Run with: tsx scripts/migrate-motif-categories.js
 */

import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from '../lib/db/index';

const motifCategories = [
  // Animals categories
  { sku: 'MOTIF-CAT-AQUATIC', name: 'Aquatic Animals', category: 'aquatic', tags: ['animals', 'water', 'sea'], price_cents: 10000, preview_url: '/png/motifs/s/whale_002.png', src: 'Animals/Aquatic', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-BIRDS', name: 'Birds', category: 'birds', tags: ['animals', 'birds', 'flight'], price_cents: 10000, preview_url: '/png/motifs/s/dove_002.png', src: 'Animals/Birds', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-BUTTERFLIES', name: 'Butterflies', category: 'butterflies', tags: ['animals', 'insects', 'transformation'], price_cents: 10000, preview_url: '/png/motifs/s/butterfly_005.png', src: 'Animals/Butterflies', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-CATS', name: 'Cats', category: 'cats', tags: ['animals', 'pets', 'feline'], price_cents: 10000, preview_url: '/png/motifs/s/2_056_04.png', src: 'Animals/Cats', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-DOGS', name: 'Dogs', category: 'dogs', tags: ['animals', 'pets', 'canine'], price_cents: 10000, preview_url: '/png/motifs/s/1_137_10.png', src: 'Animals/Dogs', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-FARM', name: 'Farm Animals', category: 'farm-animal', tags: ['animals', 'farm', 'livestock'], price_cents: 10000, preview_url: '/png/motifs/s/1_138_12.png', src: 'Animals/Farm-Animal', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-HORSES', name: 'Horses', category: 'horses', tags: ['animals', 'equine', 'noble'], price_cents: 10000, preview_url: '/png/motifs/s/horse_009.png', src: 'Animals/Horses', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-INSECTS', name: 'Insects', category: 'insects', tags: ['animals', 'insects', 'nature'], price_cents: 10000, preview_url: '/png/motifs/s/dragonfly_03.png', src: 'Animals/Insects', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-MYSTICAL', name: 'Mystical Animals', category: 'mystical-animals', tags: ['animals', 'fantasy', 'mythical'], price_cents: 10000, preview_url: '/png/motifs/s/2_061_17.png', src: 'Animals/Mystical-Animals', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-PREHISTORIC', name: 'Prehistoric', category: 'prehistoric', tags: ['animals', 'dinosaurs', 'ancient'], price_cents: 10000, preview_url: '/png/motifs/s/1_135_02.png', src: 'Animals/Prehistoric', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-REPTILES', name: 'Reptiles', category: 'reptiles', tags: ['animals', 'reptiles', 'scales'], price_cents: 10000, preview_url: '/png/motifs/s/1_173_05.png', src: 'Animals/Reptiles', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-WORLD-ANIMALS', name: 'World Animals', category: 'world-animals', tags: ['animals', 'wildlife', 'global'], price_cents: 10000, preview_url: '/png/motifs/s/1_145_20.png', src: 'Animals/World-Animals', traditional: true, ss: true },
  
  // Regional & Cultural
  { sku: 'MOTIF-CAT-AUS-WILDLIFE', name: 'Australian Wildlife', category: 'aus-wildlife', tags: ['australian', 'wildlife', 'native'], price_cents: 10000, preview_url: '/png/motifs/s/gecko_003.png', src: 'Aus-Wildlife', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-AUS-FLORA', name: 'Australian Flora', category: 'aus-flora', tags: ['australian', 'plants', 'native'], price_cents: 10000, preview_url: '/png/motifs/s/banksiarufa.png', src: 'Australiana-Flora', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-ISLANDER', name: 'Islander', category: 'islander', tags: ['pacific', 'islander', 'cultural'], price_cents: 10000, preview_url: '/png/motifs/s/1_140_12.png', src: 'Islander', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-USA', name: 'American', category: 'american', tags: ['usa', 'american', 'patriotic'], price_cents: 10000, preview_url: '/png/motifs/s/1_127_23.png', src: 'American', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-TRIBAL', name: 'Tribal', category: 'tribal', tags: ['tribal', 'indigenous', 'traditional'], price_cents: 10000, preview_url: '/png/motifs/s/1_206_16.png', src: 'Tribal', traditional: true, ss: false },
  
  // Architecture & Design
  { sku: 'MOTIF-CAT-ARCHITECTURAL', name: 'Architectural', category: 'architectural', tags: ['architecture', 'buildings', 'structures'], price_cents: 10000, preview_url: '/png/motifs/s/1_217_23.png', src: 'Architectural', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-BORDERS', name: 'Borders', category: 'borders', tags: ['borders', 'decorative', 'frames'], price_cents: 10000, preview_url: '/png/motifs/s/1_018_10.png', src: 'Borders', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-CORNERS', name: 'Corners', category: 'corners', tags: ['corners', 'decorative', 'accents'], price_cents: 10000, preview_url: '/png/motifs/s/1_208_03.png', src: 'Borders-Corners', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-FLORISH', name: 'Florish', category: 'florish', tags: ['decorative', 'ornamental', 'elegant'], price_cents: 10000, preview_url: '/png/motifs/s/1_011_09.png', src: 'Florish', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-FLOURISHES', name: 'Flourishes', category: 'flourishes', tags: ['decorative', 'ornamental', 'swirls'], price_cents: 10000, preview_url: '/png/motifs/s/2_139_07.png', src: 'Flourishes', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-SHAPES-PATTERNS', name: 'Shapes and Patterns', category: 'shapes-patterns', tags: ['geometric', 'patterns', 'shapes'], price_cents: 10000, preview_url: '/png/motifs/s/2_147_09.png', src: 'Shapes-and-Patterns', traditional: true, ss: true },
  
  // Nature & Flora
  { sku: 'MOTIF-CAT-FLOWERS', name: 'Flower Inserts', category: 'flowers', tags: ['flowers', 'floral', 'botanical'], price_cents: 10000, preview_url: '/png/motifs/s/flower rose_03.png', src: 'Flowers', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-PLANTS-TREES', name: 'Plants and Trees', category: 'plants-trees', tags: ['plants', 'trees', 'nature'], price_cents: 10000, preview_url: '/png/motifs/s/1_158_16.png', src: 'Plants-and-Trees', traditional: true, ss: false },
  
  // Symbols & Icons
  { sku: 'MOTIF-CAT-ARROW', name: 'Arrows', category: 'arrows', tags: ['arrows', 'direction', 'symbols'], price_cents: 10000, preview_url: '/png/motifs/s/1_207_07.png', src: 'Arrow', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-HEARTS', name: 'Hearts and Ribbons', category: 'hearts', tags: ['hearts', 'love', 'ribbons'], price_cents: 10000, preview_url: '/png/motifs/s/2_155_14.png', src: 'Hearts-and-Ribbons', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-MOON-STARS', name: 'Moon and Stars', category: 'moon-stars', tags: ['celestial', 'moon', 'stars'], price_cents: 10000, preview_url: '/png/motifs/s/2_082_17.png', src: 'Moon-Stars-Sun', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-ZODIAC', name: 'Zodiac Symbols', category: 'zodiac', tags: ['zodiac', 'astrology', 'symbols'], price_cents: 10000, preview_url: '/png/motifs/s/zodiac_003.png', src: 'Symbols-Zodiac', traditional: true, ss: true },
  
  // Religious & Spiritual
  { sku: 'MOTIF-CAT-RELIGIOUS', name: 'Religious', category: 'religious', tags: ['religious', 'faith', 'spiritual'], price_cents: 10000, preview_url: '/png/motifs/s/angel_001.png', src: 'Religious', traditional: true, ss: true },
  
  // Lifestyle & Hobbies
  { sku: 'MOTIF-CAT-CARTOONS', name: 'Cartoons and Animals', category: 'cartoons', tags: ['cartoons', 'playful', 'fun'], price_cents: 10000, preview_url: '/png/motifs/s/1_055_01.png', src: 'Animals', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-CHILDREN-TOYS', name: 'Children Toys', category: 'children-toys', tags: ['children', 'toys', 'playful'], price_cents: 10000, preview_url: '/png/motifs/s/teddy-bear_003.png', src: 'Children-Toys', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-FOOD-DRINK', name: 'Food and Drink', category: 'food-drink', tags: ['food', 'drink', 'culinary'], price_cents: 10000, preview_url: '/png/motifs/s/2_117_01.png', src: 'Food-and-Drink', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-HISTORY', name: 'History and Culture', category: 'history', tags: ['history', 'culture', 'heritage'], price_cents: 10000, preview_url: '/png/motifs/s/2_079_03.png', src: 'History-and-Culture', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-HOLIDAY', name: 'Holiday', category: 'holiday', tags: ['holiday', 'celebration', 'seasonal'], price_cents: 10000, preview_url: '/png/motifs/s/clover_001.png', src: 'Holiday', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-HOUSEHOLD', name: 'Household Items', category: 'household', tags: ['household', 'home', 'items'], price_cents: 10000, preview_url: '/png/motifs/s/2_092_15.png', src: 'Household-Items', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-ICONIC-PLACES', name: 'Iconic Places', category: 'iconic-places', tags: ['places', 'landmarks', 'iconic'], price_cents: 10000, preview_url: '/png/motifs/s/2_111_05.png', src: 'Iconic-Places', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-MUSIC-DANCE', name: 'Music and Dance', category: 'music-dance', tags: ['music', 'dance', 'performance'], price_cents: 10000, preview_url: '/png/motifs/s/1_172_08.png', src: 'Music-and-Dance', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-NAUTICLE', name: 'Nautical', category: 'nautical', tags: ['nautical', 'marine', 'sea'], price_cents: 10000, preview_url: '/png/motifs/s/anchor_001.png', src: 'Nauticle', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-OFFICIAL', name: 'Official', category: 'official', tags: ['official', 'emblems', 'badges'], price_cents: 10000, preview_url: '/png/motifs/s/1_127_06.png', src: 'Official', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-PETS', name: 'Pets', category: 'pets', tags: ['pets', 'companion', 'animals'], price_cents: 10000, preview_url: '/png/motifs/s/paw_001.png', src: 'Pets', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-SKULLS-WEAPONS', name: 'Skulls and Weapons', category: 'skulls-weapons', tags: ['skulls', 'weapons', 'military'], price_cents: 10000, preview_url: '/png/motifs/s/1_061_07.png', src: 'Skulls-and-Weapons', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-SPORT-FITNESS', name: 'Sport and Fitness', category: 'sport-fitness', tags: ['sports', 'fitness', 'athletics'], price_cents: 10000, preview_url: '/png/motifs/s/2_120_13.png', src: 'Sport-and-Fitness', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-TEXT', name: 'Text', category: 'text', tags: ['text', 'typography', 'lettering'], price_cents: 10000, preview_url: '/png/motifs/s/2_172_21.png', src: 'Text', traditional: true, ss: false },
  { sku: 'MOTIF-CAT-TOOLS-OFFICE', name: 'Tools and Professions', category: 'tools-office', tags: ['tools', 'professions', 'trades'], price_cents: 10000, preview_url: '/png/motifs/s/2_124_26.png', src: 'Tools-Office-Trades-and-Professions', traditional: true, ss: true },
  { sku: 'MOTIF-CAT-VEHICLES', name: 'Vehicles', category: 'vehicles', tags: ['vehicles', 'transportation', 'automotive'], price_cents: 10000, preview_url: '/png/motifs/s/1_188_24.png', src: 'Vehicles', traditional: true, ss: true },
  
  // Special Motif Types
  { sku: 'MOTIF-CAT-1COL', name: '1 Colour Motifs', category: '1-colour', tags: ['raised', 'single-color', 'monochrome'], price_cents: 10000, preview_url: '/png/motifs/s/f1_1.png', src: '1ColRaisedMotif', traditional: false, ss: false, col1: true },
  { sku: 'MOTIF-CAT-2COL', name: '2 Colour Motifs', category: '2-colour', tags: ['raised', 'two-color', 'multicolor'], price_cents: 10000, preview_url: '/png/motifs/s/01.png', src: '2ColRaisedMotif', traditional: false, ss: false, col2: true }
];

async function runMigration() {
  console.log('Starting motif categories migration...');
  
  try {
    for (const motif of motifCategories) {
      const attributes = {
        src: motif.src,
        traditional: motif.traditional,
        ss: motif.ss
      };
      
      if (motif.col1) attributes.col1 = true;
      if (motif.col2) attributes.col2 = true;
      
      await db.execute(sql`
        INSERT INTO motifs (sku, name, category, tags, price_cents, preview_url, svg_url, attributes, is_active)
        VALUES (
          ${motif.sku},
          ${motif.name},
          ${motif.category},
          ${sql.raw(`ARRAY[${motif.tags.map(t => `'${t}'`).join(', ')}]`)},
          ${motif.price_cents},
          ${motif.preview_url},
          '',
          ${JSON.stringify(attributes)}::jsonb,
          true
        )
        ON CONFLICT (sku) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          tags = EXCLUDED.tags,
          price_cents = EXCLUDED.price_cents,
          preview_url = EXCLUDED.preview_url,
          attributes = EXCLUDED.attributes,
          updated_at = NOW()
      `);
    }
    
    console.log(`✓ Successfully migrated ${motifCategories.length} motif categories!`);
    
    // Verify
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM motifs`);
    const count = result[0]?.count || result.rows?.[0]?.count || 'unknown';
    console.log(`Total motif categories in database: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
