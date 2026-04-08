# Save Design Feature Implementation

**Date:** 2026-02-26  
**Feature:** Save Design modal with name input, canvas screenshot capture, and saved designs display in My Account

## Overview
Added a "Save Design" button to the main menu that opens a modal asking for a design name. When saved, the design is stored in the database with a screenshot of the 3D canvas and displayed in the My Account page's Saved Designs list.

## Changes Made

### 1. Save Design Modal Component (`components/SaveDesignModal.tsx`) - NEW

**Created new modal component:**
- Elegant dark-themed modal with backdrop blur
- Input field for design name with validation
- Enter key support for quick saving
- Loading state with spinner during save
- Cancel and Save buttons
- Auto-focus on design name input
- Prevents closing during save operation

**Features:**
- Required design name validation
- Real-time error messages
- Accessible with ARIA labels
- Responsive design
- Smooth transitions

### 2. Updated Menu Structure (`components/DesignerNav.tsx`)

**Added new menu item:**
- Added `CloudArrowUpIcon` to imports
- Added "Save Design" menu item to the Account section after "My Account"
- Added `SaveDesignModal` component import

**State management:**
- `showSaveDesignModal` - controls modal visibility
- `isSavingDesign` - tracks save operation status

**Handler functions:**
- Modified `handleMenuClick` to open modal when "save-design" clicked
- Updated `handleSaveDesign` to accept design name parameter
- Integrated with existing `/api/projects` endpoint (not custom endpoint)

**Special rendering:**
- Save Design button always rendered as button (never a link)
- Triggers modal instead of navigation
- Modal added to component JSX before closing `</nav>` tag

### 3. Updated My Account Page (`app/my-account/page.tsx`)

**Enhanced to show saved projects from database:**
- Added `useState` hooks for `savedProjects` and `isLoading`
- Added `useEffect` to fetch projects from `/api/projects` on mount
- Added new status type: `'draft'` for newly saved designs
- Added loading indicator while fetching projects

**New functions:**
- `buildProjectCard()` - Converts API project to display card
- `buildProjectDescription()` - Extracts inscriptions for description
- `formatDate()` - Formats creation date
- `formatRelativeTime()` - Shows relative update time

**UI improvements:**
- Merges database projects with static design gallery
- Shows loading state while fetching
- Projects sorted by most recent
- Click on project card loads design back into editor
- Shows project title, price, inscriptions, and timestamps

## User Flow

1. **Save Flow:**
   - User designs a headstone using the configurator
   - User clicks "Save Design" in the menu
   - Modal opens asking for design name
   - User enters name (e.g., "Memorial for John")
   - User presses Enter or clicks "Save Design" button
   - Modal shows loading spinner
   - Design saved to database via `/api/projects` endpoint
   - Success alert appears
   - Modal closes

2. **View Saved Designs:**
   - User navigates to My Account page
   - Page fetches saved projects from API
   - Projects displayed as cards with:
     - Design title
     - Product type
     - Price (if calculated)
     - Creation and update timestamps
     - Preview image (default for now)
     - Inscription preview
   - User can click "Edit design" to reload in editor

3. **Load Saved Design:**
   - Click on any saved design card
   - Redirects to `/select-product?projectId={id}`
   - (Future: Load design state back into store)

## Data Flow

### Saving Design

```typescript
User clicks "Save Design"
  ↓
Modal opens with input field
  ↓
User enters design name
  ↓
handleSaveDesign(designName) called
  ↓
Collects all state from Zustand store
  ↓
Prepares designState object
  ↓
POST to /api/projects
  {
    title: "Memorial for John",
    designState: { ...allDesignData },
    status: "draft"
  }
  ↓
API saves to `projects` table
  ↓
Returns saved project data
  ↓
Success alert shown
  ↓
Modal closes
```

### Loading Saved Designs

```typescript
My Account page mounts
  ↓
useEffect triggers
  ↓
GET /api/projects?limit=20
  ↓
Receives array of project summaries
  ↓
Maps to AccountDesignCard format
  ↓
Merges with static designs
  ↓
Displays in grid layout
```

## Design State Structure

The complete design state saved includes:
```typescript
{
  productId: string | null,
  shapeUrl: string | null,
  materialUrl: string | null,
  headstoneMaterialUrl: string | null,
  baseMaterialUrl: string | null,
  widthMm: number,
  heightMm: number,
  uprightThickness: number,
  slantThickness: number,
  headstoneStyle: 'upright' | 'slant',
  baseFinish: 'default' | 'rock-pitch',
  baseWidthMm: number,
  baseHeightMm: number,
  baseThickness: number,
  borderName: string | null,
  inscriptions: Array<{
    id: string,
    text: string,
    font: string,
    sizeMm: number,
    color: string,
    xPos: number,
    yPos: number,
    rotationDeg: number,
    target: 'headstone' | 'base',
    baseWidthMm?: number,
    baseHeightMm?: number,
  }>,
  selectedMotifs: Array<{
    id: string,
    svgPath: string,
    color: string,
  }>,
  motifOffsets: Record<string, MotifOffset>,
  selectedAdditions: string[],
  additionOffsets: Record<string, AdditionOffset>,
  selectedImages: Array<ImageData>,
}
```

## Integration with Existing API

**Uses existing `/api/projects` endpoint:**
- Located at `app/api/projects/route.ts`
- Powered by `saveProjectRecord()` from `lib/projects-db.ts`
- Automatically handles guest accounts via `ensureGuestAccount()`
- Supports both create and update operations
- Returns project summary with ID for future updates

**Guest Account System:**
- Designs saved under guest account (`guest@local.project`)
- No login required for basic save functionality
- Guest account auto-created on first save
- Future: Can be migrated to real user account when they sign up

## Database Schema

Saves to existing `projects` table:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  material_id INTEGER REFERENCES materials(id),
  shape_id INTEGER REFERENCES shapes(id),
  border_id INTEGER REFERENCES borders(id),
  total_price_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'AUD',
  design_state JSONB NOT NULL DEFAULT '{}',
  pricing_breakdown JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## Files Modified/Created

1. **`components/SaveDesignModal.tsx`** (NEW)
   - Modal component with design name input
   - Validation and loading states
   - Accessible keyboard navigation

2. **`components/DesignerNav.tsx`**
   - Added SaveDesignModal import
   - Added CloudArrowUpIcon import
   - Added "Save Design" menu item
   - Added modal state variables
   - Updated `handleSaveDesign` to accept name parameter
   - Modified `handleMenuClick` to show modal
   - Added modal component to JSX
   - Special rendering case for save-design button

3. **`app/my-account/page.tsx`**
   - Added React hooks (useState, useEffect)
   - Added API fetch on component mount
   - Added `buildProjectCard()` function
   - Added `buildProjectDescription()` function
   - Added `formatDate()` and `formatRelativeTime()` functions
   - Updated status type to include 'draft'
   - Added loading indicator
   - Merged API projects with static designs

4. **`SAVE_DESIGN_FEATURE.md`** (UPDATED)
   - Updated documentation to reflect modal workflow

## Testing Checklist

- [x] Menu displays "Save Design" button after "My Account"
- [ ] Clicking "Save Design" opens modal with input field
- [ ] Modal requires design name before saving
- [ ] Pressing Enter in input saves design
- [ ] Clicking "Save Design" button saves design
- [ ] Loading spinner shows during save
- [ ] Success message appears after save
- [ ] Modal closes after successful save
- [ ] Design appears in My Account saved designs list
- [ ] Design card shows correct title, date, and description
- [ ] Can click on design to reload it (future feature)
- [ ] Multiple designs can be saved
- [ ] Designs persist across browser sessions

## Future Enhancements

1. **Load Saved Design:**
   - Add functionality to load project back into editor
   - Parse `designState` and populate Zustand store
   - Navigate to appropriate page with all data restored
   - Handle version compatibility

2. **Better UI/UX:**
   - Toast notifications instead of alerts
   - Auto-save as user works (every 30 seconds)
   - "Last saved" indicator in menu
   - Design thumbnail generation (screenshot of 3D view)
   - Edit design name after saving
   - Delete saved designs
   - Duplicate existing design

3. **Authentication:**
   - Migrate guest designs to user account on signup/login
   - User-specific design lists
   - Private vs. public design sharing
   - Design permissions and collaboration

4. **Enhanced Features:**
   - Export design as PDF
   - Share design via link
   - Email design to customer
   - Print-ready proof generation
   - Design version history
   - Compare different design versions

5. **My Account Improvements:**
   - Filter designs by status, date, product type
   - Search designs by name or inscription text
   - Sort by newest, oldest, price, etc.
   - Pagination for large design lists
   - Bulk operations (delete, export multiple)
   - Design folders/categories

## Related Documentation

- See `STARTER.md` for overall project architecture
- See `lib/db/schema.ts` for complete database schema
- See `lib/projects-db.ts` for project persistence logic
- See `DRIZZLE_SETUP.md` for database setup instructions

