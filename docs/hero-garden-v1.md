# Garden hero concept — 2026-10-19

Preview: `/videos/hero-garden-v1-preview.html`. This standalone review page does not replace the homepage hero. It can also be opened directly from disk.

Assets in `public/videos/`:

- `hero-garden-v1.mp4`: 12 seconds, 1280 × 720, 25 fps, silent H.264, fast start; 3,749,565 bytes.
- `hero-garden-v1.webm`: matching VP9; 1,674,862 bytes.
- `hero-garden-v1-poster.webp`: representative frame.
- `hero-garden-scene-v1.webp`: optimized source image.

Rebuild with `node scripts/render-hero-garden.mjs`. Requires the existing `configurator-hero.mp4` and the scene image. The script uses the repository's `ffmpeg-static` dependency, blends the end of the screen recording into its opening, and applies a periodic camera movement to the composite.

This is an animated still with real interface footage composited onto the laptop, not a fully animated 3D garden or generative video. The illustrative memorial does not exactly match the changing configurator design (engraving, motif, and materials). A faithful final design-to-product transition would need the same actual product rendered into the garden. No stock footage was licensed, no external publishing occurred, and no new runtime dependencies were added.

Validation: Chromium opened the standalone preview, decoded the WebM at 1280 × 720 with duration 12 seconds, and returned to the opening after the loop boundary. Desktop 1440 px and mobile 390 px screenshots were inspected; mobile had no horizontal overflow. The heading toggle worked and no page errors occurred. MP4 was decoded by FFmpeg when generating the poster. This is not an iOS/Safari compatibility test.

## Image generation provenance

Generated with the built-in `image_gen` tool, then optimized to WebP with Sharp. The original generated PNG is retained in `output/hero-concept/garden-scene-v1.png` alongside reference and review screenshots. The image was generated from the prompt below, without image inputs; the user's `screen.png` informed the composition manually.

Final prompt:

> Use case: ads-marketing / photorealistic product mockup. Create a cinematic ultra-wide website hero photographic scene, landscape 16:9, ideally 1920x1080. On LEFT an open premium dark unbranded laptop on a natural stone ledge, viewed almost straight on so its entire rectangular screen is clearly visible and usable for video compositing. Laptop screen is flat pure dark charcoal blank with no reflections, no text and no UI; screen corners should be sharp and clearly identifiable. Laptop occupies left 48% of frame, screen from approximately x 5% to 46%, y 30% to 76%. Keyboard visible below, not cropped off. On RIGHT a beautiful polished Blue Pearl dark blue-gray granite memorial headstone, upright square slab with gently curved serpentine top, on a wide low rectangular matching granite base. It is a realistic full sized outdoor cemetery memorial, NOT a tiny tabletop model. White delicate engraved botanical sprigs at left and right edges, small dove above the inscription. Exact inscription in elegant light cream serif: 'In Loving Memory' and below 'Always in our hearts'. No names, dates or portrait. Sunlit peaceful garden cemetery setting, soft defocused mature trees and meadow grass, white flowers near base of memorial, tasteful tiny blush flowers on far right. Warm late afternoon light from upper right, realistic granite reflections and texture, restrained premium editorial photography. Keep upper 22% of image dark forest green softly blurred with substantial calm negative space for HTML headings later. Left laptop and right monument linked compositionally; both must be fully visible with space around them. No headline, no marketing text, no arrows, no watermark, no logos. Inspired by a before and after design-to-real-memorial website hero. The final scene will be animated with subtle camera movement and actual interface footage added to the laptop. The laptop should not overlap or occlude the memorial. Output one image.
