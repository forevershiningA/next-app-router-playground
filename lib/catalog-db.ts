// Database access layer using Drizzle ORM
// Replaces mock implementation with real PostgreSQL queries

import { db, materials, shapes, borders, motifs, sizes, backgrounds } from '#/lib/db/index';
import { eq, and, sql } from 'drizzle-orm';

// Type exports for catalog items
export type Material = typeof materials.$inferSelect;
export type Shape = typeof shapes.$inferSelect;
export type Border = typeof borders.$inferSelect;
export type Motif = typeof motifs.$inferSelect;
export type Size = typeof sizes.$inferSelect;
export type Background = typeof backgrounds.$inferSelect;

// Query options types
type MaterialWhere = { id?: number; slug?: string; category?: string; isActive?: boolean };
type MaterialFindOptions = { where?: MaterialWhere; limit?: number };

type ShapeWhere = { id?: number; slug?: string; section?: string; isActive?: boolean };
type ShapeFindOptions = { where?: ShapeWhere; limit?: number };

type BorderWhere = { id?: number; slug?: string; category?: string; isActive?: boolean };
type BorderFindOptions = { where?: BorderWhere; limit?: number };

type MotifWhere = { id?: number; sku?: string; category?: string; isActive?: boolean };
type MotifFindOptions = { where?: MotifWhere; limit?: number };

type SizeWhere = { id?: number; productCode?: string; isActive?: boolean };
type SizeFindOptions = { where?: SizeWhere; limit?: number };

type BackgroundWhere = { id?: number; slug?: string; isActive?: boolean };
type BackgroundFindOptions = { where?: BackgroundWhere; limit?: number };

// Database query functions
export const catalog = {
  materials: {
    // Find single material
    find: async (options: MaterialFindOptions): Promise<Material | null> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return null;
      }

      const conditions = [];
      
      if (options.where?.id !== undefined) {
        conditions.push(eq(materials.id, options.where.id));
      }
      if (options.where?.slug !== undefined) {
        conditions.push(eq(materials.slug, options.where.slug));
      }
      if (options.where?.category !== undefined) {
        conditions.push(eq(materials.category, options.where.category));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(materials.isActive, options.where.isActive));
      }

      const result = await db
        .select()
        .from(materials)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(1);

      return result[0] || null;
    },

    // Find all materials matching criteria
    findMany: async (options: MaterialFindOptions = {}): Promise<Material[]> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return [];
      }

      const conditions = [];
      
      if (options.where?.category !== undefined) {
        conditions.push(eq(materials.category, options.where.category));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(materials.isActive, options.where.isActive));
      }

      const baseQuery = db
        .select()
        .from(materials)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      if (options.limit) {
        return await baseQuery.limit(options.limit);
      }

      return await baseQuery;
    },
  },

  shapes: {
    // Find single shape
    find: async (options: ShapeFindOptions): Promise<Shape | null> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return null;
      }

      const conditions = [];
      
      if (options.where?.id !== undefined) {
        conditions.push(eq(shapes.id, options.where.id));
      }
      if (options.where?.slug !== undefined) {
        conditions.push(eq(shapes.slug, options.where.slug));
      }
      if (options.where?.section !== undefined) {
        conditions.push(eq(shapes.section, options.where.section));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(shapes.isActive, options.where.isActive));
      }

      const result = await db
        .select()
        .from(shapes)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(1);

      return result[0] || null;
    },

    // Find all shapes matching criteria
    findMany: async (options: ShapeFindOptions = {}): Promise<Shape[]> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return [];
      }

      const conditions = [];
      
      if (options.where?.section !== undefined) {
        conditions.push(eq(shapes.section, options.where.section));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(shapes.isActive, options.where.isActive));
      }

      const baseQuery = db
        .select()
        .from(shapes)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      if (options.limit) {
        return await baseQuery.limit(options.limit);
      }

      return await baseQuery;
    },
  },

  borders: {
    // Find single border
    find: async (options: BorderFindOptions): Promise<Border | null> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return null;
      }

      const conditions = [];
      
      if (options.where?.id !== undefined) {
        conditions.push(eq(borders.id, options.where.id));
      }
      if (options.where?.slug !== undefined) {
        conditions.push(eq(borders.slug, options.where.slug));
      }
      if (options.where?.category !== undefined) {
        conditions.push(eq(borders.category, options.where.category));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(borders.isActive, options.where.isActive));
      }

      const result = await db
        .select()
        .from(borders)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(1);

      return result[0] || null;
    },

    // Find all borders matching criteria
    findMany: async (options: BorderFindOptions = {}): Promise<Border[]> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return [];
      }

      const conditions = [];
      
      if (options.where?.category !== undefined) {
        conditions.push(eq(borders.category, options.where.category));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(borders.isActive, options.where.isActive));
      }

      const baseQuery = db
        .select()
        .from(borders)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      if (options.limit) {
        return await baseQuery.limit(options.limit);
      }

      return await baseQuery;
    },
  },

  motifs: {
    // Find single motif
    find: async (options: MotifFindOptions): Promise<Motif | null> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return null;
      }

      const conditions = [];
      
      if (options.where?.id !== undefined) {
        conditions.push(eq(motifs.id, options.where.id));
      }
      if (options.where?.sku !== undefined) {
        conditions.push(eq(motifs.sku, options.where.sku));
      }
      if (options.where?.category !== undefined) {
        conditions.push(eq(motifs.category, options.where.category));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(motifs.isActive, options.where.isActive));
      }

      const result = await db
        .select()
        .from(motifs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(1);

      return result[0] || null;
    },

    // Find all motifs matching criteria
    findMany: async (options: MotifFindOptions = {}): Promise<Motif[]> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return [];
      }

      const conditions = [];
      
      if (options.where?.category !== undefined) {
        conditions.push(eq(motifs.category, options.where.category));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(motifs.isActive, options.where.isActive));
      }
      
      // Exclude category records (they have MOTIF-CAT- prefix)
      conditions.push(sql`${motifs.sku} NOT LIKE 'MOTIF-CAT-%'`);

      const baseQuery = db
        .select({
          id: motifs.id,
          sku: motifs.sku,
          name: motifs.name,
          category: motifs.category,
          tags: motifs.tags,
          priceCents: motifs.priceCents,
          previewUrl: motifs.previewUrl,
          svgUrl: motifs.svgUrl,
          attributes: motifs.attributes,
          isActive: motifs.isActive,
          createdAt: motifs.createdAt,
          updatedAt: motifs.updatedAt,
          sortOrder: motifs.sortOrder,
          // Fetch category name from the category record using a correlated subquery
          categoryName: sql<string>`(
            SELECT cat.name FROM motifs AS cat 
            WHERE LOWER(cat.category) = LOWER(motifs.category)
            AND cat.sku LIKE 'MOTIF-CAT-%' 
            LIMIT 1
          )`.as('categoryName'),
        })
        .from(motifs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(sql`COALESCE(sort_order, 999)`, motifs.name);

      if (options.limit) {
        return await baseQuery.limit(options.limit);
      }

      return await baseQuery;
    },
  },

  sizes: {
    findMany: async (options: SizeFindOptions = {}): Promise<Size[]> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return [];
      }

      const conditions = [];

      if (options.where?.productCode !== undefined) {
        conditions.push(eq(sizes.productCode, options.where.productCode));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(sizes.isActive, options.where.isActive));
      }

      const baseQuery = db
        .select()
        .from(sizes)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(sizes.sortOrder);

      if (options.limit) {
        return await baseQuery.limit(options.limit);
      }

      return await baseQuery;
    },
  },

  backgrounds: {
    findMany: async (options: BackgroundFindOptions = {}): Promise<Background[]> => {
      if (!db) {
        console.error('Failed to load catalog data, using empty fallbacks');
        return [];
      }

      const conditions = [];

      if (options.where?.slug !== undefined) {
        conditions.push(eq(backgrounds.slug, options.where.slug));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(backgrounds.isActive, options.where.isActive));
      }

      const baseQuery = db
        .select()
        .from(backgrounds)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(backgrounds.sortOrder);

      if (options.limit) {
        return await baseQuery.limit(options.limit);
      }

      return await baseQuery;
    },
  },
};

// Re-export database instance for advanced queries
export { db } from '#/lib/db/index';
