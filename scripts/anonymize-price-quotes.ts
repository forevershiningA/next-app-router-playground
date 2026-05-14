/**
 * Anonymize price-quote HTML files.
 *
 * Reads each HTML file under public/ml/[dir]/saved-designs/html/, loads the
 * matching JSON design, runs the same inscription-sanitization logic used by
 * the client, and writes the sanitized HTML to html-anon/ next to the
 * originals.  Run whenever new designs are added.
 *
 * Usage:  pnpm tsx scripts/anonymize-price-quotes.ts
 */

import fs from 'fs';
import path from 'path';
import { sanitizeInscription, NameDatabase } from '../lib/inscription-sanitizer';

const ROOT = path.join(__dirname, '..');
const ML_DIRS = ['forevershining', 'headstonesdesigner', 'bronze-plaque'];

// ---------------------------------------------------------------------------
// Load name databases
// ---------------------------------------------------------------------------

function loadNameDb(): NameDatabase {
  const femaleNames: string[] = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'public/json/firstnames_f_small.json'), 'utf-8'),
  );
  const maleNames: string[] = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'public/json/firstnames_m_small.json'), 'utf-8'),
  );
  const surnamesArray: string[] = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'public/json/surnames_small.json'), 'utf-8'),
  );
  return {
    firstNames: new Set([
      ...femaleNames.map(n => n.toUpperCase()),
      ...maleNames.map(n => n.toUpperCase()),
    ]),
    surnames: new Set(surnamesArray.map(n => n.toUpperCase())),
    femaleNames,
    maleNames,
    firstNamesArray: [...femaleNames, ...maleNames],
    surnamesArray,
  };
}

// ---------------------------------------------------------------------------
// Category look-up
// ---------------------------------------------------------------------------

interface DesignLookup {
  /** design ID → category slug */
  byId: Map<string, string>;
}

function buildDesignLookup(): DesignLookup {
  // Dynamic import at module scope is fine for a Node script
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require('../lib/saved-designs-data') as Record<string, unknown>;
  const byId = new Map<string, string>();
  const designs = (data.SAVED_DESIGNS ?? {}) as Record<string, { category: string }>;
  for (const [id, design] of Object.entries(designs)) {
    byId.set(id, design.category ?? 'general');
  }
  return { byId };
}

// ---------------------------------------------------------------------------
// Core replacement helper
// ---------------------------------------------------------------------------

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function anonymizeHtml(
  html: string,
  jsonData: unknown[],
  db: NameDatabase,
  category: string,
): string {
  const inscriptions = (jsonData as Array<{ type?: string; label?: string }>).filter(
    item => item.type === 'Inscription' && typeof item.label === 'string',
  );

  for (const item of inscriptions) {
    const original = (item.label as string).replace(/&apos;/g, "'");
    const sanitized = sanitizeInscription(original, db, category).replace(/&apos;/g, "'");

    if (original !== sanitized) {
      html = html.replace(new RegExp(escapeRegex(original), 'g'), sanitized);
      // Also replace HTML-entity variant (e.g. apostrophes encoded as &#39;)
      const htmlEncoded = (item.label as string);
      if (htmlEncoded !== original) {
        html = html.replace(new RegExp(escapeRegex(htmlEncoded), 'g'), sanitized);
      }
    }
  }

  return html;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const db = loadNameDb();
  console.log(
    `Name DB loaded: ${db.firstNamesArray.length} first names, ${db.surnamesArray.length} surnames`,
  );

  let lookup: DesignLookup;
  try {
    lookup = buildDesignLookup();
    console.log(`Design lookup: ${lookup.byId.size} designs indexed`);
  } catch {
    console.warn('Could not load saved-designs-data — will use "general" category for all designs');
    lookup = { byId: new Map() };
  }

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalAnonymized = 0;

  for (const mlDir of ML_DIRS) {
    const htmlDir = path.join(ROOT, 'public/ml', mlDir, 'saved-designs/html');
    const jsonDir = path.join(ROOT, 'public/ml', mlDir, 'saved-designs/json');
    const anonDir = path.join(ROOT, 'public/ml', mlDir, 'saved-designs/html-anon');

    if (!fs.existsSync(htmlDir)) {
      console.log(`  Skipping ${mlDir} — html/ directory not found`);
      continue;
    }

    fs.mkdirSync(anonDir, { recursive: true });

    const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
    let dirProcessed = 0;
    let dirAnonymized = 0;

    for (const htmlFile of htmlFiles) {
      const designId = htmlFile.replace(/-desktop\.html$/, '').replace(/\.html$/, '');
      const htmlPath = path.join(htmlDir, htmlFile);
      const jsonPath = path.join(jsonDir, `${designId}.json`);
      const anonPath = path.join(anonDir, htmlFile);

      // Skip if already up-to-date
      if (fs.existsSync(anonPath)) {
        const srcMtime = fs.statSync(htmlPath).mtimeMs;
        const dstMtime = fs.statSync(anonPath).mtimeMs;
        if (dstMtime >= srcMtime) {
          totalSkipped++;
          continue;
        }
      }

      let html = fs.readFileSync(htmlPath, 'utf-8');

      if (fs.existsSync(jsonPath)) {
        try {
          const jsonData: unknown[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          const category = lookup.byId.get(designId) ?? 'general';
          const anonymized = anonymizeHtml(html, jsonData, db, category);
          if (anonymized !== html) dirAnonymized++;
          html = anonymized;
        } catch {
          // Corrupt or empty JSON — write HTML as-is
        }
      }

      fs.writeFileSync(anonPath, html);
      dirProcessed++;
    }

    console.log(
      `  ${mlDir}: ${dirProcessed} written (${dirAnonymized} had name replacements, ${htmlFiles.length - dirProcessed} up-to-date)`,
    );
    totalProcessed += dirProcessed;
    totalAnonymized += dirAnonymized;
  }

  console.log(
    `\nDone. ${totalProcessed} files written, ${totalAnonymized} had replacements, ${totalSkipped} already up-to-date.`,
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
