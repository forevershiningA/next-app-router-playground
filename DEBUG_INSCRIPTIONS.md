# Debug Inscriptions Not Showing

## Quick Test

Open browser console at http://localhost:3001/select-size and run:

```javascript
// Check how many inscriptions are loaded
const store = useHeadstoneStore.getState();
console.log('Inscriptions in store:', store.inscriptions.length);
store.inscriptions.forEach((insc, i) => {
  console.log(`${i+1}. "${insc.text}" at (${insc.xPos}, ${insc.yPos}) size=${insc.sizeMm}mm`);
});
```

## Expected Output

Should show 9 inscriptions:
1. "KLEIN" at (1.8, 220.1) size=73mm
2. "MAY 13, 1927" at (-189.2, -143.2) size=17mm
3. "FEB 2, 2024" at (-186.2, -173.5) size=17mm
4. "OCT 2, 1933" at (136.5, -185.2) size=17mm
5. "SEPT 18, 2022" at (138, -211.7) size=17mm
6. "May Heaven's eternal happiness be thine." at (6.1, 117.6) size=25mm
7. "TERESA ISABELLA" at (146.7, -100.2) size=24mm
8. "ISABEL WADE" at (142.4, -148.3) size=21mm
9. "MIGUEL THOMPSON" at (-180.1, -107.3) size=21mm

## If you see fewer than 9

The canonical loader isn't working. Check for errors in console.

## If you see all 9 but only 2-3 visible on screen

The issue is with 3D rendering/positioning, not with loading.

Possible causes:
- Camera frustum clipping
- Z-depth issues (elements behind headstone)
- Coordinate system mismatch (still)
- Text bounds calculation issue

Next step: Add console.log to HeadstoneInscription to see what positions it's actually rendering at.
