# Shape and granite introduction — 2026-10-20

The homepage hero uses `hero-garden-v5`, a 24-second extension of the photographic v4 alternative. The right-hand monument and garden remain unchanged throughout. The laptop starts with the shape selection panel, proceeds to the Serpentine shape in African Black, compares African Red, then selects the target Blue Pearl. It then adds the two inscriptions, outline dove and mirrored botanical sprigs as in v4. The completed design holds before dissolving back to the opening.

The nine stages use the actual configurator UI and renderer. The right-hand memorial remains the original generated photographic-style reference; the configured design is a close recreation. The camera stays fixed and the film has no audio.

Rebuild from packaged stages:

```sh
node scripts/render-hero-progressive.mjs --intro
```

Recapture with the local development server on port 3102 and `DESIGN_PREVIEW_CAPTURE=1`, started from the canonical Windows project path:

```sh
node scripts/capture-hero-matched.mjs --intro
node scripts/render-hero-progressive.mjs --intro --package
```

Sources, manifest and timeline: `assets/video-sources/hero-garden-v5/`. Temporary captures: ignored `output/hero-intro/`. V4 remains available unchanged.

The full-screen shape catalog is captured on a separate page because it unmounts the 3D canvas. The remaining eight stages share one mounted renderer and identical fitted camera. Packaging checks the stage counts, 800 × 600 mm dimensions, upright/base granite sequence and camera equality.

Validation: Chromium decoded WebM as 24 seconds, 1280 × 720, with muted autoplay and looping; it crossed the loop boundary back to the opening. MP4 decoded as well. Sampled playback frames at 1, 3, 5, 7 and 20 seconds were captured, and the opening/catalog, red granite and mobile page were visually inspected. Desktop 1440 × 1000 and mobile 390 × 844 checks passed without horizontal overflow or page errors. Reduced motion hid the video and showed its matching poster. The rightmost 680 pixels of all nine decoded lossless stages are byte-identical. Script syntax, targeted formatting and Git whitespace checks passed. No production build, deployment or Safari/iOS test was performed.
