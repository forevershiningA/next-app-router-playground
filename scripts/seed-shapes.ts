// Seed shapes table with correct headstone shapes from _data.ts
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { shapes } from '../lib/db/schema';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set');
  console.error('Checked path:', resolve(process.cwd(), '.env.local'));
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema: { shapes } });

// Traditional shapes (first 11)
const traditionalShapes = [
  { id: '1', name: 'Cropped Peak', image: 'cropped_peak.svg', category: 'traditional' },
  { id: '2', name: 'Curved Gable', image: 'curved_gable.svg', category: 'traditional' },
  { id: '3', name: 'Curved Peak', image: 'curved_peak.svg', category: 'traditional' },
  { id: '4', name: 'Curved Top', image: 'curved_top.svg', category: 'traditional' },
  { id: '5', name: 'Half Round', image: 'half_round.svg', category: 'traditional' },
  { id: '6', name: 'Gable', image: 'gable.svg', category: 'traditional' },
  { id: '7', name: 'Left Wave', image: 'left_wave.svg', category: 'traditional' },
  { id: '8', name: 'Peak', image: 'peak.svg', category: 'traditional' },
  { id: '9', name: 'Right Wave', image: 'right_wave.svg', category: 'traditional' },
  { id: '10', name: 'Serpentine', image: 'serpentine.svg', category: 'traditional' },
  { id: '11', name: 'Square', image: 'square.svg', category: 'traditional' },
];

// Modern shapes (all the rest)
const modernShapes = [
  { id: '12', name: 'Headstone 1', image: 'headstone_1.svg', category: 'modern' },
  { id: '13', name: 'Headstone 2', image: 'headstone_2.svg', category: 'modern' },
  { id: '14', name: 'Guitar 1', image: 'headstone_3.svg', category: 'modern' },
  { id: '15', name: 'Guitar 2', image: 'headstone_4.svg', category: 'modern' },
  { id: '16', name: 'Guitar 3', image: 'headstone_5.svg', category: 'modern' },
  { id: '17', name: 'Guitar 4', image: 'headstone_6.svg', category: 'modern' },
  { id: '18', name: 'Guitar 5', image: 'headstone_7.svg', category: 'modern' },
  { id: '19', name: 'Headstone 3', image: 'headstone_8.svg', category: 'modern' },
  { id: '20', name: 'Headstone 4', image: 'headstone_9.svg', category: 'modern' },
  { id: '21', name: 'Headstone 5', image: 'headstone_10.svg', category: 'modern' },
  { id: '22', name: 'Headstone 6', image: 'headstone_11.svg', category: 'modern' },
  { id: '23', name: 'Headstone 7', image: 'headstone_12.svg', category: 'modern' },
  { id: '24', name: 'Headstone 8', image: 'headstone_13.svg', category: 'modern' },
  { id: '25', name: 'Headstone 9', image: 'headstone_14.svg', category: 'modern' },
  { id: '26', name: 'Headstone 10', image: 'headstone_15.svg', category: 'modern' },
  { id: '27', name: 'Headstone 11', image: 'headstone_16.svg', category: 'modern' },
  { id: '28', name: 'Headstone 12', image: 'headstone_17.svg', category: 'modern' },
  { id: '29', name: 'Headstone 13', image: 'headstone_18.svg', category: 'modern' },
  { id: '30', name: 'Headstone 14', image: 'headstone_19.svg', category: 'modern' },
  { id: '31', name: 'Headstone 15', image: 'headstone_20.svg', category: 'modern' },
  { id: '32', name: 'Headstone 16', image: 'headstone_21.svg', category: 'modern' },
  { id: '33', name: 'Headstone 17', image: 'headstone_22.svg', category: 'modern' },
  { id: '34', name: 'Headstone 18', image: 'headstone_23.svg', category: 'modern' },
  { id: '35', name: 'Headstone 19', image: 'headstone_24.svg', category: 'modern' },
  { id: '36', name: 'Headstone 20', image: 'headstone_25.svg', category: 'modern' },
  { id: '37', name: 'Headstone 21', image: 'headstone_26.svg', category: 'modern' },
  { id: '38', name: 'Headstone 22', image: 'headstone_27.svg', category: 'modern' },
  { id: '39', name: 'Headstone 23', image: 'headstone_28.svg', category: 'modern' },
  { id: '40', name: 'Headstone 24', image: 'headstone_29.svg', category: 'modern' },
  { id: '41', name: 'Headstone 25', image: 'headstone_30.svg', category: 'modern' },
  { id: '42', name: 'Headstone 26', image: 'headstone_31.svg', category: 'modern' },
  { id: '43', name: 'Headstone 27', image: 'headstone_32.svg', category: 'modern' },
  { id: '44', name: 'Headstone 28', image: 'headstone_33.svg', category: 'modern' },
  { id: '45', name: 'Headstone 29', image: 'headstone_34.svg', category: 'modern' },
  { id: '46', name: 'Headstone 30', image: 'headstone_35.svg', category: 'modern' },
  { id: '47', name: 'Headstone 31', image: 'headstone_36.svg', category: 'modern' },
  { id: '48', name: 'Headstone 32', image: 'headstone_38.svg', category: 'modern' },
  { id: '49', name: 'Headstone 33', image: 'headstone_40.svg', category: 'modern' },
  { id: '50', name: 'Headstone 34', image: 'headstone_41.svg', category: 'modern' },
  { id: '51', name: 'Headstone 35', image: 'headstone_42.svg', category: 'modern' },
  { id: '52', name: 'Headstone 36', image: 'headstone_43.svg', category: 'modern' },
  { id: '53', name: 'Headstone 37', image: 'headstone_44.svg', category: 'modern' },
  { id: '54', name: 'Headstone 38', image: 'headstone_45.svg', category: 'modern' },
  { id: '55', name: 'Headstone 39', image: 'headstone_46.svg', category: 'modern' },
];

const allShapes = [...traditionalShapes, ...modernShapes];

async function seedShapes() {
  try {
    console.log('🔄 Clearing existing shapes...');
    await db.delete(shapes);

    console.log(`📦 Inserting ${allShapes.length} headstone shapes...`);
    console.log(`   - ${traditionalShapes.length} traditional shapes`);
    console.log(`   - ${modernShapes.length} modern shapes`);
    
    const insertedShapes = [];
    for (const shape of allShapes) {
      const result = await db.insert(shapes).values({
        slug: shape.name.toLowerCase().replace(/\s+/g, '-'),
        name: shape.name,
        section: shape.category, // 'traditional' or 'modern'
        maskKey: shape.image.replace('.svg', ''), // Remove .svg extension for mask key
        previewUrl: `/shapes/headstones/${shape.image}`,
        attributes: {
          svgPath: `/shapes/headstones/${shape.image}`,
          category: shape.category,
        },
        isActive: true,
      }).returning();
      insertedShapes.push(result[0]);
    }

    console.log(`✅ Successfully seeded ${allShapes.length} headstone shapes!`);
    console.log('\n📋 Summary:');
    console.log(`   Traditional shapes: ${insertedShapes.filter(s => s.section === 'traditional').length}`);
    console.log(`   Modern shapes: ${insertedShapes.filter(s => s.section === 'modern').length}`);
    
    console.log('\n📋 First 10 shapes:');
    insertedShapes.slice(0, 10).forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (slug: ${s.slug}, section: ${s.section}, id: ${s.id})`);
    });
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding shapes:', error);
    await client.end();
    process.exit(1);
  }
}

seedShapes();
