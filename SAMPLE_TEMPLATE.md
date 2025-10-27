# Sample Headstone Template

This application now loads with a beautiful, pre-configured memorial headstone design that serves as a template and demonstration of the available features.

## Template Details

### Headstone Information
- **Name:** Sarah Elizabeth Thompson
- **Years:** 1945 - 2023
- **Size:** 900mm x 900mm
- **Material:** Imperial Red granite (default)

### Inscriptions (5 lines)

The template includes a complete, meaningful memorial inscription with generous spacing:

1. **"In Loving Memory"**
   - Font: Chopin Script
   - Size: 55mm
   - Color: Gold (#c99d44)
   - Position: Top (Y: 50)

2. **"Sarah Elizabeth Thompson"**
   - Font: Chopin Script
   - Size: 75mm (name prominence)
   - Color: Gold (#c99d44)
   - Position: Upper center (Y: 20) — 30mm gap from line 1

3. **"1945 - 2023"**
   - Font: Franklin Gothic (different font style for dates)
   - Size: 50mm
   - Color: White (#ffffff) for strong contrast
   - Position: Center (Y: -12) — 32mm gap from line 2

4. **"Forever in Our Hearts"**
   - Font: Chopin Script
   - Size: 45mm
   - Color: Gold (#c99d44)
   - Position: Lower center (Y: -38) — 26mm gap from line 3

5. **"Beloved Mother & Grandmother"**
   - Font: Chopin Script
   - Size: 38mm
   - Color: Gold (#c99d44)
   - Position: Bottom (Y: -60) — 22mm gap from line 4

**Spacing:** Lines now have generous 22-32mm vertical gaps for comfortable reading without crowding

### 3D Additions (3 elements)

The template includes three tastefully positioned bronze/metal applications (all with proper texture support):

1. **Angel (B1134S)**
   - Type: Application (decorative bronze element)
   - Position: Top center (X: 0, Y: 55)
   - Scale: 0.7
   - Z-offset: Automatically calculated with 1.5 unit offset to sit properly on surface (not embedded)
   - Purpose: Represents peace and spiritual protection

2. **Rose Flower (B1649)**
   - Type: Application (floral design)
   - Position: Bottom left (X: -32, Y: -38)
   - Scale: 0.55
   - Z-offset: Automatically calculated with 1.5 unit offset to prevent deep insertion
   - Purpose: Symbol of love and remembrance

3. **Cross (B2127)**
   - Type: Application (religious symbol)
   - Position: Bottom right (X: 32, Y: -38)
   - Scale: 0.55
   - Z-offset: Automatically calculated with 1.5 unit offset
   - Purpose: Faith and eternal life

**Note:** Z-position is automatically calculated based on model depth with a 1.5 unit forward offset to ensure additions sit properly on the headstone surface rather than being embedded into it. All selected additions have proper colorMap textures for realistic appearance.

### Motifs (2 laser-etched designs)

The template includes two decorative motifs positioned in the upper section with increased visibility:

1. **Dove (motif_dove_1)**
   - Source: /shapes/motifs/dove_002.svg
   - Position: Upper left side (X: -40, Y: 55)
   - Scale: 1.2 (increased for visibility)
   - Height: 100mm (increased for better visibility)
   - Color: Gold (#c99d44)
   - Purpose: Symbol of peace and the Holy Spirit

2. **Cross (motif_cross_1)**
   - Source: /shapes/motifs/cross_001.svg
   - Position: Upper right side (X: 40, Y: 55)
   - Scale: 1.2 (increased for visibility)
   - Height: 100mm (increased for better visibility)
   - Color: Gold (#c99d44)
   - Purpose: Christian faith symbol

**Note:** Motifs are now larger and positioned higher to ensure they are clearly visible on the headstone.

## Design Philosophy

The template demonstrates:

1. **Visual Hierarchy:** The name is largest, drawing the eye first, with generous spacing between all lines
2. **Typography Contrast:** Dates use Franklin Gothic font in white for strong visual distinction
3. **Generous Spacing:** 22-32mm vertical gaps between lines ensures comfortable reading without crowding
4. **Symmetry:** Balanced placement of elements (dove/cross at top, rose/cross at bottom)
5. **Symbolism:** Each element carries meaning - angels for protection, roses for love, doves for peace, crosses for faith
6. **Optimal Positioning:** 
   - Motifs placed high (Y: 55) and made larger (scale 1.2, height 100mm) for clear visibility
   - Additions have automatic depth calculation with 1.5 unit forward offset to prevent embedding
   - Elements positioned to frame the inscriptions beautifully
7. **Color Consistency:** Gold tone (#c99d44) throughout with white dates (#ffffff) for strong contrast
8. **Automatic Depth Management:** Addition z-position is calculated automatically based on model depth, ensuring proper surface placement

## How to Customize

Users can now:

1. **Edit Inscriptions:** Click on any text to modify it
2. **Add More Elements:** Use the navigation to add additional motifs, additions, or inscriptions
3. **Reposition Items:** Click and drag any addition or motif to reposition it
4. **Change Size:** Adjust the headstone dimensions in the "Select Size" panel
5. **Change Material:** Select different stone materials in the "Select Material" panel
6. **Change Shape:** Choose from various headstone shapes in the "Select Shape" panel

## Technical Implementation

The template is defined in `lib/headstone-store.ts` with:

- Pre-configured `selectedAdditions` array with 3 additions
- Initial `additionOffsets` object with precise positioning
- Pre-configured `selectedMotifs` array with 2 motifs
- Initial `motifOffsets` object with positioning
- Five meaningful inscription lines with appropriate sizing and placement

This provides users with a complete, professional-looking starting point that they can then customize to their needs.
