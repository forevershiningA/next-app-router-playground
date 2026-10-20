# Product selection introduction — 2026-10-20

The homepage hero uses the 26-second `hero-garden-v6`. It adds the actual `/select-product` page before the complete v5 sequence. The opening shows the Headstones category with the Traditional Engraved Headstone card hovered, followed by shape selection, granite comparison, inscriptions and motifs. The right-hand reference monument and garden stay unchanged.

The nine v5 stage files are copied without modification. Only the new opening is composed from a fresh 1440 × 900 browser screenshot. The film stays silent, at 1280 × 720 and 25 fps, with 0.4-second dissolves, looping and a finished-design poster.

Rebuild from packaged sources without a running server:

```sh
node scripts/render-hero-progressive.mjs --product-intro
```

Recapture just the new product-selection page from the local development server on port 3102, then package it with the existing v5 stages:

```sh
node scripts/capture-hero-product-intro.mjs
node scripts/render-hero-progressive.mjs --product-intro --package
```

The capture script accepts `HERO_MATCHED_BASE_URL` for a local host only. Sources and manifests are in `assets/video-sources/hero-garden-v6/`; temporary captures are ignored in `output/hero-product-intro/`. Earlier videos are retained.

Validation: Chromium decoded both WebM and MP4. The homepage WebM reported 26 seconds at 1280 × 720, with muted autoplay and looping; playback crossed the loop boundary. Frames at 1, 3 and 22 seconds were captured and the opening was visually inspected. Desktop 1440 × 1000 and mobile 390 × 844 checks passed with no page errors or horizontal overflow. Reduced motion displayed the finished-design poster. All nine retained v5 source files are byte-identical; the rightmost 680 pixels of all ten decoded lossless stages are identical. Script syntax, targeted formatting and Git whitespace checks passed. No production build, deployment or Safari/iOS test was performed.
