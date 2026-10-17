/** Compact editorial comparison and actual asset budgets, no publication changes. */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const directory = path.join(
  process.cwd(),
  'docs/audits/2026-10-16-designs/preview-candidates',
);
const manifest = JSON.parse(
  await fs.readFile(path.join(directory, 'manifest.json'), 'utf8'),
);
const rows = manifest.records.filter((record) =>
  record.images.some(
    (image) => image.role === 'overview' && image.width === 960,
  ),
);
if (!rows.length) throw new Error('No candidate overviews exist');
// Small pages keep every pilot image inspectable at a useful resolution.
for (let offset = 0; offset < rows.length; offset += 6) {
  const page = rows.slice(offset, offset + 6);
  const tiles = [];
  for (const [index, record] of page.entries()) {
    const left = (index % 2) * 500;
    const top = Math.floor(index / 2) * 400;
    tiles.push({
      input: await sharp(path.join(directory, record.id + '-overview-960.webp'))
        .resize(480, 360)
        .flatten({ background: '#f5f3ee' })
        .png()
        .toBuffer(),
      left,
      top: top + 35,
    });
    tiles.push({
      input: Buffer.from(
        `<svg width="500" height="35"><text x="12" y="24" font-size="18" font-family="Arial">${record.id} — pending</text></svg>`,
      ),
      left,
      top,
    });
  }
  await sharp({
    create: {
      width: 1000,
      height: Math.ceil(page.length / 2) * 400,
      channels: 3,
      background: '#ffffff',
    },
  })
    .composite(tiles)
    .webp({ quality: 88 })
    .toFile(
      path.join(directory, `review-sheet-${Math.floor(offset / 6) + 1}.webp`),
    );
}
const width = 1000,
  rowHeight = 420;
const layers = [];
const budgets = [];
const beforeLayoutRepair = process.argv.includes('--before-layout-repair');
for (const [index, record] of rows.entries()) {
  for (const [column, filename] of [
    beforeLayoutRepair
      ? path.join(
          directory,
          '../preview-before-layout-repair',
          record.id + '-overview-960.webp',
        )
      : path.join(
          process.cwd(),
          'public/screenshots/v2026-3d',
          record.id + '.png',
        ),
    path.join(directory, record.id + '-overview-960.webp'),
  ].entries()) {
    const buffer = await sharp(filename)
      .resize(480, 360, { fit: 'contain', background: '#f5f3ee' })
      .flatten({ background: '#f5f3ee' })
      .png()
      .toBuffer();
    layers.push({
      input: buffer,
      left: column * 500 + 10,
      top: index * rowHeight + 48,
    });
  }
  const label = `<svg width="1000" height="40"><text x="14" y="26" font-size="18" font-family="Arial" fill="#252820">${record.id}: ${beforeLayoutRepair ? 'before layout repair' : 'previous preview'}</text><text x="514" y="26" font-size="18" font-family="Arial" fill="#252820">3D candidate — NOT APPROVED</text></svg>`;
  layers.push({ input: Buffer.from(label), left: 0, top: index * rowHeight });
  for (const image of record.images)
    budgets.push({
      id: record.id,
      role: image.role,
      width: image.width,
      bytes: image.bytes,
      withinDraftBudget:
        image.bytes <= { 480: 50000, 960: 150000, 1600: 300000 }[image.width],
    });
}
await sharp({
  create: {
    width,
    height: rows.length * rowHeight,
    channels: 3,
    background: '#ffffff',
  },
})
  .composite(layers)
  .webp({ quality: 88 })
  .toFile(
    path.join(
      directory,
      beforeLayoutRepair ? 'layout-repair-comparison.webp' : 'comparison.webp',
    ),
  );
await fs.writeFile(
  path.join(directory, 'asset-budget.json'),
  JSON.stringify(
    {
      draftBudgets: { 480: 50000, 960: 150000, 1600: 300000 },
      images: budgets,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  'Comparison: ' +
    rows.length +
    ' projects, ' +
    budgets.length +
    ' image variants',
);
