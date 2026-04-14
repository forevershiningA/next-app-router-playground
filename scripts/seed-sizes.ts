// Seed sizes table from sizes.xml (product 201 = Full Colour Plaque)
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sizes } from '../lib/db/schema';
import { readFileSync } from 'fs';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema: { sizes } });

// Parse sizes from the XML file
function parseSizesFromXml(): Array<{
  sortOrder: number;
  widthMm: number;
  heightMm: number;
  priceCents: number;
}> {
  const xmlPath = resolve(process.cwd(), 'public/xml/au_EN/sizes.xml');
  const xml = readFileSync(xmlPath, 'utf-8');

  // Extract <type> elements from product 201 (full-colour-plaque)
  const sizeEntries: Array<{
    sortOrder: number;
    widthMm: number;
    heightMm: number;
    priceCents: number;
  }> = [];

  // Match type elements
  const typeRegex = /<type\s+([^>]+)\/>/g;
  let match;
  while ((match = typeRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const getId = (name: string) => {
      const m = attrs.match(new RegExp(`${name}="([^"]*)"`));
      return m ? m[1] : '';
    };

    const code = getId('code');
    if (code !== 'full-colour-plaque') continue;

    const id = parseInt(getId('id'), 10);
    const width = parseInt(getId('init_width'), 10);
    const height = parseInt(getId('init_height'), 10);

    sizeEntries.push({ sortOrder: id, widthMm: width, heightMm: height, priceCents: 0 });
  }

  // Match prices to sizes by index (price nr matches type id)
  const priceRegex = /<price\s+([^>]+)\/>/g;
  while ((match = priceRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const getAttr = (name: string) => {
      const m = attrs.match(new RegExp(`${name}="([^"]*)"`));
      return m ? m[1] : '';
    };

    const code = getAttr('code');
    if (code !== 'full-colour-plaque') continue;

    const nr = parseInt(getAttr('nr'), 10);
    const model = getAttr('model');
    // Price model format: "350.00+0($q-0)" → base price is 350.00
    const priceMatch = model.match(/^([\d.]+)/);
    const priceDollars = priceMatch ? parseFloat(priceMatch[1]) : 0;

    const entry = sizeEntries.find((s) => s.sortOrder === nr);
    if (entry) {
      entry.priceCents = Math.round(priceDollars * 100);
    }
  }

  return sizeEntries;
}

async function seedSizes() {
  try {
    const sizeData = parseSizesFromXml();

    if (sizeData.length === 0) {
      console.error('❌ No sizes parsed from XML');
      process.exit(1);
    }

    console.log('🔄 Clearing existing sizes for full-colour-plaque...');
    await db.delete(sizes);

    console.log(`📦 Inserting ${sizeData.length} sizes...`);

    const inserted = [];
    for (const s of sizeData) {
      const result = await db
        .insert(sizes)
        .values({
          productCode: 'full-colour-plaque',
          sortOrder: s.sortOrder,
          widthMm: s.widthMm,
          heightMm: s.heightMm,
          priceCents: s.priceCents,
        })
        .returning();
      inserted.push(result[0]);
    }

    console.log(`✅ Successfully seeded ${inserted.length} sizes!`);
    console.log('\n📋 Inserted sizes:');
    inserted.forEach((s) => {
      console.log(
        `  ${s.sortOrder}. ${s.widthMm}×${s.heightMm}mm — $${(s.priceCents / 100).toFixed(2)}`,
      );
    });

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding sizes:', error);
    await client.end();
    process.exit(1);
  }
}

seedSizes();
