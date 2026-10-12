import { NextResponse } from 'next/server';
import { data as internalData } from '#/app/_internal/_data';
import { catalog } from '#/lib/catalog-db';
import { mapMaterialRecord, mapShapeRecord } from '#/lib/catalog-mappers';
import type { Material, ShapeOption } from '#/lib/headstone-store.types';

export const revalidate = 86400;

export async function GET() {
  let materials: Material[] = internalData.materials.map((material) => ({
    id: material.id,
    name: material.name,
    category: material.category,
    image: material.image,
  }));
  const fallbackShapes: ShapeOption[] = internalData.shapes.map((shape) => ({
    id: shape.id,
    name: shape.name,
    category: shape.category,
    image: shape.image,
  }));
  let shapes = fallbackShapes;

  if (process.env.DATABASE_URL) {
    try {
      const [rawMaterials, rawShapes] = await Promise.all([
        catalog.materials.findMany({ where: { isActive: true }, limit: 200 }),
        catalog.shapes.findMany({ where: { isActive: true }, limit: 200 }),
      ]);

      if (rawMaterials.length > 0) {
        materials = rawMaterials.map(mapMaterialRecord);
      }
      if (rawShapes.length > 0) {
        const shapesByAsset = new Map<string, ShapeOption>(
          fallbackShapes.map((shape) => [shape.image ?? shape.id, shape]),
        );
        for (const shape of rawShapes.map(mapShapeRecord)) {
          shapesByAsset.set(shape.image ?? shape.id, shape);
        }
        shapes = [...shapesByAsset.values()];
      }
    } catch (error) {
      console.warn('Database unavailable, using local designer catalog', error);
    }
  }

  const borders = internalData.borders.map((border) => ({
    id: border.id,
    name: border.name,
    category: border.category,
    image: border.image,
  }));

  return NextResponse.json(
    { materials, shapes, borders },
    {
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
