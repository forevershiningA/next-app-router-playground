/**
 * Direct database test - bypasses Next.js-specific imports
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import {
  materials,
  shapes,
  borders,
  motifs,
} from '../lib/db/schema';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not found');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function testConnection() {
  console.log('🔌 Testing database connection...\n');

  try {
    // Test materials query
    console.log('📦 Fetching materials...');
    const allMaterials = await db.select().from(materials).where(eq(materials.isActive, true));
    console.log(`   ✅ Found ${allMaterials.length} active materials`);
    if (allMaterials.length > 0) {
      console.log(`   Example: ${allMaterials[0].name} (${allMaterials[0].slug})`);
    }

    // Test shapes query
    console.log('\n🔷 Fetching shapes...');
    const allShapes = await db.select().from(shapes).where(eq(shapes.isActive, true));
    console.log(`   ✅ Found ${allShapes.length} active shapes`);
    if (allShapes.length > 0) {
      console.log(`   Example: ${allShapes[0].name} (${allShapes[0].section})`);
    }

    // Test borders query
    console.log('\n🎨 Fetching borders...');
    const allBorders = await db.select().from(borders).where(eq(borders.isActive, true));
    console.log(`   ✅ Found ${allBorders.length} active borders`);
    if (allBorders.length > 0) {
      console.log(`   Example: ${allBorders[0].name} (${allBorders[0].category})`);
    }

    // Test motifs query
    console.log('\n🌸 Fetching motifs...');
    const allMotifs = await db.select().from(motifs).where(eq(motifs.isActive, true));
    console.log(`   ✅ Found ${allMotifs.length} active motifs`);
    if (allMotifs.length > 0) {
      console.log(`   Example: ${allMotifs[0].name} - $${(allMotifs[0].priceCents / 100).toFixed(2)}`);
    }

    // Test specific queries
    console.log('\n🔍 Testing specific queries...');
    const ceramicShapes = await db.select().from(shapes).where(eq(shapes.section, 'ceramic'));
    console.log(`   ✅ Found ${ceramicShapes.length} ceramic shapes`);

    const floralMotifs = await db.select().from(motifs).where(eq(motifs.category, 'floral'));
    console.log(`   ✅ Found ${floralMotifs.length} floral motifs`);

    console.log('\n✨ All database tests passed!\n');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

testConnection();
