import {
  getCanonicalDesignCandidateUrls,
  normalizeCanonicalDesignSource,
} from '../lib/canonical-design-source';
/** Read-only baseline: pnpm exec tsx scripts/audit-design-catalog.ts */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { data } from '../app/_internal/_data';
import {
  DESIGN_CATEGORIES,
  getAllSavedDesigns,
  getDesignFromSlug,
} from '../lib/saved-designs-data';
import {
  INDEXABLE_PRODUCT_SLUGS,
  getSeoReadyDesigns,
  isIndexableCategoryDesignSet,
} from '../lib/design-seo';

async function main() {
  const root = process.cwd();
  const output = path.resolve(
    root,
    process.argv.find((arg) => arg.startsWith('--out='))?.slice(6) ??
      'docs/audits/2026-10-16-designs',
  );
  let visualReview: {
    defaultPilotStatus?: string;
    observations: { id: string; status: string; reason: string }[];
  } = { observations: [] };
  try {
    visualReview = JSON.parse(
      await fs.readFile(path.join(output, 'visual-review.json'), 'utf8'),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const visualById = new Map(
    visualReview.observations.map((item) => [item.id, item]),
  );
  const gscDir = path.join(root, 'gsc/2026-10-16');
  const digest = (value: string | Buffer) =>
    crypto.createHash('sha256').update(value).digest('hex');
  const designs = getAllSavedDesigns();
  const eligible = new Set(getSeoReadyDesigns().map((d) => d.id));
  const products = new Set(data.products.map((p) => String(p.id)));
  const publicPath = (url: string) =>
    path.join(root, 'public', url.replace(/^\/+/, ''));
  const urlFor = (d: (typeof designs)[number]) =>
    '/designs/' + d.productSlug + '/' + d.category + '/' + d.slug;
  function csv(text: string): Record<string, string>[] {
    const rows: string[][] = [];
    let row: string[] = [],
      cell = '',
      quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        if (quoted && text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = !quoted;
      } else if (ch === ',' && !quoted) {
        row.push(cell);
        cell = '';
      } else if (ch === '\n' && !quoted) {
        row.push(cell.replace(/\r$/, ''));
        rows.push(row);
        row = [];
        cell = '';
      } else cell += ch;
    }
    if (cell || row.length) {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
    }
    const headers = rows.shift()?.map((s) => s.replace(/^\uFEFF/, '')) ?? [];
    return rows
      .filter((r) => r.some(Boolean))
      .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
  }
  const readCsv = async (name: string) =>
    csv(await fs.readFile(path.join(gscDir, name), 'utf8'));
  const [daily, pages, queries, countries, devices, filters] =
    await Promise.all([
      readCsv('Wykres.csv'),
      readCsv('Strony.csv'),
      readCsv('Zapytania.csv'),
      readCsv('Kraje.csv'),
      readCsv('Urządzenia.csv'),
      readCsv('Filtry.csv'),
    ]);
  const num = (s: string | undefined) =>
    Number((s ?? '0').replace('%', '').replace(',', '.')) || 0;
  const metric = (rows: Record<string, string>[]) => {
    const clicks = rows.reduce((s, r) => s + num(r['Kliknięcia']), 0);
    const impressions = rows.reduce((s, r) => s + num(r['Wyświetlenia']), 0);
    return { clicks, impressions, ctr: impressions ? clicks / impressions : 0 };
  };
  const pageMetrics = new Map<
    string,
    { clicks: number; impressions: number }
  >();
  for (const row of pages) {
    try {
      const url = new URL(Object.values(row)[0]);
      if (
        !['forevershining.org', 'www.forevershining.org'].includes(url.hostname)
      )
        continue;
      const key = url.pathname.replace(/\/$/, '') || '/';
      const prev = pageMetrics.get(key) ?? { clicks: 0, impressions: 0 };
      pageMetrics.set(key, {
        clicks: prev.clicks + num(row['Kliknięcia']),
        impressions: prev.impressions + num(row['Wyświetlenia']),
      });
    } catch {
      /* Invalid export URL is not a catalog match. */
    }
  }
  const sortedDaily = [...daily].sort((a, b) => a.Data.localeCompare(b.Data));
  const end = sortedDaily.at(-1)?.Data;
  if (!end) throw new Error('GSC daily export is empty.');
  function windowRows(offset: number) {
    const last = Date.parse(end!) - offset * 86400000;
    return sortedDaily.filter(
      (r) =>
        Date.parse(r.Data) > last - 28 * 86400000 && Date.parse(r.Data) <= last,
    );
  }
  const appearanceName = (await fs.readdir(gscDir)).find((name) =>
    name.startsWith('Wygląd'),
  );
  const searchBaseline = {
    source: 'gsc/2026-10-16',
    filters,
    period: [sortedDaily[0].Data, end],
    total: metric(sortedDaily),
    comparison: [0, 28].map((offset) => {
      const rows = windowRows(offset);
      return {
        period: [rows[0]?.Data, rows.at(-1)?.Data],
        days: rows.length,
        ...metric(rows),
      };
    }),
    pageRows: pages.length,
    queryRows: queries.length,
    pageTotals: metric(pages),
    designsPageTotals: metric(
      pages.filter((r) => {
        try {
          return new URL(Object.values(r)[0]).pathname.startsWith('/designs');
        } catch {
          return false;
        }
      }),
    ),
    topDesignPages: pages
      .filter((r) => Object.values(r)[0].includes('/designs'))
      .sort((a, b) => num(b['Wyświetlenia']) - num(a['Wyświetlenia']))
      .slice(0, 20),
    countries: countries.slice(0, 10),
    devices,
    appearances: appearanceName ? await readCsv(appearanceName) : [],
    limitations: [
      'Page/query/country/device CSVs cover the whole export period; 28-day comparison uses site-wide daily data only.',
      'Page/query exports may be truncated and omit anonymized queries; totals are not interchangeable.',
      'Search appearance is not Google Images traffic. No image-search export or indexing report was supplied.',
      'No measured gallery-to-editor funnel is available in these CSVs.',
    ],
  };

  async function imageInfo(url: string) {
    try {
      const buffer = await fs.readFile(publicPath(url));
      const meta = await sharp(buffer).metadata();
      const sample = await sharp(buffer)
        .resize(32, 32, { fit: 'fill' })
        .toColourspace('srgb')
        .ensureAlpha()
        .raw()
        .toBuffer();
      let min = 255,
        max = 0,
        alpha = 0;
      for (let i = 0; i < sample.length; i += 4) {
        alpha += sample[i + 3];
        if (sample[i + 3] > 16) {
          const gray = Math.round(
            (sample[i] + sample[i + 1] + sample[i + 2]) / 3,
          );
          min = Math.min(min, gray);
          max = Math.max(max, gray);
        }
      }
      const coarse = await sharp(buffer)
        .resize(9, 8, { fit: 'fill' })
        .removeAlpha()
        .greyscale()
        .raw()
        .toBuffer();
      let hash = 0n;
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++)
          hash =
            (hash << 1n) |
            BigInt(coarse[y * 9 + x] > coarse[y * 9 + x + 1] ? 1 : 0);
      return {
        available: true,
        decoded: true,
        bytes: buffer.length,
        width: meta.width,
        height: meta.height,
        suspiciousBlank: alpha === 0 || max - min < 8,
        contentHash: digest(buffer),
        perceptualHash: hash.toString(16).padStart(16, '0'),
      };
    } catch (error) {
      return {
        available: false,
        decoded: false,
        error: (error as NodeJS.ErrnoException).code ?? 'decode-failed',
      };
    }
  }
  function groupsBy<T>(items: T[], key: (item: T) => string) {
    const groups = new Map<string, T[]>();
    for (const item of items) {
      const k = key(item);
      const group = groups.get(k) ?? [];
      group.push(item);
      groups.set(k, group);
    }
    return groups;
  }
  const categoryGroups = groupsBy(
    designs.filter((d) => eligible.has(d.id)),
    (d) => d.productSlug + '/' + d.category,
  );
  const records: Record<string, any>[] = new Array(designs.length);
  let next = 0;
  async function inspect() {
    while (next < designs.length) {
      const index = next++,
        d = designs[index];
      const fullUrl = '/screenshots/v2026-3d/' + d.id + '.png';
      const smallUrl = '/screenshots/v2026-3d/' + d.id + '_small.png';
      const [full, small] = await Promise.all([
        imageInfo(fullUrl),
        imageInfo(smallUrl),
      ]);
      const paths = getCanonicalDesignCandidateUrls(d.id);
      let configuration: Record<string, any> = {
        available: false,
        candidates: paths,
      };
      for (const candidate of paths) {
        let buffer: string;
        try {
          buffer = await fs.readFile(publicPath(candidate), 'utf8');
        } catch {
          continue;
        }
        try {
          const c = normalizeCanonicalDesignSource(JSON.parse(buffer), d.id);
          if (!c) continue;
          const cleanElements = Object.fromEntries(
            Object.entries(c.elements ?? {}).map(([type, values]) => [
              type,
              Array.isArray(values)
                ? values.map(({ id: _id, ...value }: any) => value)
                : values,
            ]),
          );
          const assetUrls = new Set<string>();
          const collect = (value: unknown) => {
            if (
              typeof value === 'string' &&
              /^\/(?!\/)/.test(value) &&
              /\.(svg|png|jpe?g|webp|glb)(?:$|\?)/i.test(value)
            )
              assetUrls.add(value.split('?')[0]);
            else if (Array.isArray(value)) value.forEach(collect);
            else if (value && typeof value === 'object')
              Object.values(value).forEach(collect);
          };
          collect(c.components);
          collect(c.elements);
          collect(c.product?.material);
          const missingAssets: string[] = [];
          for (const asset of assetUrls) {
            try {
              await fs.access(publicPath(decodeURIComponent(asset)));
            } catch {
              missingAssets.push(asset);
            }
          }
          configuration = {
            available: true,
            jsonValid: true,
            path: candidate,
            productId: c.product?.id == null ? null : String(c.product.id),
            productMatches: String(c.product?.id) === String(d.productId),
            sourceIdMatches:
              c.source?.id == null ? null : String(c.source.id) === d.id,
            componentTypes: Object.keys(c.components ?? {}),
            elementCounts: Object.fromEntries(
              Object.entries(c.elements ?? {}).map(([key, value]) => [
                key,
                Array.isArray(value) ? value.length : null,
              ]),
            ),
            fingerprint: digest(
              JSON.stringify({
                productId: c.product?.id,
                components: c.components,
                elements: cleanElements,
              }),
            ),
            localAssetReferences: assetUrls.size,
            missingAssets,
          };
        } catch {
          configuration = {
            available: true,
            jsonValid: false,
            path: candidate,
          };
        }
        if (configuration.jsonValid) break;
      }
      const issues: string[] = [];
      if (!INDEXABLE_PRODUCT_SLUGS.has(d.productSlug))
        issues.push('product-not-seo-allowlisted');
      if (!full.available) issues.push('full-preview-unavailable');
      if (!small.available) issues.push('thumbnail-unavailable');
      if (full.suspiciousBlank || small.suspiciousBlank)
        issues.push('preview-suspected-blank');
      if (!products.has(String(d.productId)))
        issues.push('product-id-not-in-catalog');
      if (!(d.category in DESIGN_CATEGORIES))
        issues.push('unknown-gallery-category');
      if (!configuration.jsonValid)
        issues.push('runtime-configuration-unavailable-or-invalid');
      if (configuration.jsonValid && !configuration.productMatches)
        issues.push('configuration-product-id-mismatch');
      if (configuration.sourceIdMatches === false)
        issues.push('configuration-source-id-mismatch');
      if (configuration.missingAssets?.length)
        issues.push('configuration-local-assets-missing');
      if (
        getDesignFromSlug(d.slug, {
          productSlug: d.productSlug,
          category: d.category,
        })?.id !== d.id
      )
        issues.push('slug-resolves-to-other-or-missing-design');
      records[index] = {
        id: d.id,
        url: urlFor(d),
        productId: d.productId,
        productSlug: d.productSlug,
        category: d.category,
        slug: d.slug,
        shape: d.shapeName ?? null,
        motifNames: d.motifNames,
        hasPhoto: d.hasPhoto,
        inscriptionCount: d.inscriptionCount,
        currentSeoEligibility: eligible.has(d.id),
        currentDetailIndexAllowed: INDEXABLE_PRODUCT_SLUGS.has(d.productSlug),
        currentCategoryIndexAllowed: isIndexableCategoryDesignSet(
          categoryGroups.get(d.productSlug + '/' + d.category) ?? [],
        ),
        preview: {
          full: { url: fullUrl, ...full },
          small: { url: smallUrl, ...small },
        },
        configuration,
        issues,
        gsc: pageMetrics.get(urlFor(d)) ?? { clicks: 0, impressions: 0 },
        editorLoadVerified: false,
        visualReviewStatus: visualById.get(d.id)?.status ?? 'not-reviewed',
        visualReviewNote: visualById.get(d.id)?.reason ?? null,
      };
      if ((index + 1) % 500 === 0)
        console.log('Inspected ' + (index + 1) + '/' + designs.length);
    }
  }
  await Promise.all(Array.from({ length: 4 }, inspect));
  const duplicates = (key: (r: any) => string | undefined) =>
    [
      ...groupsBy(
        records.filter((r) => key(r)),
        (r) => key(r)!,
      ).entries(),
    ]
      .filter(([, rs]) => rs.length > 1)
      .map(([key, rs]) => ({ key, ids: rs.map((r) => r.id) }));
  const categories = [
    ...groupsBy(records, (r) => r.productSlug + '/' + r.category).entries(),
  ].map(([key, rs]) => ({
    key,
    total: rs.length,
    seoEligible: rs.filter((r) => r.currentSeoEligibility).length,
    indexAllowed: rs.some((r) => r.currentCategoryIndexAllowed),
    configurationsAvailable: rs.filter((r) => r.configuration.jsonValid).length,
    sourceCandidateCount: rs.filter(
      (r) => r.currentSeoEligibility && r.issues.length === 0,
    ).length,
    gsc: rs.reduce(
      (s, r) => ({
        clicks: s.clicks + r.gsc.clicks,
        impressions: s.impressions + r.gsc.impressions,
      }),
      pageMetrics.get('/designs/' + key) ?? { clicks: 0, impressions: 0 },
    ),
  }));
  const pilot: Record<string, any>[] = [];
  for (const product of [
    'traditional-headstone',
    'laser-etched-headstone',
    'bronze-plaque',
  ]) {
    const choices = categories
      .filter(
        (c) => c.key.startsWith(product + '/') && c.sourceCandidateCount >= 6,
      )
      .sort(
        (a, b) =>
          b.gsc.clicks - a.gsc.clicks || b.gsc.impressions - a.gsc.impressions,
      );
    for (const category of choices.slice(0, 2)) {
      const candidates = records
        .filter(
          (r) =>
            r.productSlug + '/' + r.category === category.key &&
            r.currentSeoEligibility &&
            r.issues.length === 0,
        )
        .sort(
          (a, b) =>
            b.gsc.clicks - a.gsc.clicks ||
            b.gsc.impressions - a.gsc.impressions,
        );
      const selected: typeof candidates = [],
        seen = new Set<string>();
      for (const r of candidates) {
        const diversity =
          r.shape + '|' + r.motifNames.join(',') + '|' + r.hasPhoto;
        if (seen.has(diversity)) continue;
        selected.push(r);
        seen.add(diversity);
        if (selected.length === 6) break;
      }
      for (const r of candidates) {
        if (selected.length === 6) break;
        if (!selected.some((s) => s.id === r.id)) selected.push(r);
      }
      pilot.push(
        ...selected.map((r) => ({
          id: r.id,
          url: r.url,
          productSlug: r.productSlug,
          category: r.category,
          gsc: r.gsc,
          reason:
            'GSC category demand, source availability, then shape/motif diversity.',
          qualification:
            'provisional-source-checked; rendering and editor parity not yet verified',
        })),
      );
    }
  }
  for (const project of pilot) {
    project.visualReviewStatus =
      visualById.get(project.id)?.status ??
      visualReview.defaultPilotStatus ??
      'not-reviewed';
    project.visualReviewNote = visualById.get(project.id)?.reason ?? null;
    const record = records.find((record) => record.id === project.id)!;
    record.visualReviewStatus = project.visualReviewStatus;
  }
  const issueCounts: Record<string, number> = {};
  for (const r of records)
    for (const issue of r.issues)
      issueCounts[issue] = (issueCounts[issue] ?? 0) + 1;
  const nearDuplicateCandidates: { ids: string[]; distance: number }[] = [];
  for (const rs of groupsBy(
    records.filter((r) => r.preview.small.perceptualHash),
    (r) => r.productSlug + '/' + r.shape,
  ).values()) {
    for (let i = 0; i < rs.length; i++)
      for (let j = i + 1; j < rs.length; j++) {
        let bits =
          BigInt('0x' + rs[i].preview.small.perceptualHash) ^
          BigInt('0x' + rs[j].preview.small.perceptualHash);
        let distance = 0;
        while (bits && distance <= 4) {
          bits &= bits - 1n;
          distance++;
        }
        if (distance <= 4)
          nearDuplicateCandidates.push({ ids: [rs[i].id, rs[j].id], distance });
      }
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    scope:
      'Local metadata, decoded images, runtime-selected configuration files and GSC CSVs. Not a complete live crawl.',
    counts: {
      records: records.length,
      products: new Set(records.map((r) => r.productSlug)).size,
      categoryNames: new Set(records.map((r) => r.category)).size,
      productCategoryPairs: categories.length,
      seoEligible: records.filter((r) => r.currentSeoEligibility).length,
      currentDetailIndexAllowed: records.filter(
        (r) => r.currentDetailIndexAllowed,
      ).length,
      indexableCategoryPairs: categories.filter((c) => c.indexAllowed).length,
      sourceCheckedCandidates: records.filter(
        (r) => r.currentSeoEligibility && r.issues.length === 0,
      ).length,
      configurationsAvailable: records.filter((r) => r.configuration.jsonValid)
        .length,
      pilot: pilot.length,
    },
    issueCounts,
    duplicateSlugs: duplicates((r) => r.slug),
    duplicateFullUrls: duplicates((r) => r.url),
    exactDuplicateThumbnails: duplicates((r) => r.preview.small.contentHash),
    perceptualDuplicateCandidates: duplicates(
      (r) => r.preview.small.perceptualHash,
    ),
    configurationDuplicateCandidates: duplicates(
      (r) => r.configuration.fingerprint,
    ),
    nearDuplicateCandidates,
    limitations: [
      'JSON and asset availability do not prove a successful editor load or visual parity.',
      'Publication eligibility mirrors source rules, not actual indexing or a verified production deployment.',
      'Perceptual hashes identify review candidates, not confirmed duplicates.',
      'Private inscription text and configuration contents are not copied to the report.',
    ],
  };
  await fs.mkdir(output, { recursive: true });
  for (const product of [...new Set(pilot.map((p) => p.productSlug))]) {
    const selected = pilot.filter((p) => p.productSlug === product);
    const composites: sharp.OverlayOptions[] = [];
    for (const [i, project] of selected.entries()) {
      const left = (i % 3) * 320,
        top = Math.floor(i / 3) * 270;
      composites.push({
        input: await sharp(
          publicPath('/screenshots/v2026-3d/' + project.id + '_small.png'),
        )
          .resize(300, 225, { fit: 'contain', background: '#f7f5f0' })
          .png()
          .toBuffer(),
        left: left + 10,
        top,
      });
      composites.push({
        input: Buffer.from(
          '<svg width="320" height="40"><text x="10" y="22" font-size="15" fill="#222">' +
            project.id +
            '</text></svg>',
        ),
        left,
        top: top + 225,
      });
    }
    await sharp({
      create: {
        width: 960,
        height: Math.ceil(selected.length / 3) * 270,
        channels: 3,
        background: '#f7f5f0',
      },
    })
      .composite(composites)
      .png()
      .toFile(path.join(output, 'pilot-' + product + '.png'));
  }
  for (const [name, value] of Object.entries({
    'catalog-inventory.json': { summary, categories, records },
    'gsc-baseline.json': searchBaseline,
    'pilot.json': { status: 'provisional-repair-pilot', projects: pilot },
  }))
    await fs.writeFile(
      path.join(output, name),
      JSON.stringify(value, null, 2) + '\n',
    );
  console.log(
    JSON.stringify({ counts: summary.counts, issueCounts, output }, null, 2),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
