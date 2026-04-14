// Seed backgrounds table from backgrounds.xml (Full Colour Plaque backgrounds)
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { backgrounds } from '../lib/db/schema';
import { readFileSync } from 'fs';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema: { backgrounds } });

// Parse backgrounds from backgrounds.xml
function parseBackgroundsFromXml(): Array<{
  id: string;
  name: string;
  sortOrder: number;
}> {
  const xmlPath = resolve(process.cwd(), 'public/xml/au_EN/backgrounds.xml');
  const xml = readFileSync(xmlPath, 'utf-8');

  const entries: Array<{ id: string; name: string; sortOrder: number }> = [];

  const materialRegex = /<material\s+([^>]+)\/?>/g;
  let match;
  while ((match = materialRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const getAttr = (name: string) => {
      const m = attrs.match(new RegExp(`${name}="([^"]*)"`));
      return m ? m[1] : '';
    };

    const id = getAttr('id');
    const name = getAttr('name').trim();

    if (id && name) {
      entries.push({ id, name, sortOrder: parseInt(id, 10) });
    }
  }

  return entries;
}

async function seedBackgrounds() {
  try {
    const bgData = parseBackgroundsFromXml();

    if (bgData.length === 0) {
      console.error('❌ No backgrounds parsed from XML');
      process.exit(1);
    }

    console.log('🔄 Clearing existing backgrounds...');
    await db.delete(backgrounds);

    console.log(`📦 Inserting ${bgData.length} backgrounds...`);

    const inserted = [];
    for (const bg of bgData) {
      const slug = `bg-${bg.id}`;
      const result = await db
        .insert(backgrounds)
        .values({
          slug,
          name: bg.name,
          sortOrder: bg.sortOrder,
          textureUrl: `/jpg/backgrounds/forever/l/${bg.id}.jpg`,
          thumbnailUrl: `/jpg/backgrounds/forever/m/${bg.id}.jpg`,
        })
        .returning();
      inserted.push(result[0]);
    }

    console.log(`✅ Successfully seeded ${inserted.length} backgrounds!`);
    console.log('\n📋 Inserted backgrounds:');
    inserted.forEach((bg) => {
      console.log(`  ${bg.sortOrder}. ${bg.name} (slug: ${bg.slug})`);
    });

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding backgrounds:', error);
    await client.end();
    process.exit(1);
  }
}

seedBackgrounds();
