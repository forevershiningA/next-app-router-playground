import { NextResponse } from 'next/server';
import { catalog } from '#/lib/catalog-db';

export async function GET() {
  try {
    const rows = await catalog.backgrounds.findMany({
      where: { isActive: true },
    });

    const backgrounds = rows.map((r) => ({
      id: r.slug,
      name: r.name,
      image: null,
      category: 'background',
      textureUrl: r.textureUrl,
      thumbnailUrl: r.thumbnailUrl,
    }));

    return NextResponse.json(backgrounds);
  } catch (error) {
    console.error('Failed to fetch backgrounds:', error);
    return NextResponse.json([], { status: 500 });
  }
}
