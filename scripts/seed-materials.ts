// Seed materials table with correct granite materials from _data.ts
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { materials } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set');
  console.error('Checked path:', resolve(process.cwd(), '.env.local'));
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema: { materials } });

const graniteMaterials = [
  { id: '1', name: 'African Black', image: 'African-Black.webp', category: '2' },
  { id: '2', name: 'African Red', image: 'African-Red.webp', category: '2' },
  { id: '3', name: 'Australian Calca', image: 'Australian-Calca.webp', category: '2' },
  { id: '4', name: 'Australian Grandee', image: 'Australian-Grandee.webp', category: '2' },
  { id: '5', name: 'Balmoral Green', image: 'Balmoral-Green.webp', category: '2' },
  { id: '6', name: 'Balmoral Red', image: 'Balmoral-Red.webp', category: '2' },
  { id: '7', name: 'Blue Pearl', image: 'Blue-Pearl.webp', category: '2' },
  { id: '8', name: 'Chinese Calca', image: 'Chinese-Calca.webp', category: '2' },
  { id: '9', name: 'Darwin Brown', image: 'Darwin-Brown.webp', category: '2' },
  { id: '11', name: 'Emerald Pearl', image: 'Emerald-Pearl.webp', category: '2' },
  { id: '12', name: 'English Brown', image: 'English-Brown.webp', category: '2' },
  { id: '13', name: 'G439', image: 'G439.webp', category: '2' },
  { id: '14', name: 'G623', image: 'G623.webp', category: '2' },
  { id: '15', name: 'G633', image: 'G633.webp', category: '2' },
  { id: '16', name: 'G654', image: 'G654.webp', category: '2' },
  { id: '17', name: 'G788', image: 'G788.webp', category: '2' },
  { id: '18', name: 'Glory Gold Spots', image: 'Glory-Gold-Spots.webp', category: '2' },
  { id: '19', name: 'Glory Black', image: 'Glory-Black-2.webp', category: '2' },
  { id: '20', name: 'G9426', image: 'G9426.webp', category: '2' },
  { id: '21', name: 'Imperial Red', image: 'Imperial-Red.webp', category: '2' },
  { id: '22', name: 'Marron Brown', image: 'Marron-Brown.webp', category: '2' },
  { id: '23', name: 'Multicolour Red', image: 'Multicolour-red.webp', category: '2' },
  { id: '24', name: 'Noble Black', image: 'Noble-Black.webp', category: '2' },
  { id: '25', name: 'Noble Red', image: 'Noble-Red.webp', category: '2' },
  { id: '26', name: 'Paradiso', image: 'Paradiso.webp', category: '2' },
  { id: '27', name: 'Sandstone', image: 'Sandstone.webp', category: '2' },
  { id: '28', name: 'Sapphire Brown', image: 'Saphire-Brown.webp', category: '2' },
  { id: '29', name: 'Visage Blue', image: 'Vizage-Blue.webp', category: '2' },
  { id: '30', name: 'White Carrara', image: 'White-Carrara.webp', category: '2' },
];

async function seedMaterials() {
  try {
    console.log('🔄 Clearing existing materials...');
    await db.delete(materials);

    console.log('📦 Inserting 29 granite materials...');
    
    const insertedMaterials = [];
    for (const material of graniteMaterials) {
      const result = await db.insert(materials).values({
        slug: material.name.toLowerCase().replace(/\s+/g, '-'),
        name: material.name,
        category: 'granite',
        finish: 'polished',
        thumbnailUrl: `/textures/forever/l/${material.image}`,
        attributes: {
          textureUrl: `/textures/forever/l/${material.image}`,
        },
        isActive: true,
      }).returning();
      insertedMaterials.push(result[0]);
    }

    console.log('✅ Successfully seeded 29 granite materials!');
    console.log('\n📋 Inserted materials:');
    insertedMaterials.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name} (slug: ${m.slug}, id: ${m.id})`);
    });
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding materials:', error);
    await client.end();
    process.exit(1);
  }
}

seedMaterials();
