// lib/slug.ts
export function toSlug(s: string) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // drop punctuation
    .replace(/\s+/g, '-'); // spaces → hyphens
}
