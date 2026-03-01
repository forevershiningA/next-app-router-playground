import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }
    
    if (!category) {
      const result = await db.execute(sql`SELECT sku, name, category, tags, price_cents, preview_url, attributes, is_active, sort_order FROM motifs WHERE sku LIKE 'MOTIF-CAT-%' AND is_active = true ORDER BY sort_order, name`);
      const categories = (result.rows || result).map((cat: any) => {
        const attributes = typeof cat.attributes === 'string' ? JSON.parse(cat.attributes) : cat.attributes;
        return {
          id: cat.sku,
          name: cat.name,
          category: cat.category,
          previewUrl: cat.preview_url,
          srcFolder: attributes?.src,
          traditional: attributes?.traditional || false,
          ss: attributes?.ss || false,
        };
      });
      return NextResponse.json({ categories, count: categories.length });
    }
    
    const result = await db.execute(sql`SELECT sku, name, category, tags, price_cents, preview_url, svg_url, attributes, is_active FROM motifs WHERE LOWER(category) = LOWER(${category}) AND sku NOT LIKE 'MOTIF-CAT-%' AND is_active = true ORDER BY name`);
    const motifs = (result.rows || result).map((motif: any) => {
      const attributes = typeof motif.attributes === 'string' ? JSON.parse(motif.attributes) : motif.attributes;
      return {
        id: motif.sku,
        name: motif.name,
        thumbnailPath: motif.preview_url,
        img: motif.preview_url,
        svgPath: `/shapes/motifs/${motif.name}.svg`,
        srcFolder: attributes?.src,
      };
    });
    return NextResponse.json({ motifs, count: motifs.length });
  } catch (error) {
    console.error('Error fetching motifs:', error);
    return NextResponse.json({ error: 'Failed to fetch motifs' }, { status: 500 });
  }
}
