# Photographic garden hero — 2026-10-20

This alternative keeps the original photographic-style monument and garden from `hero-garden-scene-v1.webp` throughout the film. Only the laptop screen changes: six actual configurator captures show the Blue Pearl Serpentine design being assembled, with two cream inscriptions, a dove and mirrored botanical branches. The configurator upright is 800 × 600 mm with 430 mm branches to follow the wider reference monument.

The right-hand monument remains the original AI-generated illustration. The configurator recreates its design using available shapes, fonts and motifs; it is an approximation, not an identical manufactured product or pixel-exact reproduction. No new image generation is used.

The film uses a fixed camera, 18 seconds, silent looping WebM and MP4, plus a finished-design poster for reduced motion. Earlier versions remain available.

Rebuild from packaged stages without a server:

```sh
node scripts/render-hero-progressive.mjs --photographic
```

Recapture from a local development server with `DESIGN_PREVIEW_CAPTURE=1` on port 3102:

```sh
node scripts/capture-hero-matched.mjs --progressive --photographic
node scripts/render-hero-progressive.mjs --photographic --package
```

Packaged sources are in `assets/video-sources/hero-garden-v4/`; temporary full-resolution captures are in ignored `output/hero-photographic/`.

The two new outline SVG motifs are `hero-botanical-outline.svg` and `hero-dove-outline.svg` in `public/shapes/motifs/`. The capture manifest retains their positions, sizes and colours. Capture-only native history updates change the designer panels while retaining the mounted scene and camera.

Validation: all six stage cameras and product dimensions matched; the rightmost 680 pixels of the six 1280 × 720 lossless stages are byte-identical after decoding. Chromium decoded both formats; WebM autoplay was muted and the 18-second loop returned to the opening. Desktop 1440 × 1000 and mobile 390 × 844 were inspected, with no horizontal overflow. Reduced motion hid the video and displayed its poster. The final browser check reported no page errors (an earlier development run produced a transient syntax error that did not recur on reload). Script syntax and Git whitespace checks passed. No production build, deployment or Safari/iOS test was performed.
