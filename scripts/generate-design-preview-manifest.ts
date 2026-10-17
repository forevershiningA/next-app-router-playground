import fs from 'node:fs';
import path from 'node:path';
import { getAllSavedDesigns } from '../lib/saved-designs-data';

const output = path.join(process.cwd(), 'lib/design-preview-ids.json');
const directory = path.join(process.cwd(), 'public/screenshots/v2026-3d');
// Deliberately throw when the source directory is missing. An empty filesystem
// must never silently qualify the entire catalog for publication.
const files = new Set(fs.readdirSync(directory));
const ids = getAllSavedDesigns()
  .filter((design) => files.has(design.id + '.png'))
  .map((design) => design.id)
  .sort();
const content = JSON.stringify(ids, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== content) {
    throw new Error(
      'Preview manifest is stale. Run pnpm exec tsx scripts/generate-design-preview-manifest.ts',
    );
  }
} else {
  fs.writeFileSync(output, content);
}
console.log('Preview manifest: ' + ids.length + ' catalog designs');
