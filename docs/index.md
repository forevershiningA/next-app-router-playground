# DYO Project Documentation

Technical documentation for the **DYO (Design Your Own)** interactive 3D headstone designer at [forevershining.org](https://forevershining.org/).

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture Overview](./architecture.md) | High-level system architecture, tech stack, and design principles |
| [App Router & Routes](./routes.md) | Next.js App Router structure, pages, layouts, and API endpoints |
| [3D Scene System](./three-scene.md) | Three.js/R3F scene graph, lighting, environment, and rendering pipeline |
| [Components Reference](./components.md) | React component inventory with hierarchy and data flow |
| [State Management](./state-management.md) | Zustand store slices, actions, selectors, and pricing logic |
| [Database Schema](./database-schema.md) | PostgreSQL/Drizzle ORM tables, relationships, and migrations |
| [Configuration](./configuration.md) | Build tools, environment variables, CI/CD, and deployment |
| [Scripts & Tooling](./scripts.md) | Utility scripts for asset conversion, seeding, and batch operations |

### API Reference

| Document | Description |
|----------|-------------|
| [Store API](./api-store.md) | All ~50+ Zustand store actions with signatures, parameters, and side effects |
| [Utility Functions](./api-utilities.md) | Exported functions from 21+ lib utility files |
| [Three.js Components](./api-three.md) | 13 R3F component internals: props, functions, store subscriptions |
| [Auth, DB & API Routes](./api-auth-db.md) | Auth session, DB schema, catalog-db, projects-db, API handlers |
| [Hooks & Constants](./api-hooks-constants.md) | Custom hooks, constants, secondary stores, data mappings |

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build (primary validation gate)
pnpm validate         # type-check + lint + format:check
```

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), React 19, TypeScript 5.9 |
| 3D Rendering | Three.js 0.180 + React Three Fiber 9 + Drei 10 |
| State | Zustand 5 |
| Styling | Tailwind CSS 4, Flowbite |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT (jose) + bcryptjs |
| Validation | Zod 4 |
| Package Manager | pnpm (≥8) |
