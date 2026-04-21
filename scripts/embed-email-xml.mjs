// Copies public/xml/countries24.xml and languages24.xml into
// lib/email/config/data/*.ts as raw string exports. This guarantees the XML
// content is bundled into the serverless function output, bypassing Vercel's
// outputFileTracingExcludes for public/xml and any filesystem issues.
//
// Run manually after editing the source XML:
//   node scripts/embed-email-xml.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const srcDir = join(repoRoot, 'public', 'xml');
const outDir = join(repoRoot, 'lib', 'email', 'config', 'data');
mkdirSync(outDir, { recursive: true });

const files = [
  { name: 'countries24', exportName: 'countriesXml' },
  { name: 'languages24', exportName: 'languagesXml' },
];

for (const { name, exportName } of files) {
  const xml = readFileSync(join(srcDir, `${name}.xml`), 'utf-8');
  const ts =
    `// Auto-generated from public/xml/${name}.xml by scripts/embed-email-xml.mjs\n` +
    `// Do not edit by hand. Re-run the script after updating the source XML.\n` +
    `/* eslint-disable */\n` +
    `export const ${exportName}: string = ${JSON.stringify(xml)};\n`;
  writeFileSync(join(outDir, `${name}.ts`), ts);
  console.log(`wrote lib/email/config/data/${name}.ts (${ts.length} chars)`);
}
