'use client';

import type { SavedDesignMetadata } from '#/lib/saved-designs-data';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface MLDesignEntry {
  design_stampid: string;
  domain: string;
  preview: string;
  product_name: string;
  design_price: number;
  design_productid: string;
  design_orientation: string;
  design_shape: string;
  design_texture: string;
  design_width: string;
  design_height: string;
  design_name: string;
  ml_language: string;
  ml_style: string;
  ml_type: string;
  ml_motif: string;
  ml_tags: string;
}

export interface SearchFilters {
  query: string;
  mlType: string;
  mlStyle: string;
  mlMotif: string;
  hasPhoto: boolean | null;
  hasMotifs: boolean | null;
  hasAdditions: boolean | null;
}

export interface SearchResult {
  design: SavedDesignMetadata;
  mlData?: MLDesignEntry;
  score: number;
  mlConfidence?: number;
}

export const EMPTY_FILTERS: SearchFilters = {
  query: '',
  mlType: '',
  mlStyle: '',
  mlMotif: '',
  hasPhoto: null,
  hasMotifs: null,
  hasAdditions: null,
};

/* ------------------------------------------------------------------ */
/*  ML Data Cache                                                     */
/* ------------------------------------------------------------------ */

const ML_DIRS = ['forevershining', 'headstonesdesigner'] as const;

let mlDataCache: Map<string, MLDesignEntry> | null = null;
let mlCategoriesCache: {
  types: string[];
  styles: string[];
  motifs: string[];
} | null = null;

export async function loadMLData(): Promise<Map<string, MLDesignEntry>> {
  if (mlDataCache) return mlDataCache;

  const map = new Map<string, MLDesignEntry>();

  await Promise.all(
    ML_DIRS.map(async (dir) => {
      try {
        const res = await fetch(`/ml/${dir}/ml.json`);
        if (!res.ok) return;
        const entries: MLDesignEntry[] = await res.json();
        for (const entry of entries) {
          if (entry.design_stampid) {
            map.set(entry.design_stampid, entry);
          }
        }
      } catch {
        // silently skip missing files
      }
    }),
  );

  mlDataCache = map;
  return map;
}

export async function getMLCategories(): Promise<{
  types: string[];
  styles: string[];
  motifs: string[];
}> {
  if (mlCategoriesCache) return mlCategoriesCache;

  const mlData = await loadMLData();
  const typesSet = new Set<string>();
  const stylesSet = new Set<string>();
  const motifsSet = new Set<string>();

  for (const entry of mlData.values()) {
    if (entry.ml_type) typesSet.add(entry.ml_type);
    if (entry.ml_style) stylesSet.add(entry.ml_style);
    if (entry.ml_motif) motifsSet.add(entry.ml_motif);
  }

  mlCategoriesCache = {
    types: [...typesSet].sort(),
    styles: [...stylesSet].sort(),
    motifs: [...motifsSet].sort(),
  };
  return mlCategoriesCache;
}

/* ------------------------------------------------------------------ */
/*  TF.js Model (lazy loaded)                                         */
/* ------------------------------------------------------------------ */

type TFModel = { predict: (input: unknown) => { data: () => Promise<Float32Array> } };

interface ModelBundle {
  model: TFModel;
  dir: string;
  allData: MLDesignEntry[];
  types: string[];
  styles: string[];
  motifs: string[];
  designIds: string[];
}

let modelsCache: ModelBundle[] | null = null;
let tfModule: typeof import('@tensorflow/tfjs') | null = null;

async function getTF() {
  if (tfModule) return tfModule;
  tfModule = await import('@tensorflow/tfjs');
  return tfModule;
}

async function loadModels(): Promise<ModelBundle[]> {
  if (modelsCache) return modelsCache;

  const tf = await getTF();
  const mlData = await loadMLData();
  const bundles: ModelBundle[] = [];

  await Promise.all(
    ML_DIRS.map(async (dir) => {
      try {
        const model = (await tf.loadLayersModel(
          `/ml/${dir}/my-model.json`,
        )) as unknown as TFModel;

        // Build the same category lists the model was trained with
        const dirEntries = [...mlData.values()].filter(
          (e) =>
            e.domain ===
            (dir === 'forevershining'
              ? 'www.forevershining.com.au'
              : 'www.headstonesdesigner.com.au'),
        );

        // Filter out entries with undefined ML fields (these were excluded from training)
        const validEntries = dirEntries.filter(
          (e) => e.ml_type && e.ml_style && e.ml_motif,
        );

        const types = [...new Set(validEntries.map((e) => e.ml_type))];
        const styles = [...new Set(validEntries.map((e) => e.ml_style))];
        const motifs = [...new Set(validEntries.map((e) => e.ml_motif))];

        bundles.push({
          model,
          dir,
          allData: validEntries,
          types,
          styles,
          motifs,
          designIds: validEntries.map((e) => e.design_stampid),
        });
      } catch {
        // model file may not exist for this dir
      }
    }),
  );

  modelsCache = bundles;
  return bundles;
}

/* ------------------------------------------------------------------ */
/*  Text Search                                                       */
/* ------------------------------------------------------------------ */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function computeTextScore(tokens: string[], searchTerms: string[]): number {
  let score = 0;
  for (const term of searchTerms) {
    for (const token of tokens) {
      if (token === term) {
        score += 10; // exact match
      } else if (token.startsWith(term)) {
        score += 5; // prefix match
      } else if (token.includes(term)) {
        score += 2; // substring match
      }
    }
  }
  return score;
}

/* ------------------------------------------------------------------ */
/*  Search + Filter                                                   */
/* ------------------------------------------------------------------ */

export function searchDesigns(
  designs: SavedDesignMetadata[],
  mlIndex: Map<string, MLDesignEntry>,
  filters: SearchFilters,
): SearchResult[] {
  const searchTerms = filters.query
    ? tokenize(filters.query)
    : [];

  const results: SearchResult[] = [];

  for (const design of designs) {
    const ml = mlIndex.get(design.id);
    let score = 0;

    // Feature filters
    if (filters.hasPhoto === true && !design.hasPhoto) continue;
    if (filters.hasPhoto === false && design.hasPhoto) continue;
    if (filters.hasMotifs === true && !design.hasMotifs) continue;
    if (filters.hasMotifs === false && design.hasMotifs) continue;
    if (filters.hasAdditions === true && !design.hasAdditions) continue;
    if (filters.hasAdditions === false && design.hasAdditions) continue;

    // ML category filters
    if (filters.mlType && ml?.ml_type !== filters.mlType) continue;
    if (filters.mlStyle && ml?.ml_style !== filters.mlStyle) continue;
    if (filters.mlMotif && ml?.ml_motif !== filters.mlMotif) continue;

    // Text search
    if (searchTerms.length > 0) {
      const searchableText = [
        design.title,
        design.slug,
        design.productName,
        design.shapeName || '',
        design.motifNames.join(' '),
        design.inscriptions || '',
        ml?.ml_tags || '',
        ml?.ml_motif || '',
        ml?.ml_style || '',
        ml?.ml_type || '',
        ml?.design_shape || '',
        ml?.product_name || '',
      ].join(' ');

      const tokens = tokenize(searchableText);
      score = computeTextScore(tokens, searchTerms);

      if (score === 0) continue;
    } else {
      score = 1; // base score for filter-only results
    }

    results.push({ design, mlData: ml, score });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/* ------------------------------------------------------------------ */
/*  ML-Powered Ranking                                                */
/* ------------------------------------------------------------------ */

export async function mlRankResults(
  results: SearchResult[],
  mlType: string,
  mlStyle: string,
  mlMotif: string,
): Promise<SearchResult[]> {
  if (!mlType || !mlStyle || !mlMotif) return results;

  try {
    const tf = await getTF();
    const bundles = await loadModels();

    // Create a set of design IDs in results for quick lookup
    const resultIds = new Set(results.map((r) => r.design.id));

    for (const bundle of bundles) {
      const typeIdx = bundle.types.indexOf(mlType);
      const styleIdx = bundle.styles.indexOf(mlStyle);
      const motifIdx = bundle.motifs.indexOf(mlMotif);

      // Skip if this model doesn't know these categories
      if (typeIdx === -1 || styleIdx === -1 || motifIdx === -1) continue;

      const input = tf.tensor2d([
        [
          typeIdx / bundle.types.length,
          styleIdx / bundle.styles.length,
          motifIdx / bundle.motifs.length,
        ],
      ]);

      const predictions = await bundle.model.predict(input).data();
      input.dispose();

      // Map prediction scores to design IDs
      for (let i = 0; i < predictions.length && i < bundle.designIds.length; i++) {
        const designId = bundle.designIds[i];
        if (resultIds.has(designId)) {
          const result = results.find((r) => r.design.id === designId);
          if (result) {
            result.mlConfidence = predictions[i];
            result.score += predictions[i] * 100; // boost by ML confidence
          }
        }
      }
    }

    // Re-sort with ML boost
    results.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.warn('ML ranking failed, using text-only ranking:', err);
  }

  return results;
}

/* ------------------------------------------------------------------ */
/*  Convenience: check if any filter is active                        */
/* ------------------------------------------------------------------ */

export function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.query.length > 0 ||
    filters.mlType !== '' ||
    filters.mlStyle !== '' ||
    filters.mlMotif !== '' ||
    filters.hasPhoto !== null ||
    filters.hasMotifs !== null ||
    filters.hasAdditions !== null
  );
}
