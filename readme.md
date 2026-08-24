# Forever Shining — Memorial Designer

Forever Shining is a Next.js application for designing and ordering personalised memorials online. It combines an interactive 3D designer with a crawlable catalogue of headstones, plaques, monuments, urns and pet memorials.

The public site is served at [forevershining.org](https://forevershining.org).

## What is included

- Interactive 3D memorial designer: shape, material, size, inscriptions, motifs, images, additions, borders and emblems.
- Product, gallery and SEO landing pages for memorial designs.
- Saved designs, accounts, orders, quotes and supplier workflows.
- PostgreSQL persistence through Drizzle ORM.
- Stripe checkout, email delivery and optional remote upload proxy.
- Technical SEO: canonical URLs, `www` to apex redirect, robots, sitemap, structured data and Open Graph metadata.

## Technology

- Next.js 15, App Router, React 19 and TypeScript
- Three.js, React Three Fiber and Drei
- Zustand and React Context for application state
- Tailwind CSS 4 and Heroicons
- PostgreSQL, Drizzle ORM and `postgres`
- Zod, Stripe and Nodemailer
- pnpm, ESLint, Prettier, Vitest and Playwright

## Requirements

- Node.js 18 or newer (Node 22 is used in CI)
- pnpm 8 or newer
- PostgreSQL for account, order and catalogue features

## Local development

Install dependencies and create a local environment file:

```sh
pnpm install
Copy-Item .env.local.example .env.local
```

Set at least `DATABASE_URL` and `SESSION_SECRET` in `.env.local`, then start the app:

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The public designer can run with local fallback data when the database is unavailable. Database-backed account, order and catalogue functions require a working PostgreSQL connection.

## Environment variables

Do not commit `.env.local` or production credentials. Use `.env.local.example` as the starting point.

| Variable                                                        | Required for                      | Notes                                               |
| --------------------------------------------------------------- | --------------------------------- | --------------------------------------------------- |
| `DATABASE_URL`                                                  | Database-backed features          | PostgreSQL connection string used by Drizzle.       |
| `SESSION_SECRET`                                                | Authentication and shared designs | Use a long, random production secret.               |
| `NEXT_PUBLIC_SITE_URL`                                          | Checkout and password reset links | Public deployment URL.                              |
| `NEXT_PUBLIC_BASE_URL`                                          | Canonical and share URLs          | Normally `https://forevershining.org`.              |
| `STRIPE_SECRET_KEY`                                             | Stripe checkout                   | Server-only Stripe secret key.                      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`                            | Stripe checkout UI                | Public Stripe key.                                  |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Transactional email               | Country-specific SMTP variables are also supported. |
| `UPLOAD_REMOTE_URL`, `UPLOAD_REMOTE_SECRET`                     | Remote upload proxy               | Optional production integration.                    |

Generate a session secret, for example:

```sh
openssl rand -hex 32
```

## Common commands

```sh
pnpm dev             # Start the development server
pnpm build           # Create a production build
pnpm start           # Start the production server
pnpm type-check      # Run TypeScript without emitting files
pnpm lint            # Run ESLint
pnpm format:check    # Verify formatting
pnpm validate        # Run type-check, lint and formatting checks
pnpm test            # Run Vitest tests
pnpm test:e2e        # Run Playwright end-to-end tests
```

Database commands:

```sh
pnpm db:generate       # Generate Drizzle migrations
pnpm db:migrate        # Apply migrations
pnpm db:push           # Push the schema directly
pnpm db:studio         # Open Drizzle Studio
pnpm db:seed-materials # Seed material data
pnpm db:seed-shapes    # Seed shape data
pnpm db:seed-sizes     # Seed size data
```

## Application map

```text
app/
  page.tsx                         Homepage and public structured data
  select-product/ … check-price/   Guided design flow
  designs/                         Searchable, indexable design catalogue
  memorials/                       Public memorial-type landing pages
  products/                        Product SEO pages
  my-account/                      Accounts, saved designs and purchases
  admin/                           Internal order and catalogue workflows
  api/                             Route handlers
components/three/                  React Three Fiber scene and models
lib/                               Pricing, auth, data loading, SEO and utilities
lib/db/                            Drizzle schema and database client
public/                            Textures, SVGs, models, screenshots and static data
scripts/                           Database seeds, conversion and maintenance tools
```

The App Router uses `#/*` as a path alias for the project root. Server Components are the default; interactive UI and all Three.js code run in Client Components.

## SEO and public catalogue

The indexable catalogue lives under `/designs/[productType]/[category]/[slug]`. It uses canonical URLs on `https://forevershining.org`, emits structured data and is included in `app/sitemap.ts` when a design has a valid screenshot and belongs to an approved product set.

`www.forevershining.org` permanently redirects to `forevershining.org`. Keep the apex domain configured as the primary domain in the hosting provider as well.

## CI

GitHub Actions runs on pushes and pull requests targeting `main`:

1. `pnpm type-check`
2. `pnpm lint`
3. `pnpm format:check`
4. `pnpm build`

## Contributing

Use pnpm, keep TypeScript strict, and run `pnpm validate` before opening a pull request. Avoid committing environment files, database exports, generated build output and customer-uploaded assets.

## License

Proprietary. All rights reserved; see [license.md](license.md).
