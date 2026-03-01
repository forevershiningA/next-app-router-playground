import { readFileSync } from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { additions } from '../lib/db/schema';

// Load environment variables
config({ path: '.env.local' });

interface ParsedAddition {
  id: string;
  name: string;
  type: 'application' | 'vase';
  category_id: string;
  category_name: string;
  thumbnail_url: string;
  model_3d_url: string;
  sizes: Array<{
    variant: number;
    code: string;
    width_mm: number;
    height_mm: number;
    depth_mm: number;
    weight_kg?: number;
    available: boolean;
    price_wholesale: number;
    price_retail: number;
    note?: string;
  }>;
}

async function seedAdditions() {
  console.log('🌱 Seeding additions...\n');

  // Initialize database connection
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  // Read the parsed JSON
  const jsonPath = path.join(process.cwd(), 'data', 'additions-parsed.json');
  const jsonContent = readFileSync(jsonPath, 'utf-8');
  const parsedAdditions: ParsedAddition[] = JSON.parse(jsonContent);

  console.log(`📦 Found ${parsedAdditions.length} additions to seed`);

  // Clear existing additions
  await db.delete(additions);
  console.log('🧹 Cleared existing additions');

  // Insert additions in batches
  let inserted = 0;
  for (const addition of parsedAdditions) {
    await db.insert(additions).values({
      id: addition.id,
      name: addition.name,
      type: addition.type,
      categoryId: addition.category_id,
      categoryName: addition.category_name,
      thumbnailUrl: addition.thumbnail_url,
      model3dUrl: addition.model_3d_url,
      sizes: addition.sizes as any,
      isActive: true,
    });
    inserted++;
    if (inserted % 10 === 0) {
      process.stdout.write(`\r✨ Inserted ${inserted}/${parsedAdditions.length} additions...`);
    }
  }

  console.log(`\n✅ Successfully seeded ${inserted} additions!\n`);

  // Print summary
  const categoryCounts = parsedAdditions.reduce((acc, add) => {
    acc[add.category_name] = (acc[add.category_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Summary by category:');
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} additions`);
  });

  // Print size variant statistics
  const sizeStats = {
    single: 0,
    multiple: 0,
    max: 0,
  };

  parsedAdditions.forEach(add => {
    if (add.sizes.length === 1) {
      sizeStats.single++;
    } else {
      sizeStats.multiple++;
    }
    if (add.sizes.length > sizeStats.max) {
      sizeStats.max = add.sizes.length;
    }
  });

  console.log('\n📏 Size variants:');
  console.log(`  Single size: ${sizeStats.single}`);
  console.log(`  Multiple sizes: ${sizeStats.multiple}`);
  console.log(`  Max variants: ${sizeStats.max}`);

  await client.end();
}

seedAdditions()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error seeding additions:', error);
    process.exit(1);
  });
