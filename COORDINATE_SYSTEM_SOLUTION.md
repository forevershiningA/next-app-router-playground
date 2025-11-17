# Coordinate System Solution

## The DPR Trap - Root Cause Analysis

### What We Know
1. **Authoring frame**: 707×476 (desktop) or 414×660 (iPhone) - CSS pixels
2. **Screenshot**: May be larger due to DPR (e.g., 1644×1107 for DPR 2.325)
3. **Saved coordinates**: From `container.x` and `container.y` in CreateJS/PIXI

### The Key Insight
```js
// From old serialize function:
self.x = this.container.x;  // This is in CANVAS CSS PIXELS
self.y = this.container.y;  // NOT screenshot physical pixels!
```

**Coordinates are in authoring frame space (CSS pixels), NOT screenshot space (physical pixels)!**

### Current Mistakes
1. ❌ We're dividing coordinates by `ratioHeight` (treating them as screenshot pixels)
2. ❌ We're trying to auto-detect which space they're in
3. ❌ We're applying complex DPR normalization

### The Simple Solution

**For Inscriptions & Motifs:**
```typescript
// Coordinates are ALREADY in authoring frame space (CSS pixels)
// Range: 0 to initW (e.g., 0-707 or 0-414)
const canvasX = inscription.x;  // Use directly!
const canvasY = inscription.y;  // Use directly!

// Position within the scaled container
const xPos = canvasX - (initW / 2);  // Offset from center
const yPos = canvasY - (initH / 2);  // Offset from center

// Apply to element (container already has uniformScale applied)
style = {
  left: `calc(50% + ${xPos}px)`,
  top: `calc(50% + ${yPos}px)`,
  transform: 'translate(-50%, -50%)',
  fontSize: `${fontSize}px`,  // Font size is also in canvas CSS pixels
  width: `${width}px`,  // Dimensions in canvas CSS pixels
  height: `${height}px`
}
```

**Container sizing:**
```typescript
// Container represents the authoring frame, scaled uniformly
<div style={{
  width: `${initW * uniformScale}px`,
  height: `${initW * uniformScale}px`,  // SQUARE for square SVGs!
  position: 'relative'
}}>
  {/* SVG and inscriptions go here */}
</div>
```

### What About DPR Then?

**DPR is only used for:**
1. ✅ Calculating screenshot → canvas space (for crop bounds)
2. ✅ Understanding the physical screenshot dimensions
3. ❌ NOT for transforming saved coordinates (they're already in canvas space!)

### Action Items

1. **Remove all `/ ratioHeight` divisions for coordinates**
2. **Use coordinates directly as canvas CSS pixels**
3. **Make container square if SVG is square**
4. **Keep it simple: pixels in = pixels out (just scaled)**

