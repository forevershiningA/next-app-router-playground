/**
 * Smart design dedup script.
 *
 * Detects "evolution chains" — designs that are progressive saves of the same
 * creative idea. For example: save #1 has 2 inscriptions, save #2 adds a motif,
 * save #3 adds a photo. The earlier saves are drafts; only the final is kept.
 *
 * Algorithm:
 *   1. Group by (shapeName + mlDir) — same shape on the same site = plausible chain.
 *   2. Within each group, sort by timestamp (ascending = oldest first).
 *   3. For every pair (A older, B newer), compute:
 *        – word overlap: what fraction of A's inscription words appear in B?
 *        – motif containment: are A's motifs a subset of B's?
 *        – feature growth: B has ≥ inscriptionCount, hasPhoto, hasMotifs of A?
 *      If A's content is largely contained in B, A is a draft of B.
 *   4. Build chains and keep only the final (most-complete) version.
 *   5. Also hide designs whose inscriptions contain "test".
 *   6. Merge into data/hidden-designs.json.
 *
 * Usage:  npx tsx scripts/dedup-designs.ts [--dry-run]
 */

import { SAVED_DESIGNS, type SavedDesignMetadata } from '../lib/saved-designs-data';
import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// ─── helpers ────────────────────────────────────────────────────────────────

/** Normalise inscription text into a comparable word bag. */
function wordBag(text: string | undefined): Set<string> {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2),
  );
}

/** Fraction of `sub` words that also appear in `sup` (0..1). */
function wordOverlap(sub: Set<string>, sup: Set<string>): number {
  if (sub.size === 0) return 1; // empty is trivially contained
  let hits = 0;
  for (const w of sub) if (sup.has(w)) hits++;
  return hits / sub.size;
}

/** Are all elements of `a` present in `b`? */
function isSubsetArr(a: string[], b: string[]): boolean {
  if (a.length === 0) return true;
  const bSet = new Set(b);
  return a.every((x) => bSet.has(x));
}

/** Content "richness" score — higher = more complete design. */
function richness(d: SavedDesignMetadata): number {
  let score = 0;
  score += d.inscriptionCount * 2;
  score += d.motifNames.length * 3;
  if (d.hasPhoto) score += 5;
  if (d.hasLogo) score += 3;
  if (d.hasAdditions) score += 2;
  return score;
}

/**
 * Decide whether `older` is a draft that evolved into `newer`.
 * Returns true when older's content is largely contained in newer.
 */
function isDraftOf(older: SavedDesignMetadata, newer: SavedDesignMetadata): boolean {
  const olderWords = wordBag(older.inscriptions);
  const newerWords = wordBag(newer.inscriptions);

  const txtOverlap = wordOverlap(olderWords, newerWords);
  const motifSubset = isSubsetArr(older.motifNames, newer.motifNames);
  const featureGrowth =
    newer.inscriptionCount >= older.inscriptionCount ||
    richness(newer) >= richness(older);

  // Strong text match + motifs contained → clear evolution
  if (txtOverlap >= 0.7 && motifSubset && featureGrowth) return true;

  // Very high text match alone (motifs may have been swapped)
  if (txtOverlap >= 0.85 && featureGrowth) return true;

  // Identical inscriptions (possibly just added a motif or photo)
  if (txtOverlap === 1 && richness(newer) >= richness(older)) return true;

  return false;
}

// ─── main ───────────────────────────────────────────────────────────────────

const all = Object.values(SAVED_DESIGNS);
console.log('Total designs:', all.length);

const toHide = new Set<string>();
const keptOver = new Map<string, string>(); // hiddenId → keptId (for logging)

// ── 1. Group by shapeName + mlDir ───────────────────────────────────────────

const groups: Record<string, SavedDesignMetadata[]> = {};
for (const d of all) {
  const key = `${(d.shapeName || 'unknown').toLowerCase()}|${d.mlDir}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(d);
}

// Only consider groups with >1 design
const candidateGroups = Object.entries(groups).filter(([, v]) => v.length > 1);
console.log(`\nCandidate groups (shape+source, size>1): ${candidateGroups.length}`);

let chainCount = 0;

for (const [groupKey, designs] of candidateGroups) {
  // Sort oldest → newest
  designs.sort((a, b) => Number(a.id) - Number(b.id));

  // For each design, find if a later design supersedes it
  for (let i = 0; i < designs.length; i++) {
    const older = designs[i];
    if (toHide.has(older.id)) continue; // already marked

    for (let j = i + 1; j < designs.length; j++) {
      const newer = designs[j];
      if (toHide.has(newer.id)) continue;

      if (isDraftOf(older, newer)) {
        toHide.add(older.id);
        keptOver.set(older.id, newer.id);
        chainCount++;
        break; // older is superseded, move on
      }
    }
  }
}

console.log(`\n═══ EVOLUTION CHAINS ═══`);
console.log(`Draft versions detected: ${chainCount}`);

// Print chains grouped by kept design
const keptGroups: Record<string, string[]> = {};
for (const [hidden, kept] of keptOver) {
  if (!keptGroups[kept]) keptGroups[kept] = [];
  keptGroups[kept].push(hidden);
}
const chainEntries = Object.entries(keptGroups).sort((a, b) => b[1].length - a[1].length);
console.log(`Unique final designs with drafts: ${chainEntries.length}`);
for (const [kept, drafts] of chainEntries.slice(0, 30)) {
  const kd = SAVED_DESIGNS[kept];
  const shape = kd?.shapeName || '?';
  const insc = kd?.inscriptionCount || 0;
  const motifs = kd?.motifNames?.length || 0;
  console.log(
    `  KEEP ${kept} (${shape}, ${insc} insc, ${motifs} motifs) ← drafts: ${drafts.join(', ')}`,
  );
}
if (chainEntries.length > 30) console.log(`  ... and ${chainEntries.length - 30} more chains`);

// ── 1b. Sibling detection ───────────────────────────────────────────────────
// Catches "same family" designs where the customer simplified text in later saves,
// so the newer version is LESS rich than the older. Keep the richest, hide the rest.

let siblingCount = 0;

for (const [, designs] of candidateGroups) {
  // Sort by richness descending, then newest first as tiebreaker
  const sorted = [...designs].sort(
    (a, b) => richness(b) - richness(a) || Number(b.id) - Number(a.id),
  );

  for (let i = 0; i < sorted.length; i++) {
    const keeper = sorted[i];
    if (toHide.has(keeper.id)) continue;
    const keeperWords = wordBag(keeper.inscriptions);

    for (let j = i + 1; j < sorted.length; j++) {
      const sibling = sorted[j];
      if (toHide.has(sibling.id)) continue;

      const siblingWords = wordBag(sibling.inscriptions);
      // Bidirectional overlap: either direction ≥ 0.7 means "same creative work"
      const overlapAB = wordOverlap(siblingWords, keeperWords);
      const overlapBA = wordOverlap(keeperWords, siblingWords);
      if (Math.max(overlapAB, overlapBA) >= 0.7) {
        toHide.add(sibling.id);
        keptOver.set(sibling.id, keeper.id);
        siblingCount++;
      }
    }
  }
}

console.log(`\n═══ SIBLING DUPLICATES ═══`);
console.log(`Sibling versions detected: ${siblingCount}`);

// ── 2. Slug-only duplicates (safety net) ────────────────────────────────────

const slugGroups: Record<string, SavedDesignMetadata[]> = {};
for (const d of all) {
  if (!slugGroups[d.slug]) slugGroups[d.slug] = [];
  slugGroups[d.slug].push(d);
}
const slugDupes = Object.entries(slugGroups).filter(([, v]) => v.length > 1);
let slugHideCount = 0;
for (const [, designs] of slugDupes) {
  const sorted = designs.sort((a, b) => Number(b.id) - Number(a.id));
  for (const d of sorted.slice(1)) {
    if (!toHide.has(d.id)) {
      toHide.add(d.id);
      slugHideCount++;
    }
  }
}
console.log(`\n═══ SLUG DUPLICATES (extra) ═══`);
console.log(`Additional slug dupes hidden: ${slugHideCount}`);

// ── 3. "test" designs ───────────────────────────────────────────────────────

const testDesigns = all.filter(
  (d) =>
    d.slug?.toLowerCase().includes('test') ||
    d.title?.toLowerCase().includes('test') ||
    (d.inscriptions && d.inscriptions.toLowerCase().includes('test')),
);
let testHideCount = 0;
for (const d of testDesigns) {
  if (!toHide.has(d.id)) {
    toHide.add(d.id);
    testHideCount++;
  }
}
console.log(`\n═══ "test" DESIGNS ═══`);
console.log(`Found: ${testDesigns.length} (newly hidden: ${testHideCount})`);

// ── 4. Merge & write ────────────────────────────────────────────────────────

const hiddenFile = path.join(process.cwd(), 'data', 'hidden-designs.json');
let existing: string[] = [];
try {
  existing = JSON.parse(fs.readFileSync(hiddenFile, 'utf-8'));
} catch {}

const merged = [...new Set([...existing, ...toHide])];
const newlyAdded = merged.length - existing.length;

console.log(`\n═══ SUMMARY ═══`);
console.log(`Evolution drafts:  ${chainCount}`);
console.log(`Sibling duplicates:${siblingCount}`);
console.log(`Slug duplicates:   ${slugHideCount}`);
console.log(`"test" designs:    ${testHideCount}`);
console.log(`Total to hide:     ${toHide.size}`);
console.log(`Already hidden:    ${existing.length}`);
console.log(`Newly added:       ${newlyAdded}`);
console.log(`Total hidden:      ${merged.length}`);
console.log(`Remaining visible: ${all.length - merged.length}`);

if (DRY_RUN) {
  console.log(`\n⚠️  DRY RUN — not writing to disk.`);
} else {
  fs.writeFileSync(hiddenFile, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  console.log(`\n✅ Written to ${hiddenFile}`);
}
