// Quick script to check borders in database
import { catalog } from './lib/catalog-db.js';

async function test() {
  try {
    const borders = await catalog.borders.findMany({ limit: 10 });
    console.log('Borders from database:');
    console.table(borders.map(b => ({
      slug: b.slug,
      name: b.name,
      category: b.category,
      svgUrl: b.svgUrl
    })));
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

test();
