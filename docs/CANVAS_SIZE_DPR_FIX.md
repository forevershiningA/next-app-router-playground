# Canvas Size DPR Fix

## Issue
The `init_width` and `init_height` values stored in saved designs are in **physical pixels** (already multiplied by DPR), but we were using them directly as logical canvas dimensions.

### Example from Saved Design
```xml
<init_width type="number">1200</init_width>
<init_height type="number">714</init_height>
<device type="string">desktop</device>
<dpr type="number">2</dpr>
```

**Problem:**
- Physical width: 1200px (stored value)
- DPR: 2
- **Actual logical canvas width: 1200 ÷ 2 = 600px** ✓
- We were using: 1200px ❌ (wrong!)

## Root Cause

When designs are created on high-DPR displays (Retina, etc.), the canvas dimensions are stored in **physical pixels**:

```javascript
// During save:
init_width = logicalCanvasWidth × dpr
init_height = logicalCanvasHeight × dpr

// Example:
// Logical canvas: 600 × 357
// DPR: 2
// Stored: init_width = 1200, init_height = 714
```

But our code was treating these as **logical pixels**, causing positioning errors.

## Solution

Divide `init_width` and `init_height` by DPR to get the actual logical canvas size:

```typescript
const dpr = shapeData.dpr || 1;

// Canvas dimensions stored in PHYSICAL pixels
const canvasWidthPhysical = shapeData.init_width || shapeData.width || 610;
const canvasHeightPhysical = shapeData.init_height || shapeData.height || 610;

// Divide by DPR to get LOGICAL canvas size
const canvasWidth = canvasWidthPhysical / dpr;
const canvasHeight = canvasHeightPhysical / dpr;
```

## Before vs After

### Before (Incorrect)
```typescript
const canvasWidth = shapeData.init_width || 610;  // 1200px
const canvasHeight = shapeData.init_height || 610; // 714px
const dpr = shapeData.dpr || 1;  // 2

// Using physical dimensions as logical → WRONG!
```

### After (Correct)
```typescript
const dpr = shapeData.dpr || 1;  // 2
const canvasWidthPhysical = shapeData.init_width || 610;  // 1200px
const canvasHeightPhysical = shapeData.init_height || 610; // 714px

// Convert to logical dimensions
const canvasWidth = canvasWidthPhysical / dpr;   // 600px ✓
const canvasHeight = canvasHeightPhysical / dpr; // 357px ✓
```

## Impact

This fix affects all coordinate calculations:

### Ratio Calculation
```typescript
// Before (wrong):
xRatio = screenshotWidth / 1200  // Too small → elements shifted

// After (correct):
xRatio = screenshotWidth / 600   // Correct → proper positioning
```

### Center Detection
```typescript
// Before (wrong):
centerThreshold = 1200 × 0.1 = 120px  // Too large threshold

// After (correct):
centerThreshold = 600 × 0.1 = 60px    // Correct threshold
```

### Position Scaling
```typescript
// Before (wrong):
canvasX = item.x / xRatio  // Wrong ratio → incorrect position

// After (correct):
canvasX = item.x / xRatio  // Correct ratio → correct position
```

## Real Example

**Design Specifications:**
- Created on: Desktop with DPR 2 (Retina display)
- Saved values: `init_width=1200`, `init_height=714`, `dpr=2`
- Actual canvas: 600×357 logical pixels

**Before Fix:**
```
Canvas used: 1200×714 (wrong)
Center threshold: 120px (wrong)
Element at x=50: 50/1200 = 4.2% from edge → Not centered (wrong!)
```

**After Fix:**
```
Canvas used: 600×357 (correct)
Center threshold: 60px (correct)
Element at x=50: 50/600 = 8.3% from edge → Near center (correct!)
```

## Code Location

File: `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

```typescript
// Line ~608-622
const dpr = shapeData.dpr || 1;

// Canvas dimensions stored in PHYSICAL pixels (init_width × DPR)
const canvasWidthPhysical = shapeData.init_width || shapeData.width || 610;
const canvasHeightPhysical = shapeData.init_height || shapeData.height || 610;

// Divide by DPR to get LOGICAL canvas size
const canvasWidth = canvasWidthPhysical / dpr;
const canvasHeight = canvasHeightPhysical / dpr;
```

## Debug Output

Enhanced logging shows both physical and logical dimensions:

```javascript
{
  canvas: {
    physical: { width: 1200, height: 714 },  // Stored values
    logical: { width: 600, height: 357 }     // Actual canvas size
  },
  dpr: 2
}
```

## Testing

### Test Case: High DPR Design
```
Saved design values:
- init_width: 1200
- init_height: 714
- dpr: 2

Expected canvas size:
- logical width: 600px (1200 ÷ 2)
- logical height: 357px (714 ÷ 2)

Console should show:
canvas: {
  physical: { width: 1200, height: 714 },
  logical: { width: 600, height: 357 }
}
```

### Test Case: Standard DPR Design
```
Saved design values:
- init_width: 610
- init_height: 610
- dpr: 1

Expected canvas size:
- logical width: 610px (610 ÷ 1)
- logical height: 610px (610 ÷ 1)

Console should show:
canvas: {
  physical: { width: 610, height: 610 },
  logical: { width: 610, height: 610 }
}
```

## Related Issues

This fix resolves:
- ✅ Incorrect center detection threshold
- ✅ Wrong coordinate ratios
- ✅ Positioning errors on high-DPR designs
- ✅ Auto-center not triggering correctly

## Files Modified

- `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`
  - Added DPR division for canvas dimensions (line ~611-617)
  - Enhanced debug logging to show physical vs logical

## Status

✅ **Fixed** - Canvas dimensions now correctly divided by DPR
✅ **TypeScript** - Compiles without errors
✅ **Verified** - Positioning calculations use correct logical dimensions
✅ **Logged** - Debug output shows both physical and logical sizes
