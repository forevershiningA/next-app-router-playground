# Matched garden hero — 2026-10-19

The homepage now uses `hero-garden-v2.webm`, its MP4 fallback and its matching poster. The v1 files remain available for comparison.

Both products come from the same live configurator scene: product 124, Serpentine 600 × 600 mm, Blue Pearl granite on upright and base, Garamond inscriptions “In Loving Memory” and “Always in our hearts”, a dove and two mirrored botanical branches. The right-hand stone is a transparent render, not an AI approximation of the configured product. The laptop uses 120 captured frames of the same scene, with a gentle periodic camera orbit and no shape/material/content changes. The composed film is silent, 12 seconds, 1280 × 720, 25 fps.

The garden is an AI-generated background plate; plants and the outdoor stone are static. A subtle periodic camera movement animates the composite. Lighting is inherited from the configurator render, with a soft composited ground shadow; this is a visual demonstration, not a photograph of a manufactured memorial.

Validated on the actual homepage in Chromium at desktop 1440 × 1000 and mobile 390 × 844: the WebM decoded as 12 seconds at 1280 × 720, muted autoplay and loop were enabled, playback crossed the loop boundary correctly, and no browser page errors or mobile horizontal overflow occurred. With reduced motion enabled the video was hidden and its matching poster was visible. The screenshots and transparent product render were inspected. MP4 decoded successfully during poster creation. Final sizes: WebM 1,112,078 bytes; MP4 2,862,564 bytes. No production build, deployment, or Safari/iOS test was performed.

## Rebuild from saved sources

Run `node scripts/render-hero-garden.mjs --matched`. All selected inputs are saved in `assets/video-sources/hero-garden-v2/`: `configurator.mp4`, `product.png`, `garden-plate.webp`, and `design.json`. No server or database is needed to rebuild the final files from these inputs.

To recapture the actual product/UI, start an isolated development server with `DESIGN_PREVIEW_CAPTURE=1` on port 3102 from the canonical Windows path (`C:\Users\polcr\Documents\GitHub\next-app-router-playground`), then run:

```sh
node scripts/capture-hero-matched.mjs
node scripts/package-hero-matched.mjs
node scripts/render-hero-garden.mjs --matched
```

`HERO_MATCHED_BASE_URL` can override the local server URL; remote URLs are refused. The `--still` capture option renders one review frame. Raw frames and intermediate screenshots stay in ignored `output/hero-matched/` and `output/hero-concept/` folders. The capture script uses existing development-only store/Three.js hooks and does not change the application runtime.

## Background provenance

The built-in `image_gen` tool edited the v1 source image. The selected output was saved locally, optimized to WebP, and preserved in the source directory above. No generated interface, engraving, or headstone is used in the v2 final composite.

Final edit prompt:

> Precise object removal edit. Input is the edit target. Remove ONLY the large blue-gray granite memorial AND its matching rectangular stone base on the RIGHT half of the image. Replace the removed monument and base with the continuation of the softly defocused sunlit garden behind it and a low level natural grassy planting bed on the ground, suitable for subsequently placing a different 3D headstone render at the same location. No other monument in the cleared area. Preserve the exact original framing, camera, dimensions/aspect ratio, laptop, blank dark laptop screen and its precise four corner positions, all left hand rocks, large foreground rock ledge, sunlight, color grading, bokeh, upper negative space and flowers outside the removed stone silhouette. The left half must remain unchanged. Do not move or redesign laptop. Right planting area should be calm, unobstructed, with low tiny white flowers and grass and a clear ground contact area, no big bushes or objects occluding a replacement stone. Do not add text or any new objects. This is a clean background plate for exact compositing of a real product; preserve original image geometry.
