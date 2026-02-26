# Project Persistence

_Status_: ✅ Implemented (2026-02-24)

## Overview

Designs can now be saved to and loaded from PostgreSQL through the new `projects` table powered by Drizzle ORM.

```
Designer UI → capture snapshot → /api/projects → Drizzle → PostgreSQL
                                        ↑
                              /api/projects/[id]
```

## Key Components

| Area | File | Notes |
| --- | --- | --- |
| Snapshot schema | `lib/project-schemas.ts` | Serializable shape of a design (materials, motifs, images, inscriptions, etc.) |
| Client serializer | `lib/project-serializer.ts` | Captures the Zustand store into a snapshot + reapplies it on load |
| Database access | `lib/projects-db.ts` | Drizzle queries for create/update/list/get with guest-account fallback |
| API routes | `app/api/projects/route.ts`<br/>`app/api/projects/[id]/route.ts` | REST endpoints for saving, listing, and fetching projects |
| UI | `components/ProjectActions.tsx` | Save button replacement + project list + load actions |
| Entry point | `app/check-price/_ui/CheckPriceGrid.tsx` | Wires price summary to the new component |

## Saving a Design

1. Visit **Check Price**.
2. Enter a project title (defaults to the current title if already saved).
3. Click **Save Design** → POST `/api/projects`.
4. Snapshot includes:
   - Dimensions & shape
   - Materials + border
   - Additions, motifs, images (positions + transforms)
   - Inscriptions (with reconstructed refs on load)
   - Pricing breakdown (subtotal/tax/total)
5. Response updates the store with the persisted project ID.

## Loading a Design

1. Open **Saved Designs** list on the right column.
2. Click **Load** on any project → GET `/api/projects/:id`.
3. `applyDesignSnapshot` hydrates the Zustand store, refetching the correct catalog/product if necessary.
4. User is navigated back to `/select-size` ready to continue editing.

## API Reference

### `GET /api/projects`
Returns the most recent 20 project summaries. Use `?limit=` (max 50) to override.

### `POST /api/projects`
Upserts a project. Body fields:
- `projectId?` – update existing when provided
- `title` – human friendly name
- `totalPriceCents` – integer cents
- `designState` – `DesignerSnapshot`
- `pricingBreakdown?` – optional analytics object

### `GET /api/projects/:id`
Returns the full record including `designState` for rehydration.

## Notes

- Guest account auto-provisioned (`guest@local.project`) until auth lands.
- `currentProjectId` + `currentProjectTitle` stored in Zustand for UX context.
- Snapshots are versioned (`version = 1`) for future migrations.
- Saved designs list limited to five entries in UI for readability; use the API for full history.
