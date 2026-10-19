# Progressive garden hero — 2026-10-19

The homepage uses `hero-garden-v3.webm`, its MP4 fallback and its finished-design poster. This replaces v2's orbital movement and `zoompan` camera crop with fixed camera framing. Integer crop movement during v2's slow zoom could produce visible stepping; v3 has no orbit, pan, or zoom.

The 18-second video begins with a blank Serpentine Blue Pearl stone and base. It adds “In Loving Memory”, “Always in our hearts”, the dove, the left botanical branch, then the mirrored right branch. Each stage is captured from one actual configurator state for both the laptop and the outdoor product. The laptop navigates through the real material, inscription and motif panels. Both sides are composited into the same stage image before transitions, so additions share exactly the same timing. The finished design holds for about five seconds; a final gentle dissolve returns both stones to the blank opening.

The garden remains the v2 AI background plate. No new image generation was performed for this revision. The UI and all product states come from the actual Three.js scene. Stage additions are 0.4-second dissolves; this is an offline demonstration film, not an interactive configurator embedded on the homepage. The reduced-motion fallback shows the matching finished-design poster.

## Rebuild

The selected six lossless stage images, design manifest and timeline are saved in `assets/video-sources/hero-garden-v3/`. Rebuild the video without a server or database:

```sh
node scripts/render-hero-progressive.mjs
```

To recapture, use the isolated local development server described in `hero-garden-v2.md` (default port 3102):

```sh
node scripts/capture-hero-matched.mjs --progressive
node scripts/render-hero-progressive.mjs --package
```

The first command preloads the complete design, then captures the six progressively populated states with identical camera settings and product framing. It saves raw UI/product pairs in ignored `output/hero-progressive/`. The second validates stage counts and camera equality, packages the composed stages, and exports the film. All compositing happens at the native 1672 × 941 plate resolution before a single final resize to 1280 × 720.

## Validation

- Stage counts were checked as `(inscriptions, motifs)`: `(0,0)`, `(1,0)`, `(2,0)`, `(2,1)`, `(2,2)`, `(2,3)`.
- Camera position/projection and transparent product dimensions stayed identical across all stages. The background's top 100 pixels were pixel-identical across all six lossless stage images.
- Chromium on the actual homepage decoded WebM as 18 seconds, 1280 × 720, with muted playback and looping. Frames at 1, 3.3, 5.7, 8.1, 10.5, 14 and 17.9 seconds were captured; the blank opening and completed design were visually inspected. Playback crossed the loop boundary back to the opening.
- Desktop 1440 × 1000 and mobile 390 × 844 viewport checks passed. No mobile horizontal overflow or browser page errors occurred. Reduced motion hid the video and showed the finished-design poster.
- MP4 decoded successfully when generating the poster. Script syntax, Prettier and the relevant Git whitespace checks passed.
- Files: MP4 720,360 bytes; WebM 920,108 bytes; poster 200,272 bytes. No production build, deployment or Safari/iOS test was performed.
