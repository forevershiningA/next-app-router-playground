#!/usr/bin/env node
/**
 * Database connection test
 * Verifies Drizzle ORM can connect to PostgreSQL and query catalog data
 */

import { config } from 'dotenv';
import { catalog } from '../lib/catalog-db.js';

// Load environment variables
config({ path: '.env.local' });

async function testConnection() {
  console.log('🔌 Testing database connection...\n');

  try {
    // Test materials query
    console.log('📦 Fetching materials...');
    const allMaterials = await catalog.materials.findMany({ where: { isActive: true } });
    console.log(`   ✅ Found ${allMaterials.length} active materials`);
    if (allMaterials.length > 0) {
      console.log(`   Example: ${allMaterials[0].name} (${allMaterials[0].slug})`);
    }

    // Test shapes query
    console.log('\n🔷 Fetching shapes...');
    const allShapes = await catalog.shapes.findMany({ where: { isActive: true } });
    console.log(`   ✅ Found ${allShapes.length} active shapes`);
    if (allShapes.length > 0) {
      console.log(`   Example: ${allShapes[0].name} (${allShapes[0].section})`);
    }

    // Test borders query
    console.log('\n🎨 Fetching borders...');
    const allBorders = await catalog.borders.findMany({ where: { isActive: true } });
    console.log(`   ✅ Found ${allBorders.length} active borders`);
    if (allBorders.length > 0) {
      console.log(`   Example: ${allBorders[0].name} (${allBorders[0].category})`);
    }

    // Test motifs query
    console.log('\n🌸 Fetching motifs...');
    const allMotifs = await catalog.motifs.findMany({ where: { isActive: true } });
    console.log(`   ✅ Found ${allMotifs.length} active motifs`);
    if (allMotifs.length > 0) {
      console.log(`   Example: ${allMotifs[0].name} - $${(allMotifs[0].priceCents / 100).toFixed(2)}`);
    }

    // Test specific queries
    console.log('\n🔍 Testing specific queries...');
    const graniteShapes = await catalog.shapes.findMany({ where: { section: 'ceramic' } });
    console.log(`   ✅ Found ${graniteShapes.length} ceramic shapes`);

    const floralMotifs = await catalog.motifs.findMany({ where: { category: 'floral' } });
    console.log(`   ✅ Found ${floralMotifs.length} floral motifs`);

    console.log('\n✨ All database tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
