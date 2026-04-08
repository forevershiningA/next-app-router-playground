# Auto-Center Detection for Crop Positioning

## Problem
When auto-cropping screenshots with white space, it's difficult to accurately compensate for the removed pixels because the crop is symmetric (removes from both sides), and coordinate transformations through DPR and ratios can introduce errors.

## Solution: Conditional Auto-Center Detection

Auto-center detection is **only applied when cropping actually occurred** (white space >30%). For designs without excessive white space, normal positioning is used.

### How It Works

1. **Check Crop Status**: Only proceed if `cropBounds.shouldCrop === true`
2. **Convert to Canvas Coordinates**: Transform element position from screenshot pixels to canvas coordinates
3. **Check Distance from Center**: Calculate how far the element is from the canvas center (x=0)
4. **Apply Threshold**: If cropping occurred AND within 10% of canvas width from center, consider it "centered"
5. **Force Center**: If centered, set xPos=0 (perfect center), otherwise use original position

### Implementation

```typescript
// Only apply auto-center if cropping was actually applied
const shouldAutoCenterX = cropBounds?.shouldCrop === true;

// Convert from screenshot to canvas coordinates
const canvasX = item.x / xRatio;
const canvasY = item.y / yRatio;

// Check if originally centered (within 10% of canvas center) AND cropping occurred
const centerThreshold = canvasWidth * 0.1;
const isCentered = shouldAutoCenterX && Math.abs(canvasX) < centerThreshold;

// Force center if cropped and centered, otherwise use original position
const xPos = isCentered ? 0 : (canvasX * scalingFactors.scaleX);
const yPos = canvasY * scalingFactors.scaleY;
```

## Why Conditional?

Auto-centering should **only** apply when we've cropped the screenshot:

### Without Crop (White Space <30%)
```
Screenshot: Full design with no excessive margins
cropBounds.shouldCrop = false
shouldAutoCenterX = false
isCentered = false (even if near center)
→ USE ORIGINAL POSITION (normal rendering)
```

### With Crop (White Space >30%)
```
Screenshot: Design with excessive white margins
cropBounds.shouldCrop = true
shouldAutoCenterX = true
isCentered = true (if near center)
→ FORCE CENTER (compensate for crop)
```

## Examples

### Design A: No Cropping Needed
```
Screenshot: 1000x800px
White space: 15%
cropBounds.shouldCrop = false

Result: Normal positioning (auto-center disabled)
Console: "cropStatus: { applied: false }"
```

### Design B: Cropping Applied
```
Screenshot: 1000x800px
White space: 45%
cropBounds.shouldCrop = true
Element at canvasX = 12px (near center)

Result: Force center (xPos = 0)
Console: "cropStatus: { applied: true, whiteSpace: 45% }"
         "centerCheck: { enabled: true, isCentered: true }"
```

## Code Location

### Inscriptions
File: `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

```typescript
// Line ~1382
const shouldAutoCenterX = cropBounds?.shouldCrop === true;
const canvasX = item.x / xRatio;
const centerThreshold = canvasWidth * 0.1;
const isCentered = shouldAutoCenterX && Math.abs(canvasX) < centerThreshold;
const xPos = isCentered ? 0 : (canvasX * scalingFactors.scaleX);
```

### Motifs
Same file:

```typescript
// Line ~1470
const shouldAutoCenterX = cropBounds?.shouldCrop === true;
const canvasX = motif.x / xRatio;
const centerThreshold = canvasWidth * 0.1;
const isCentered = shouldAutoCenterX && Math.abs(canvasX) < centerThreshold;
const xPos = isCentered ? 0 : (canvasX * scalingFactors.scaleX);
```

## Debug Output

Enhanced console logging shows both crop status and center detection:

### No Cropping
```javascript
{
  cropStatus: {
    applied: false,
    whiteSpace: '18.50%'
  },
  centerCheck: {
    enabled: false,  // Auto-center disabled
    isCentered: false,
    action: 'USE ORIGINAL POSITION'
  }
}
```

### With Cropping
```javascript
{
  cropStatus: {
    applied: true,
    whiteSpace: '45.20%'
  },
  centerCheck: {
    enabled: true,   // Auto-center enabled
    threshold: 61,
    distance: 15,
    isCentered: true,
    action: 'FORCE CENTER (xPos=0)'
  }
}
```

## Benefits

✅ **Selective**: Only applies special handling when needed  
✅ **Preserves Originals**: Designs without crop render normally  
✅ **Smart Detection**: Automatically identifies cropped designs  
✅ **No Side Effects**: Non-cropped designs unaffected  
✅ **Self-Documenting**: Console clearly shows crop/center status

## Testing

### Test Case 1: No Crop
URL: `http://localhost:3000/designs/traditional-headstone/father-memorial/1748244337791_beloved-father`

Screenshot: http://localhost:3000/ml/headstonesdesigner/saved-designs/screenshots/2025/05/1748244337791.jpg

**Expected:**
- Console: `cropStatus: { applied: false }`
- Console: `centerCheck: { enabled: false }`
- Result: Normal positioning (original coordinates preserved)

### Test Case 2: With Crop
URL: `http://localhost:3000/designs/traditional-headstone/father-memorial/1594704296911_always-serving-others`

Screenshot: Excessive white space on sides

**Expected:**
- Console: `cropStatus: { applied: true, whiteSpace: 'XX%' }`
- Console: `centerCheck: { enabled: true, isCentered: true }`
- Result: Centered elements forced to xPos=0

## Decision Flow

```
Is cropBounds.shouldCrop === true?
  ├─ NO  → shouldAutoCenterX = false
  │        → isCentered = false
  │        → USE ORIGINAL POSITION ✓
  │
  └─ YES → shouldAutoCenterX = true
           → Is |canvasX| < threshold?
              ├─ YES → isCentered = true
              │        → FORCE CENTER (xPos=0) ✓
              │
              └─ NO  → isCentered = false
                       → USE ORIGINAL POSITION ✓
```

## Status

✅ **Implemented** - Conditional auto-center detection  
✅ **TypeScript** - Compiles without errors  
✅ **Selective** - Only applies when cropping occurred  
✅ **Tested** - Works correctly for both cropped and non-cropped designs


## Why This Approach?

### Advantages

✅ **Simple**: No complex offset calculations  
✅ **Reliable**: Works regardless of crop amount or DPR  
✅ **Intuitive**: Centered elements stay centered  
✅ **Robust**: Handles all screenshot sizes and crops  
✅ **Self-correcting**: Automatically compensates for any positioning errors

### Visual Example

**Original Canvas (610px):**
```
     -305          0          305
       |-----------|-----------|
                   ↑
           Element at x=15 (near center)
```

**Auto-Center Detection:**
```
Threshold = 610 * 0.1 = 61px
Distance = |15| = 15px
15 < 61 → isCentered = TRUE
Action: Force to x=0 (perfect center)
```

**Result:**
```
Element displayed at center regardless of screenshot crop!
```

## Threshold Selection

**10% of canvas width** is used as the threshold:

- **Too Small (5%)**: Might miss slightly off-center elements
- **Just Right (10%)**: Catches intended centered elements
- **Too Large (20%)**: Might center elements that weren't meant to be

For a typical 610px canvas:
- Threshold = 61px
- Elements within ±61px of center are considered "centered"
- This is reasonable for most headstone designs

## Code Location

### Inscriptions
File: `app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx`

```typescript
// Line ~1382
const canvasX = item.x / xRatio;
const centerThreshold = canvasWidth * 0.1;
const isCentered = Math.abs(canvasX) < centerThreshold;
const xPos = isCentered ? 0 : (canvasX * scalingFactors.scaleX);
```

### Motifs
Same file:

```typescript
// Line ~1465
const canvasX = motif.x / xRatio;
const centerThreshold = canvasWidth * 0.1;
const isCentered = Math.abs(canvasX) < centerThreshold;
const xPos = isCentered ? 0 : (canvasX * scalingFactors.scaleX);
```

## Debug Output

Enhanced console logging shows the auto-center detection:

```javascript
{
  canvasCoords: { x: 15, y: -120 },
  centerCheck: {
    threshold: 61,
    distance: 15,
    isCentered: true,
    action: 'FORCE CENTER (xPos=0)'
  },
  display: { xPos: 0, yPos: -60 }
}
```

## Benefits for Auto-Crop

This approach is **perfect** for auto-cropped screenshots:

1. **No Offset Calculation**: Don't need to know how much was cropped
2. **No DPR Issues**: Works with any device pixel ratio
3. **No Ratio Errors**: Coordinate transformations don't accumulate errors
4. **Universal**: Works for all screenshots, cropped or not

## Edge Cases

### Non-Centered Elements

Elements intentionally offset from center (e.g., side decorations) are preserved:

```
canvasX = 200px
threshold = 61px
|200| > 61 → isCentered = FALSE
Action: Use original position (xPos = 200 * scale)
```

### Multiple Elements

Each element is checked independently:
- Centered title → Forced to center
- Side motif → Keeps original offset
- Centered dates → Forced to center
- Corner decoration → Keeps original position

## Testing

Test URL: `http://localhost:3000/designs/traditional-headstone/father-memorial/1594704296911_always-serving-others`

**Expected Console Output:**
```
Inscription rendering (auto-center detection): {
  centerCheck: {
    isCentered: true,
    action: 'FORCE CENTER (xPos=0)'
  }
}
```

**Visual Result:**
- Centered inscriptions perfectly aligned
- Side elements at correct offsets
- No dependency on crop amount

## Comparison with Previous Approaches

### Offset Compensation (❌ Complex)
```typescript
const cropOffsetX = ((offset || 0) * dpr) / 2;
const xPos = ((item.x + cropOffsetX) / xRatio) * scale;
// Issue: Complex, error-prone, DPR-dependent
```

### Auto-Center Detection (✅ Simple)
```typescript
const canvasX = item.x / xRatio;
const xPos = Math.abs(canvasX) < threshold ? 0 : canvasX * scale;
// Benefit: Simple, reliable, self-correcting
```

## Future Enhancements

Possible improvements:
1. **Configurable Threshold**: Allow per-design threshold adjustment
2. **Y-Axis Detection**: Apply same logic to vertical centering
3. **Multi-Point Detection**: Detect common alignment patterns (thirds, quarters)
4. **Smart Grouping**: Keep related elements aligned together

## Status

✅ **Implemented** - Auto-center detection active for inscriptions and motifs  
✅ **TypeScript** - Compiles without errors  
✅ **Tested** - Works with auto-cropped screenshots  
✅ **Simple** - No complex offset calculations needed
