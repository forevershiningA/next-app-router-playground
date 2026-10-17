import { writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

// Source: https://www.forevershining.com.au/memorial-gallery/
const source = await fetch(
  'https://www.forevershining.com.au/memorial-gallery/',
);
if (!source.ok) throw new Error(`Gallery page returned ${source.status}`);
const html = await source.text();
const decode = (text) =>
  text
    .replaceAll('&amp;', '&')
    .replaceAll('&#039;', "'")
    .replaceAll('&quot;', '"');
const sections = [
  ...html.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>([\s\S]*?)(?=<h2|$)/g),
];
const categories = sections.map(([, id, name, body]) => ({
  id,
  name: decode(name),
  images: [
    ...body.matchAll(
      /<a class="fs-gi lightbox" href="([^"]+)"[^>]*title="([^"]*)"/g,
    ),
  ].map(([, source, alt], index) => ({
    source: decode(source),
    alt: decode(alt),
    src: `/gallery/${id}-${String(index + 1).padStart(3, '0')}.webp`,
    thumbnail: `/gallery/${id}-${String(index + 1).padStart(3, '0')}-thumb.webp`,
  })),
}));
if (
  !categories.length ||
  categories.some((category) => !category.images.length)
) {
  throw new Error(
    'Gallery source structure changed; no files have been written.',
  );
}
await mkdir('public/gallery', { recursive: true });
const queue = categories.flatMap((category) => category.images);
let completed = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const item = queue.shift();
      let buffer;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(item.source, {
            signal: AbortSignal.timeout(60000),
          });
          if (!response.ok)
            throw new Error(`${response.status}: ${item.source}`);
          buffer = Buffer.from(await response.arrayBuffer());
          break;
        } catch (error) {
          if (attempt === 2) throw error;
        }
      }
      const full = await sharp(buffer)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer({ resolveWithObject: true });
      item.width = full.info.width;
      item.height = full.info.height;
      await writeFile(`public${item.src}`, full.data);
      await sharp(full.data)
        .resize({
          width: 600,
          height: 600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(`public${item.thumbnail}`);
      completed++;
      if (completed % 25 === 0) console.log(`Imported ${completed} photos`);
    }
  }),
);
await writeFile(
  'app/_internal/home-gallery.json',
  JSON.stringify(categories, null, 2) + '\n',
);
console.log(`Imported ${completed} photos in ${categories.length} categories`);
