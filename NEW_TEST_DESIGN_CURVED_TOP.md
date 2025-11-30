# New Test Design - Curved Top (1687326292190)

## Design Overview

**Design ID:** 1687326292190  
**URL:** http://localhost:3000/designs/traditional-headstone/biblical-memorial/curved-top-for-god-so-loved-the-world  
**Shape:** Curved Top  
**Type:** Laser Etched Black Granite Headstone  
**Orientation:** Mobile Portrait  

## Key Differences from Previous Design

### Design 1725769905504 (Curved Gable):
- Desktop landscape (707×476 viewport)
- DPR: 2.325
- Traditional engraved (black text on gray granite)
- Canvas: 1066×1078 px
- Base: 700mm → 1066px (scale: 1.523 px/mm)
- Headstone: 609.6mm → 928.3px

### Design 1687326292190 (Curved Top):
- **Mobile portrait** (414×601 viewport) 
- DPR: 2.0
- **Laser etched** (white text/motifs on black granite)
- Canvas: 828×1202 px
- Base: 774.7mm → 828px (scale: 1.069 px/mm)
- Headstone: 647.7mm → 692.3px

## Dimensions Breakdown

### From JSON:
```json
{
  "shape": "Curved Top",
  "width": 647.7,          // mm
  "height": 666.75,        // mm
  "init_width": 414,       // viewport px
  "init_height": 601,      // viewport px
  "device": "mobile",
  "dpr": 2
}

Base: {
  "width": 774.7,          // mm
  "height": 101.6          // mm
}
```

### Calculated Canvas Dimensions:
```javascript
Viewport: 414 × 601 px
DPR: 2
Canvas (screenshot): 414 × 2 = 828 px wide
                     601 × 2 = 1202 px tall
```

### MM to PX Scale:
```javascript
Base width: 774.7 mm
Canvas width: 828 px

Scale factor = 828 / 774.7 = 1.069 px/mm
```

### Headstone in Canvas Pixels:
```javascript
Headstone: 647.7 × 666.75 mm
Scale: 1.069 px/mm

Width:  647.7 × 1.069 = 692.3 px
Height: 666.75 × 1.069 = 712.6 px
```

### Shape Scaling:
```javascript
SVG viewBox: 0 0 400 400 (assumed for curved top)
Target width: 692.3 px

SVG scale = 692.3 / 400 = 1.731

Transform: translate(-346.15, -601) scale(1.731)
- X: -692.3/2 = -346.15 (centered)
- Y: -601 (top of canvas)
```

## Canvas Layout

```
                  Top: y = -601
      ├────────── 828px ──────────┤
      ┌──────────────────────────┐
      │                          │
      │   ┌────────────────┐     │
      │   │  HEADSTONE     │     │  692.3px wide
      │   │  692.3 × 712.6 │     │  712.6px tall
      │   │                │     │
      │   │  (Curved Top)  │     │
      │   │                │     │
      │   │                │     │
      │   │                │     │
      │   └────────────────┘     │
      │                          │
      ├──────────────────────────┤  
      │     BASE AREA            │  828px wide
      │  (774.7mm = 828px)       │  101.6mm tall
      └──────────────────────────┘
                Bottom: y = 601
```

## Element Count

- **11 Inscriptions** (white text on black)
  - "In loving memory of"
  - "Our beloved daughter"
  - "Alyssa Ann O'Hanlon"
  - "Sunrise February 26 2002"
  - "Sunset June 7 2023"
  - "Forever in our hearts"
  - "You're one of heavens angels now"
  - "A perfect little star"
  - "And when you shine, the world can see"
  - "How beautiful you are"
  - "Forever 21"

- **6 Motifs** (white on black)
  - 2 doves (top corners, one flipped)
  - 2 flowers (middle sides, flipped)
  - 2 butterflies (bottom, one flipped)

- **1 Photo**
  - Ceramic oval photo (130×180mm)
  - Position: x=-6, y=-250.55

## Files Created

1. **test-curved-top-design.html** - Test page for this design
   - Shows canvas layout
   - Displays headstone shape (placeholder rectangle for now)
   - Ready for inscriptions/motifs/photo to be added

## Texture

**File:** `public/textures/forever/l/18.jpg`

This is a black granite texture, but since it's laser etched:
- Background: Solid black (#000000)
- Text/Motifs: White (#ffffff)
- Photo: Full color ceramic

## Next Steps

To complete the test HTML:

1. Load actual Curved Top SVG path from `public/shapes/headstones/curved_top.svg`
2. Add all 11 inscriptions with white color and correct fonts
3. Add all 6 motifs (white, some flipped)
4. Add the oval ceramic photo
5. Verify all coordinates match the live page

## Comparison Points

When testing against http://localhost:3000/designs/traditional-headstone/biblical-memorial/curved-top-for-god-so-loved-the-world

Check:
1. Headstone size (692.3px wide, should be 83.5% of canvas)
2. All text positions (11 inscriptions)
3. Motif positions (6 motifs, some flipped)
4. Photo position and size
5. Overall layout matches mobile portrait orientation

## File Location

**Test HTML:** `file:///C:/Users/polcr/Documents/github/next-dyo/test-curved-top-design.html`

Open this file to see the basic structure. Elements will need to be populated from the JSON data.
