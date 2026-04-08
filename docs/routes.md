# App Router & Routes

## Route Structure

The application follows a step-by-step wizard pattern where each design step maps to a URL route. The 3D canvas persists across all steps via the root layout.

### Design Flow Routes

| Step | Route | Purpose | Component Type |
|------|-------|---------|---------------|
| 1 | `/select-product` | Choose product type (headstone, plaque, monument) | Server + Client |
| 2 | `/select-shape` | Choose headstone outline shape | Server + Client |
| 3 | `/select-material` | Choose stone/granite texture | Server + Client |
| 4 | `/select-size` | Set dimensions (mm) | Client (parallel routes) |
| 5 | `/inscriptions` | Add text lines with fonts/colors | Client |
| 6 | `/select-motifs` | Add decorative SVG symbols | Client |
| 7 | `/select-additions` | Add 3D objects (vases, statues) | Client |
| 8 | `/select-images` | Upload photos for laser etching | Client |
| 9 | `/select-border` | Choose plaque border style | Client |
| 10 | `/select-emblems` | Add bronze emblems | Client |
| 11 | `/check-price` | Review pricing breakdown | Client |

### Account & Commerce Routes

| Route | Purpose | Auth Required |
|-------|---------|--------------|
| `/login` | Email/password authentication | No |
| `/my-account` | Dashboard with saved designs | Yes |
| `/my-account/designs/[id]` | View individual saved design | Yes |
| `/my-account/designs/[id]/buy` | Purchase flow | Yes |
| `/account/details` | Edit profile (name, email, phone) | Yes |
| `/account/invoices` | Business/billing details | Yes |
| `/orders` | Order history with status tracking | Yes |

### Content & SEO Routes

| Route | Purpose | Canvas |
|-------|---------|--------|
| `/` | Homepage (HomeSplash) | Hidden |
| `/designs` | Browse all memorial designs gallery | Hidden |
| `/designs/[productType]` | Filter by product type | Hidden |
| `/designs/[productType]/[category]` | Filter by category | Hidden |
| `/designs/[productType]/[category]/[slug]` | Individual design page | Hidden |
| `/designs/guide/buying-guide` | Educational content | Hidden |
| `/designs/guide/cemetery-regulations` | Cemetery rules guide | Hidden |
| `/designs/guide/design-your-own` | How-to guide | Hidden |
| `/designs/guide/pricing` | Pricing guide | Hidden |
| `/products/[productSlug]` | SEO landing pages (no canvas) | None |
| `/products/[productSlug]/[templateType]/[venue]/[inscription]` | Deep SEO pages | None |

## Layout Hierarchy

```
app/layout.tsx (Root)
│   Loads: fonts, global metadata, database data
│   Renders: ClientLayout → ConditionalCanvas + ConditionalNav + MainContent
│
├── /designs/layout.tsx
│   Forces white background, disables 3D canvas
│
├── /products/layout.tsx
│   SEO-only layout (no 3D canvas at all)
│
├── /select-size/layout.tsx
│   Parallel routes with (main) and (checkout) slots
│
├── /select-product/layout.tsx
│   With error.tsx boundary
│
├── /inscriptions/layout.tsx
│   With loading.tsx skeleton
│
└── Various /select-*/layout.tsx
    Wrap content with sidebar integration
```

## Parallel Routes

`/select-size` uses Next.js parallel routes (slots):

```
/select-size/
├── layout.tsx          ← SizeSelector wrapper
├── (main)/             ← Main content slot
│   ├── (shop)/         ← Shopping view
│   │   ├── page.tsx
│   │   └── [section]/[category]/
│   └── (marketing)/    ← Marketing content
│       └── blog/page.tsx
└── (checkout)/         ← Checkout slot
    └── checkout/page.tsx
```

## Private Folders (Not Routable)

| Folder | Contents |
|--------|----------|
| `app/_internal/` | `_data.ts` (fallback catalog data), `_additions-loader.ts`, `_emblems-loader.ts` |
| `app/_ui/` | `HomeSplash.tsx` |
| `app/_hooks/` | Layout examples and documentation |
| `app/_patterns/` | Pattern examples |
| Route-level `_ui/` | Colocated selection grids (e.g., `select-product/_ui/ProductSelectionGrid.tsx`) |

## Error & Loading Boundaries

| File | Scope |
|------|-------|
| `app/select-product/error.tsx` | Product selection errors |
| `app/select-product/[section]/error.tsx` | Section-level errors |
| `app/designs/loading.tsx` | Designs gallery spinner |
| `app/inscriptions/loading.tsx` | Inscription skeleton |
| `app/inscriptions/[section]/loading.tsx` | Section loading |
| `app/not-found.tsx` | Global 404 page |

---

## API Routes

### Authentication (`/api/auth/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate with email/password; sets session cookie |
| `/api/auth/register` | POST | Create account; hash password; create profile |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/auth/session` | GET | Check current session (returns accountId, email, role) |

### Account (`/api/account/`) — Protected by middleware

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/account/profile` | GET | Fetch user profile |
| `/api/account/profile` | PUT | Update profile or change password |
| `/api/account/invoice` | GET | Fetch business/invoice details |
| `/api/account/invoice` | PUT | Update business/invoice details |

### Projects (`/api/projects/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List user's projects (with pagination) |
| `/api/projects` | POST | Create/save new project |
| `/api/projects/[id]` | GET | Fetch individual project |
| `/api/projects/[id]` | DELETE | Delete project |

### Orders (`/api/orders/`) — Protected by middleware

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | GET | Fetch all orders with items and payment status |

### Sharing (`/api/share/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/share/create` | POST | Create shareable design link |
| `/api/share/email` | POST | Email shared design to recipient |

### Uploads (`/api/upload/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload/image` | POST | Upload image; sanitize filename; optional grayscale |
| `/api/upload/crop` | POST | Crop uploaded image |

### Motifs (`/api/motifs/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/motifs/db` | GET | Fetch motif categories from database |
| `/api/motifs/[...path]` | GET | Serve motif SVG files by category path |

### Other APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/favorite-designs` | GET/POST | Get or toggle design favorites |
| `/api/hidden-designs` | GET/POST | Get or toggle hidden designs |
| `/api/og` | GET | Generate Open Graph social image |
| `/api/cache-svg` | POST | Cache SVG files for performance |
| `/api/seed-materials` | POST | Seed material data (admin) |

## Middleware

**File**: `middleware.ts` (root level)

**Protected routes**: `/api/account`, `/api/orders`

**Behavior**:
1. Verifies JWT session via `verifySessionFromRequest()` for protected routes
2. Returns 401 Unauthorized if session is invalid or missing
3. Resolves unit system (metric/imperial) from `x-vercel-ip-country` header
4. Sets `unit_system` cookie based on geolocation

**Matcher**: All routes except static assets (images, fonts, CSS, JS, SVG, etc.)
