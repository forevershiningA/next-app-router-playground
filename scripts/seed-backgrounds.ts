// Seed backgrounds table from backgrounds.xml (Full Colour Plaque backgrounds)
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { backgrounds } from '../lib/db/schema';
import { readFileSync, existsSync } from 'fs';

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

// Discover color textures from the filesystem
function discoverColors(): Array<{ id: string; name: string; sortOrder: number }> {
  const colorsDir = resolve(process.cwd(), 'public/jpg/backgrounds/colors/s');
  const entries: Array<{ id: string; name: string; sortOrder: number }> = [];

  for (let i = 1; i <= 99; i++) {
    const paddedId = String(i).padStart(2, '0');
    const filePath = resolve(colorsDir, `${paddedId}.jpg`);
    if (existsSync(filePath)) {
      entries.push({ id: String(i), name: `Color ${i}`, sortOrder: i });
    }
  }

  return entries;
}

async function seedBackgrounds() {
  try {
    const bgData = parseBackgroundsFromXml();
    const colorData = discoverColors();

    if (bgData.length === 0) {
      console.error('❌ No backgrounds parsed from XML');
      process.exit(1);
    }

    console.log('🔄 Clearing existing backgrounds...');
    await db.delete(backgrounds);

    // Seed backgrounds
    console.log(`📦 Inserting ${bgData.length} backgrounds...`);
    const insertedBg = [];
    for (const bg of bgData) {
      const numericId = String(parseInt(bg.id, 10));
      const slug = `bg-${numericId}`;
      const textureFile = resolve(process.cwd(), `public/jpg/backgrounds/forever/l/${numericId}.jpg`);
      const isActive = existsSync(textureFile);
      const result = await db
        .insert(backgrounds)
        .values({
          slug,
          name: bg.name,
          category: 'background',
          sortOrder: bg.sortOrder,
          textureUrl: `/jpg/backgrounds/forever/l/${numericId}.jpg`,
          thumbnailUrl: `/jpg/backgrounds/forever/m/${numericId}.jpg`,
          isActive,
        })
        .returning();
      insertedBg.push(result[0]);
    }

    // Seed colors
    console.log(`📦 Inserting ${colorData.length} colors...`);
    const insertedColors = [];
    for (const color of colorData) {
      const paddedId = color.id.padStart(2, '0');
      const slug = `color-${color.id}`;
      const result = await db
        .insert(backgrounds)
        .values({
          slug,
          name: color.name,
          category: 'color',
          sortOrder: color.sortOrder,
          textureUrl: `/jpg/backgrounds/colors/l/${paddedId}.jpg`,
          thumbnailUrl: `/jpg/backgrounds/colors/s/${paddedId}.jpg`,
          isActive: true,
        })
        .returning();
      insertedColors.push(result[0]);
    }

    console.log(`✅ Successfully seeded ${insertedBg.length} backgrounds + ${insertedColors.length} colors!`);
    console.log('\n📋 Inserted backgrounds:');
    insertedBg.forEach((bg) => {
      console.log(`  ${bg.sortOrder}. ${bg.name} (slug: ${bg.slug})${bg.isActive ? '' : ' [INACTIVE]'}`);
    });
    console.log('\n📋 Inserted colors:');
    insertedColors.forEach((c) => {
      console.log(`  ${c.sortOrder}. ${c.name} (slug: ${c.slug})`);
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
