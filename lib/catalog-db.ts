// Database access layer using Drizzle ORM
// Replaces mock implementation with real PostgreSQL queries

import { db, materials, shapes, borders, motifs } from '#/lib/db/index';
import { eq, and, sql } from 'drizzle-orm';

// Type exports for catalog items
export type Material = typeof materials.$inferSelect;
export type Shape = typeof shapes.$inferSelect;
export type Border = typeof borders.$inferSelect;
export type Motif = typeof motifs.$inferSelect;

// Query options types
type MaterialWhere = { id?: number; slug?: string; category?: string; isActive?: boolean };
type MaterialFindOptions = { where?: MaterialWhere; limit?: number };

type ShapeWhere = { id?: number; slug?: string; section?: string; isActive?: boolean };
type ShapeFindOptions = { where?: ShapeWhere; limit?: number };

type BorderWhere = { id?: number; slug?: string; category?: string; isActive?: boolean };
type BorderFindOptions = { where?: BorderWhere; limit?: number };

type MotifWhere = { id?: number; sku?: string; category?: string; isActive?: boolean };
type MotifFindOptions = { where?: MotifWhere; limit?: number };

// Database query functions
const catalog = {
  materials: {
    // Find single material
    find: async (options: MaterialFindOptions): Promise<Material | null> => {
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
      const conditions = [];
      
      if (options.where?.category !== undefined) {
        conditions.push(eq(motifs.category, options.where.category));
      }
      if (options.where?.isActive !== undefined) {
        conditions.push(eq(motifs.isActive, options.where.isActive));
      }

      const baseQuery = db
        .select()
        .from(motifs)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      if (options.limit) {
        return await baseQuery.limit(options.limit);
      }

      return await baseQuery;
    },
  },
};

// Export catalog API
export { catalog };

// Re-export database instance for advanced queries
export { db } from '#/lib/db/index';
