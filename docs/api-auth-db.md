# Auth, Database & API Reference

Function-level documentation for authentication, database access, and API route handlers.

---

## Authentication (`lib/auth/session.ts`)

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `COOKIE_NAME` | `'session'` | Cookie key for JWT session |
| `COOKIE_MAX_AGE` | `604800` | 7 days in seconds |

### Functions

### `getServerSession(): Promise<Session>`
Retrieves current user session from cookies. Verifies JWT with HS256. Returns `{accountId, email, role}` or `null`.

### `createSessionToken(session: NonNullable<Session>): Promise<string>`
Creates JWT token with 7-day expiration using HS256 algorithm and `JWT_SECRET` env var.

### `setSessionCookie(response: NextResponse, token: string): void`
Sets httpOnly secure cookie (7 days, SameSite=lax, path=/). Uses `Secure` flag when not localhost.

### `clearSessionCookie(response: NextResponse): void`
Removes session cookie by setting `maxAge=0`.

### `verifySessionFromRequest(request: NextRequest): Promise<Session>`
Extracts and verifies JWT from request cookies. Returns session or `null`.

---

## Database Schema (`lib/db/schema.ts`)

All tables use Drizzle ORM with PostgreSQL. UUIDs default to `gen_random_uuid()`. Timestamps default to `now()`.

### Core Tables

| Table | Key Columns | Relations |
|-------|-------------|-----------|
| `accounts` | `id` (uuid PK), `email` (unique), `passwordHash`, `role` (client\|admin\|staff), `status` (active\|inactive\|suspended), `lastLoginAt` | → profiles, sessions, projects |
| `profiles` | `accountId` (PK → accounts), `firstName`, `lastName`, `phone`, `organization`, `locale`, `timezone`, `notifyEmail`/`notifySms` booleans, business details | 1:1 cascade delete |
| `accountSessions` | `id` (uuid), `accountId` (FK), `refreshTokenHash`, `userAgent`, `ipAddress`, `expiresAt` | Many:1 cascade delete |
| `passwordResets` | `id` (uuid), `accountId` (FK), `tokenHash`, `expiresAt`, `consumedAt` | Many:1 cascade delete |

### Catalog Tables

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `materials` | `id` (serial PK), `slug` (unique), `name`, `category`, `finish`, `thumbnailUrl`, `attributes` (jsonb), `isActive` | Referenced by projects |
| `shapes` | `id` (serial PK), `slug` (unique), `name`, `section`, `maskKey`, `previewUrl`, `attributes` (jsonb), `isActive` | Referenced by projects |
| `borders` | `id` (serial PK), `slug` (unique), `name`, `category`, `svgUrl`, `attributes` (jsonb), `isActive` | Referenced by projects |
| `motifs` | `id` (serial PK), `sku` (unique), `name`, `category`, `tags[]`, `priceCents`, `preview`/`svgUrl`, `sortOrder` | Not FK-linked |
| `additions` | `id` (text PK, e.g. "B2225"), `name`, `type`, `categoryId`, `categoryName`, `thumbnailUrl`, `model3dUrl`, `sizes` (jsonb), `sortOrder` | GLB model references |

### Project & Order Tables

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `projects` | `id` (uuid PK), `accountId` (FK), `title`, `status`, `materialId`/`shapeId`/`borderId` (FKs), `totalPriceCents`, `currency`, `screenshotPath`, `thumbnailPath`, `designState` (jsonb), `pricingBreakdown` (jsonb) | Main design record |
| `projectAssets` | `id` (uuid), `projectId` (FK), `type`, `label`, `storageKey`, `widthMm`, `heightMm`, `metadata` (jsonb) | Design file assets |
| `projectEvents` | `id` (uuid), `projectId` (FK), `actorId` (FK), `eventType`, `payload` (jsonb) | Audit trail |
| `orders` | `id` (uuid), `projectId` (FK), `accountId` (FK), `status`, `subtotalCents`/`taxCents`/`totalCents`, `currency`, `invoiceNumber` (unique) | Commerce |
| `orderItems` | `id` (uuid), `orderId` (FK), `description`, `quantity`, `unitPriceCents`, `metadata` (jsonb) | Line items |
| `payments` | `id` (uuid), `orderId` (FK), `provider`, `providerRef`, `amountCents`, `currency`, `status`, `receivedAt` | Payment records |
| `auditLog` | `id` (uuid), `accountId` (FK), `action`, `targetType`, `targetId`, `metadata` (jsonb) | Admin audit |
| `sharedDesigns` | `id` (uuid), `projectId` (FK), `shareToken` (unique), `expiresAt`, `viewCount` | Public sharing |
| `enquiries` | `id` (uuid), `projectId` (FK), `accountId` (FK), `email`, `phone`, `message`, `status`, `respondedAt` | Contact forms |

---

## Catalog DB (`lib/catalog-db.ts`)

Exports a `catalog` object with four sub-objects, each having `find()` and `findMany()` methods.

### `catalog.materials`

```typescript
catalog.materials.find(options: MaterialFindOptions): Promise<Material | null>
catalog.materials.findMany(options?: MaterialFindOptions): Promise<Material[]>
```
Options: `id`, `slug`, `category`, `isActive`, `limit`.

### `catalog.shapes`

```typescript
catalog.shapes.find(options: ShapeFindOptions): Promise<Shape | null>
catalog.shapes.findMany(options?: ShapeFindOptions): Promise<Shape[]>
```
Options: `id`, `slug`, `section`, `isActive`, `limit`.

### `catalog.borders`

```typescript
catalog.borders.find(options: BorderFindOptions): Promise<Border | null>
catalog.borders.findMany(options?: BorderFindOptions): Promise<Border[]>
```
Options: `id`, `slug`, `category`, `isActive`, `limit`.

### `catalog.motifs`

```typescript
catalog.motifs.find(options: MotifFindOptions): Promise<Motif | null>
catalog.motifs.findMany(options?: MotifFindOptions): Promise<Motif[]>
```
Options: `id`, `sku`, `category`, `isActive`, `limit`. `findMany` adds correlated `categoryName` subquery and orders by `sortOrder`.

---

## Projects DB (`lib/projects-db.ts`)

### `saveProjectRecord(input: SaveProjectInput): Promise<ProjectSummary>`
Creates or updates a project. If `projectId` is provided and exists, updates it; otherwise creates new. Normalizes file paths, defaults: title = "Untitled Design", status = "draft", currency = "AUD".

### `listProjectSummaries(accountId: string, limit?: number): Promise<ProjectSummary[]>`
Fetches user's projects ordered by most recent. Default limit 20, maximum 50.

### `getProjectRecord(projectId: string, accountId: string): Promise<ProjectRecordWithState | null>`
Fetches full project including `designState` and `pricingBreakdown`. Returns `null` if not found or user doesn't own it.

### `deleteProjectRecord(projectId: string, accountId: string): Promise<boolean>`
Deletes a project. Returns `true` if deleted, `false` if not found or unauthorized.

---

## Project Schemas (`lib/project-schemas.ts`)

### Type Exports

| Type | Description |
|------|-------------|
| `SavedAdditionOffset` | 3D addition placement: xPos, yPos, zPos, scale, rotationZ, sizeVariant, targetSurface, additionType, assetFile, footprintWidth |
| `SavedMotifOffset` | Motif placement: xPos, yPos, scale, rotationZ, heightMm, target, coordinateSpace, flipX/Y, baseWidthMm/HeightMm |
| `SavedEmblemOffset` | Emblem placement with flip flags and coordinate systems |
| `SavedImage` | Photo: id, typeId, typeName, imageUrl, widthMm, heightMm, xPos, yPos, rotationZ, maskShape, colorMode |
| `SavedInscription` | Text: id, text, sizeMm, font, color, xPos, yPos, rotationDeg, surface, baseWidthMm/HeightMm |
| `DesignerSnapshot` | Complete design state: version, product info, materials, dimensions, all placements, metadata |
| `PricingBreakdown` | Price breakdown: headstone, base, ledger, kerbset, additions, motifs, emblems, inscriptions, images, subtotal, tax, total |
| `ProjectSummary` | Public info: id, title, status, totalPriceCents, currency, screenshot/thumbnail paths, timestamps |
| `ProjectRecordWithState` | ProjectSummary + materialId, shapeId, borderId, designState, pricingBreakdown |

---

## Catalog Mappers (`lib/catalog-mappers.ts`)

### `mapMaterialRecord(material): MaterialOption`
Maps DB material to UI format. Resolves `thumbnailUrl` and `textureUrl` using `MATERIAL_TEXTURE_FALLBACKS`.

### `mapShapeRecord(shape): ShapeOption`
Maps DB shape to UI format. Extracts `maskKey` from attributes. Uses `SHAPE_IMAGE_FALLBACKS`.

### `mapBorderRecord(border): BorderOption`
Maps DB border to UI format. Uses `BORDER_IMAGE_FALLBACKS`.

### `mapMotifRecord(motif): MotifCatalogItem`
Maps DB motif to UI format. Uses `MOTIF_SVG_FALLBACKS`.

---

## File Storage (`lib/fileStorage.ts`)

### `ensureDirectoryExists(dirPath: string): Promise<void>`
Creates directory recursively if it doesn't exist.

### `saveDesignFiles(designId, screenshot, jsonData, xmlData, htmlData, p3dData): Promise<DesignFiles>`
Saves design to `public/saved-designs/{year}/{month}/`. Creates: screenshot PNG, thumbnail (200px max), JSON, XML (with CDATA-escaped JSON), HTML quote, and P3D binary. Returns URL paths object.

### `designToXML(design): string`
Converts design object to XML with CDATA-escaped JSON state.

### `designToP3D(design): Buffer`
Converts design to P3D binary format (JSON-serialized, zlib-compressed).

### `generatePriceQuoteHTML(design): string`
Generates responsive HTML table with design details, pricing breakdown, motifs, images, inscriptions. Includes inline CSS styling.

---

## API Route Handlers

### POST `/api/auth/login`
**Auth:** None. Validates email/password → bcrypt verify → checks status is 'active' → creates JWT → sets session cookie → updates `lastLoginAt`. Returns `{success, role}` or 400/401/500.

### POST `/api/auth/register`
**Auth:** None. Validates email + password (≥8 chars) → checks email uniqueness → bcrypt hash → transactionally creates account (role: client, active) + empty profile → JWT + cookie. Returns `{success, role: "client"}` or 400/409/500.

### GET `/api/projects`
**Auth:** Required. Lists user's projects (limit param, default 20, max 50). Returns `{projects: ProjectSummary[]}`.

### POST `/api/projects`
**Auth:** Required. Saves/updates project. Requires `designState`. Creates/updates record + saves files (screenshot, thumbnail, JSON, XML, HTML, P3D) to `public/saved-designs/{year}/{month}/`. Returns `{project: ProjectSummary}`.

### DELETE `/api/projects`
**Auth:** Required. Deletes project by `id` query param. Returns `{message}` or 400/404/500.

### GET `/api/projects/[id]`
**Auth:** Required (owner only). Returns full project with `designState` and `pricingBreakdown`.

### GET `/api/orders`
**Auth:** Required. Returns all user's orders with hydrated items and payments.

### POST `/api/upload/image`
**Auth:** None. Accepts FormData (`upload` file, `filename`, `color`). Sanitizes filename, creates year/month structure in `public/upload/`. Saves: masked PNG, thumbnail (100×100), grayscale if `color='0'`, JPG copy. Returns `{img, path, result}`.

### POST `/api/share/create`
**Auth:** None (project existence check only). Generates 16-char nanoid share token. Creates `sharedDesigns` record with optional expiration. Returns `{success, shareUrl, shareToken, expiresAt}`.
