# Database Schema

## Overview

DYO uses **PostgreSQL** with **Drizzle ORM** (v0.45). The schema is defined in `lib/db/schema.ts` and migrations are managed in the `drizzle/` directory.

**Configuration**: `drizzle.config.ts` — strict mode, verbose logging, connection via `DATABASE_URL` env var.

## Entity Relationship Diagram

```
accounts ──┬── 1:1 ──── profiles
            ├── 1:many ── accountSessions
            ├── 1:many ── passwordResets
            ├── 1:many ── projects ──┬── 1:many ── projectAssets
            │                        ├── 1:many ── projectEvents
            │                        ├── 1:many ── sharedDesigns
            │                        └── 1:many ── orders ──┬── 1:many ── orderItems
            │                                               └── 1:many ── payments
            ├── 1:many ── enquiries
            └── 1:many ── auditLog

(Standalone reference tables)
materials, shapes, borders, motifs, additions
```

## Tables

### Authentication & Users

#### `accounts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `email` | VARCHAR | Unique, required |
| `passwordHash` | VARCHAR | bcrypt hash |
| `role` | ENUM | `'client'` \| `'admin'` |
| `status` | VARCHAR | Account status |
| `lastLoginAt` | TIMESTAMP | Last login time |
| `createdAt` | TIMESTAMP | Auto-set |
| `updatedAt` | TIMESTAMP | Auto-updated |

#### `profiles`

| Column | Type | Notes |
|--------|------|-------|
| `accountId` | UUID | FK → accounts (1:1) |
| `firstName` | VARCHAR | |
| `lastName` | VARCHAR | |
| `phone` | VARCHAR | |
| `organization` | VARCHAR | |
| `locale` | VARCHAR | |
| `timezone` | VARCHAR | |
| `tradingName` | VARCHAR | Business field |
| `businessName` | VARCHAR | Business field |
| `taxId` | VARCHAR | Business field |
| `address` | TEXT | Business address |
| Notification preferences | BOOLEAN fields | Email/SMS prefs |

#### `accountSessions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `accountId` | UUID | FK → accounts |
| `refreshTokenHash` | VARCHAR | Hashed refresh token |
| `userAgent` | VARCHAR | Browser info |
| `ipAddress` | VARCHAR | Client IP |
| `expiresAt` | TIMESTAMP | Session expiry |

#### `passwordResets`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `accountId` | UUID | FK → accounts |
| `tokenHash` | VARCHAR | Hashed reset token |
| `expiresAt` | TIMESTAMP | Token expiry |
| `consumedAt` | TIMESTAMP | When used (null = unused) |

### Catalog / Reference

#### `materials`

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL | Primary key |
| `slug` | VARCHAR | URL-friendly identifier |
| `name` | VARCHAR | Display name |
| `category` | VARCHAR | Material category |
| `finish` | VARCHAR | Surface finish type |
| `thumbnailUrl` | VARCHAR | Preview image path |
| `attributes` | JSONB | Extended properties |

#### `shapes`

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL | Primary key |
| `slug` | VARCHAR | URL-friendly identifier |
| `name` | VARCHAR | Display name (e.g., "Serpentine", "Gothic") |
| `section` | VARCHAR | Product section |
| `maskKey` | VARCHAR | SVG mask identifier |
| `previewUrl` | VARCHAR | Preview image path |
| `attributes` | JSONB | Extended properties |

#### `borders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL | Primary key |
| `slug` | VARCHAR | URL-friendly identifier |
| `name` | VARCHAR | Display name |
| `category` | VARCHAR | Border category |
| `svgUrl` | VARCHAR | SVG file path |
| `attributes` | JSONB | Extended properties |

#### `motifs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL | Primary key |
| `sku` | VARCHAR | Product SKU |
| `name` | VARCHAR | Display name |
| `category` | VARCHAR | Category (religious, floral, etc.) |
| `tags` | VARCHAR[] | Search tags |
| `priceCents` | INTEGER | Base price in cents |
| `previewUrl` | VARCHAR | Preview image path |
| `svgUrl` | VARCHAR | SVG file path |

#### `additions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | Primary key |
| `name` | VARCHAR | Display name |
| `type` | ENUM | `'application'` \| `'statue'` \| `'vase'` |
| `categoryId` | VARCHAR | Category identifier |
| `categoryName` | VARCHAR | Category display name |
| `thumbnailUrl` | VARCHAR | Preview image path |
| `model3dUrl` | VARCHAR | GLB model file path |
| `sizes` | JSONB[] | Array of size variants with pricing |

### Projects & Designs

#### `projects`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `accountId` | UUID | FK → accounts |
| `title` | VARCHAR | Design title |
| `status` | ENUM | `'draft'` \| `'submitted'` \| `'approved'` |
| `materialId` | INTEGER | FK → materials |
| `shapeId` | INTEGER | FK → shapes |
| `borderId` | INTEGER | FK → borders |
| `totalPriceCents` | INTEGER | Calculated total |
| `currency` | VARCHAR | Currency code |
| `screenshotPath` | VARCHAR | Design screenshot |
| `thumbnailPath` | VARCHAR | Design thumbnail |
| `designState` | JSONB | **Full Zustand store snapshot** |
| `pricingBreakdown` | JSONB | Itemized price breakdown |
| `createdAt` | TIMESTAMP | |
| `updatedAt` | TIMESTAMP | |

#### `projectAssets`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `projectId` | UUID | FK → projects |
| `type` | VARCHAR | Asset type |
| `label` | VARCHAR | Display label |
| `storageKey` | VARCHAR | File storage key |
| `widthMm` | INTEGER | Physical width |
| `heightMm` | INTEGER | Physical height |
| `metadata` | JSONB | Extended properties |

#### `projectEvents`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `projectId` | UUID | FK → projects |
| `actorId` | UUID | FK → accounts |
| `eventType` | VARCHAR | Event type (created, updated, submitted) |
| `payload` | JSONB | Event data |

#### `sharedDesigns`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `projectId` | UUID | FK → projects |
| `shareToken` | VARCHAR | Unique share URL token |
| `expiresAt` | TIMESTAMP | Link expiry |
| `viewCount` | INTEGER | Access counter |

### Commerce

#### `orders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `projectId` | UUID | FK → projects |
| `accountId` | UUID | FK → accounts |
| `status` | ENUM | `'quote'` \| `'pending'` \| `'paid'` |
| `subtotalCents` | INTEGER | Before tax |
| `taxCents` | INTEGER | Tax amount |
| `totalCents` | INTEGER | Grand total |
| `currency` | VARCHAR | Currency code |
| `invoiceNumber` | VARCHAR | Invoice reference |

#### `orderItems`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `orderId` | UUID | FK → orders |
| `description` | VARCHAR | Line item description |
| `quantity` | INTEGER | Item count |
| `unitPriceCents` | INTEGER | Price per unit |
| `metadata` | JSONB | Extended item data |

#### `payments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `orderId` | UUID | FK → orders |
| `provider` | VARCHAR | Payment provider name |
| `providerRef` | VARCHAR | Provider transaction reference |
| `amountCents` | INTEGER | Payment amount |
| `currency` | VARCHAR | Currency code |
| `status` | VARCHAR | Payment status |
| `receivedAt` | TIMESTAMP | Payment timestamp |

### Support & Audit

#### `enquiries`

Customer contact form submissions, optionally linked to projects.

#### `auditLog`

Tracks all significant actions (account changes, design modifications, status transitions).

## Database Commands

```bash
pnpm db:generate       # Generate Drizzle migration files from schema changes
pnpm db:migrate        # Run pending migrations
pnpm db:push           # Push schema directly to DB (dev only)
pnpm db:studio         # Open Drizzle Studio GUI
pnpm db:seed-materials # Seed materials table
pnpm db:seed-shapes    # Seed shapes table
```

## Design State Serialization

When a project is saved, the full Zustand store is serialized into the `projects.designState` JSONB column via `lib/project-serializer.ts`. This captures:

- All dimensions (headstone, base, ledger, kerbset)
- Material/texture selections
- All inscriptions with fonts, colors, positions
- All motifs with positions, scales, colors
- All additions with positions
- All images with crop data
- All emblems with positions
- Shape selection
- Border selection
- Pricing breakdown
