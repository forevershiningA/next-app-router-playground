# Drizzle ORM Integration

**Status**: ✅ Production Ready (2026-02-24)

## Overview

This project uses [Drizzle ORM](https://orm.drizzle.team/) for type-safe PostgreSQL database access. Drizzle was chosen for its TypeScript-first approach, lightweight footprint, and excellent Edge Runtime compatibility.

## Database Schema

The database schema is defined in TypeScript at `lib/db/schema.ts` and includes:

### Core Tables
- **Accounts**: User authentication and roles
- **Profiles**: User profile information
- **Account Sessions**: Session management with refresh tokens
- **Password Resets**: Password recovery tokens

### Catalog Reference Data
- **Materials**: Granite types, finishes, thumbnails
- **Shapes**: Headstone/plaque shapes with masks
- **Borders**: Decorative borders for plaques
- **Motifs**: Decorative SVG motifs with pricing

### Projects & Commerce
- **Projects**: Design drafts with state/pricing
- **Project Assets**: Uploaded images and renders
- **Project Events**: Audit trail for design changes
- **Orders**: Quote and payment tracking
- **Order Items**: Line items for each order
- **Payments**: Payment provider integration

### Audit
- **Audit Log**: System-wide activity tracking

## Quick Start

### 1. Prerequisites
- PostgreSQL 17+ installed and running
- Database created: `headstonesdesigner`
- `.env.local` with `DATABASE_URL` set

### 2. Install Dependencies
```bash
npm install drizzle-orm postgres dotenv
npm install -D drizzle-kit tsx
```

### 3. Test Connection
```bash
npx tsx scripts/test-db-direct.ts
```

Expected output:
```
🔌 Testing database connection...

📦 Fetching materials...
   ✅ Found 3 active materials
   Example: Polished Black Granite (polished-black-granite)

🔷 Fetching shapes...
   ✅ Found 3 active shapes
   Example: Oval Landscape (ceramic)

✨ All database tests passed!
```

## Usage

### Querying Catalog Data

```typescript
import { catalog } from '@/lib/catalog-db';

// Find all active materials
const materials = await catalog.materials.findMany({
  where: { isActive: true }
});

// Find shapes by section
const ceramicShapes = await catalog.shapes.findMany({
  where: { section: 'ceramic', isActive: true }
});

// Find single motif by SKU
const motif = await catalog.motifs.find({
  where: { sku: 'MOTIF-ROSE-01' }
});

// Find borders by category
const bronzeBorders = await catalog.borders.findMany({
  where: { category: 'bronze' }
});
```

### Advanced Queries

For complex queries, use the Drizzle instance directly:

```typescript
import { db, materials, shapes } from '@/lib/db';
import { eq, and, like } from 'drizzle-orm';

// Custom query with joins
const result = await db
  .select()
  .from(materials)
  .where(
    and(
      eq(materials.isActive, true),
      like(materials.name, '%Granite%')
    )
  )
  .limit(10);
```

## Available Scripts

```bash
# Development
npm run db:push         # Push schema changes to database (dev)
npm run db:studio       # Open Drizzle Studio (GUI)

# Migrations (production)
npm run db:generate     # Generate SQL migration files
npm run db:migrate      # Run pending migrations

# Testing
npx tsx scripts/test-db-direct.ts  # Test database connection
```

## File Structure

```
lib/
├── db/
│   ├── index.ts          # Drizzle instance + exports
│   └── schema.ts         # TypeScript schema definitions
└── catalog-db.ts         # High-level catalog query API

drizzle/                  # Auto-generated migration files
drizzle.config.ts         # Drizzle Kit configuration
sql/
└── postgres-schema.sql   # Bootstrap schema (initial setup)
```

## Type Safety

Drizzle provides full TypeScript type inference:

```typescript
import type { Material, Shape, Motif } from '@/lib/catalog-db';

// All types auto-inferred from schema
const material: Material = await catalog.materials.find({
  where: { slug: 'polished-black-granite' }
});

// IntelliSense for all fields
console.log(material.name);        // string
console.log(material.category);    // string
console.log(material.attributes);  // Record<string, any>
```

## Database Connection

Connection details from `.env.local`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/headstonesdesigner
```

The connection pool is managed automatically by Drizzle and postgres.js.

## Migration Workflow

### Development (Schema Push)
For rapid iteration during development:
```bash
npm run db:push
```

This syncs your schema directly to the database without generating migration files.

### Production (SQL Migrations)
For production deployments:

1. Make schema changes in `lib/db/schema.ts`
2. Generate migration:
   ```bash
   npm run db:generate
   ```
3. Review SQL in `drizzle/` folder
4. Apply migration:
   ```bash
   npm run db:migrate
   ```

## Seed Data

The `sql/postgres-schema.sql` file includes seed data for:
- 3 materials (granite types)
- 3 shapes (oval landscape, heart, rectangle)
- 2 borders (bronze, granite)
- 2 motifs (rose, cross)

This data is automatically inserted when the schema is first loaded.

## Performance Notes

- **Connection Pooling**: postgres.js handles connection pooling automatically
- **Edge Runtime**: Drizzle works with Vercel Edge Functions
- **Bundle Size**: ~15KB (minimal client-side overhead)
- **Type Generation**: No code generation step required (unlike Prisma)

## Comparison to Previous Mock Implementation

| Feature | Mock (`lib/db.ts`) | Drizzle |
|---------|-------------------|---------|
| Data Source | In-memory arrays | PostgreSQL |
| Type Safety | Manual types | Auto-inferred |
| Queries | Array filters | SQL queries |
| Persistence | None | Full ACID |
| Migrations | N/A | Built-in |
| Performance | O(n) scans | Indexed lookups |

## Next Steps

1. ✅ Database connection established
2. ✅ Schema defined and tested
3. ✅ Seed data loaded
4. ⏳ Wire designer panels to live data
5. ⏳ Add project save/load functionality
6. ⏳ Implement user authentication
7. ⏳ Set up Vercel Postgres integration

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle with Next.js Guide](https://orm.drizzle.team/docs/get-started-postgresql#nextjs)
- [postgres.js Docs](https://github.com/porsager/postgres)

---

**Last Updated**: 2026-02-24 18:37 UTC  
**Database Version**: PostgreSQL 17.7  
**Drizzle ORM Version**: 0.45.1
