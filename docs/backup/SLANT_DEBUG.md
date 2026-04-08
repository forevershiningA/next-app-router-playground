# Slant Headstone Coordinate System Debug

## Geometry Construction

1. **Initial vertices** (before translation):
   - Front Bottom: Z = 0
   - Front Top: Z = -frontTopZOffset (negative because top goes backward)
   - Back Bottom: Z = -baseThickness (full depth)
   - Back Top: Z = -topThickness

2. **After `translate(x, y, depth/2)`**:
   - Front Bottom: Z = 0 + depth/2 = depth/2
   - Front Top: Z = -frontTopZOffset + depth/2
   - Back Bottom: Z = -baseThickness + depth/2 = -depth/2
   - Back Top: Z = -topThickness + depth/2

Wait! If `baseThickness === depth`, then:
   - Back Bottom: Z = -depth + depth/2 = -depth/2 ✓

So after translation:
- **Front face bottom edge**: Z = depth/2
- **Front face top edge**: Z = depth/2 - frontTopZOffset
- **Back face bottom edge**: Z = -depth/2

## Problem

The wrapper is at `[0, 0, 0]` but the front face is at `Z = depth/2`!

## Solution

The wrapper should be at `[0, 0, depth/2]` to align with the front face bottom edge.
