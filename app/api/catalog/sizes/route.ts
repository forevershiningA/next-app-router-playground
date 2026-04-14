import { NextResponse } from 'next/server';
import { catalog } from '#/lib/catalog-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productCode = searchParams.get('productCode') ?? 'full-colour-plaque';

  try {
    const rows = await catalog.sizes.findMany({
      where: { productCode, isActive: true },
    });

    const sizes = rows.map((r) => ({
      id: r.sortOrder,
      width: r.widthMm,
      height: r.heightMm,
      price: r.priceCents / 100,
    }));

    return NextResponse.json(sizes);
  } catch (error) {
    console.error('Failed to fetch sizes:', error);
    return NextResponse.json([], { status: 500 });
  }
}
