# Coordinate System Analysis

## The Problem
We have THREE different coordinate spaces that need to work together:

### 1. SVG Native Space
- Example: 400×400 (from viewBox)
- This is the headstone shape's natural dimensions
- Path coordinates are in this space

### 2. Authoring Frame Space  
- Example: 414×660 (from init_width × init_height)
- This is the CreateJS canvas size when the design was created
- **Inscriptions and motifs were positioned in this space**
- This is stored as `this.container.x` and `this.container.y` in CreateJS

### 3. Physical Screenshot Space
- Example: 1242×1980 (for iPhone with DPR 3)
- This is init_width × init_height × DPR
- Screenshots are captured at this resolution

## Critical Questions

### Q1: What coordinate space are saved X/Y values in?
From serialize function:
```js
self.x = this.container.x;  // CreateJS container position
self.y = this.container.y;
```

**Answer:** Authoring Frame Space (414×660)
- CreateJS canvas was set to init_width × init_height
- Container positions are in CSS pixels (logical canvas pixels)
- NOT in physical screenshot pixels

### Q2: What coordinate space are font sizes in?
From serialize function:
```js
self.font = this.text.font;  // e.g., "129.74px Garamond"
```

The font is rendered on a canvas at init_width × init_height. So font sizes are in **Authoring Frame Space** (CSS pixels).

### Q3: How do we display everything together?

**The Solution:**
1. **Container:** Size it to fit the display (using uniformScale)
2. **SVG:** Place it in a sub-container sized to its natural aspect ratio
3. **Inscriptions:** Position them in authoring frame coordinates, let container scale handle display

## The Old Logic (that worked)

```js
ratio_height = (dyo.h / init_height) * (ratio);
x = ratio_height * savedX;  // Transform from authoring to display
y = ratio_height * savedY;
```

This transforms FROM authoring frame TO current display size.

## What We Need

**Option A: Container = Authoring Frame**
- Container sized to authoring frame (414×660) × uniformScale
- SVG might not fill it (if SVG is 400×400)
- Inscriptions positioned directly with saved coordinates
- SVG needs centering/positioning within container

**Option B: Container = SVG Size**  
- Container sized to SVG (400×400) × uniformScale
- SVG fills container perfectly
- **Inscriptions need coordinate transformation** from authoring frame (414×660) to SVG space (400×400)
- This requires knowing the relationship between authoring frame and SVG

## Recommendation

We need to know: **Where was the SVG positioned in the authoring frame?**
- Was it centered?
- Was it top-aligned?
- What were the offsets?

This information might be in the Headstone data item in the JSON!
