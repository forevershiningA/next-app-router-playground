# Cursor, model orbit and closing title — 2026-10-20

The homepage uses `hero-garden-v7`, retaining the 26-second v6 product/shape/granite/engraving sequence. A white pointer and brief gold click rings indicate the product card, Serpentine shape, African Red, Blue Pearl and inscription navigation. These are offline explanatory overlays positioned over the corresponding real captured controls.

From 20 seconds, the finished model on the laptop gently orbits ±0.22 radians (about 13 degrees) around the camera's up axis. The 130 real configurator frames at 25 fps return to the opening camera angle; the laptop transitions back into the existing loop. The outdoor reference monument remains static. The closing title, “Your design. A lasting tribute.”, fades in at 21 seconds and fades out before the loop boundary. The scene remains silent with the same full design and dimensions.

The orbit uses normalized world-space directions so the headstone mesh's nonuniform scale cannot flatten the movement. Camera positions are computed from the frame index, giving repeatable timing independent of browser capture speed. There is no additional runtime WebGL on the homepage.

Rebuild from saved v6 video and packaged orbit source:

```sh
node scripts/render-hero-polished.mjs
```

To recapture the orbit using the local preview server on port 3102 with `DESIGN_PREVIEW_CAPTURE=1`:

```sh
node scripts/capture-hero-matched.mjs --finale
node scripts/render-hero-polished.mjs --package
```

`assets/video-sources/hero-garden-v7/` retains the composed orbit MP4, design manifest and overlay timeline. Rebuild also uses the retained `public/videos/hero-garden-v6.mp4`. Raw UI frames, composed lossless finale frames and generated overlay frames remain in ignored `output/hero-finale/` and `output/hero-polished/`. Packaging checks product, shape, materials, dimensions and engraving against v6 before composing the new finale. Earlier versions are retained.

The homepage's HTML “From design to memorial” badge sits at the bottom right, leaving the closing title clear on mobile.

Validation: Chromium decoded WebM as 26 seconds, 1280 × 720 with muted autoplay and looping; MP4 decoded as well. Playback crossed the loop boundary. Desktop 1440 × 1000 and mobile 390 × 844 passed without page errors or horizontal overflow, and reduced motion displayed the matching poster. Playback frames at 1.8, 5.8, 20.4, 21.3, 22.8 and 24.5 seconds were captured; pointer, orbit, closing title and final mobile badge position were visually inspected. First/last overlay frames are fully transparent, and model-region pixel comparison confirms visible orbit movement. Packaging validated the finale against v6's completed design. Script syntax, targeted formatting and whitespace checks passed. No production build, deployment or Safari/iOS test was performed.
