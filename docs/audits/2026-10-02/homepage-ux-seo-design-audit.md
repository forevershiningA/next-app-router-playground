# Home Page UX, SEO & Design Consistency Audit

Date: 2026-10-02  
Scope: `/`, `app/page.tsx`, `app/_ui/HomeSplash.tsx`, root layout, global styles, robots and sitemap  
Method: code review plus Chromium renders at 390×844 and 1440×900

> Remediation update, 2026-10-02: the implementation now resolves the P0 findings and the actionable P1/P2 items that do not require new legal copy, customer evidence, or production field data. The page now has a main landmark and skip link, visible focus, focus-managed mobile navigation, real footer destinations, a shorter mobile catalogue, complete social image metadata, stable structured data, unified display typography and reduced-motion handling. Verified with Chromium, TypeScript, ESLint, 104 unit tests and a production Next.js build.

## Executive summary

The home page has a clear proposition, strong product imagery, good crawlable content, a valid heading hierarchy, a canonical URL, FAQ/product structured data, and no horizontal overflow in the tested viewports. Its main weakness is not lack of content but lack of prioritisation: 12 product cards, repeated CTAs and repeated card patterns make the page unusually long, especially on mobile. Trust evidence is thin for a sensitive, high-consideration purchase.

Scores (directional, not automated Lighthouse scores):

- UX and conversion: **6.5/10**
- SEO foundations: **7.5/10**
- Visual consistency: **7/10**
- Accessibility: **5/10**

## Priority findings

### P0 — accessibility blockers

1. **Keyboard focus is removed globally without a global replacement.** `styles/globals.css:62-66` sets `outline: none` for every button, link and `[role="button"]`. Only a small subset of controls defines `focus-visible`, so most navigation, CTAs, FAQ summaries and footer links have no visible keyboard focus. Remove this rule or add a consistent global `:focus-visible` treatment.

2. **The page has no `<main>` landmark and no skip link.** `components/app-shell/MainContent.tsx:39-54` renders a `<div>`, and the browser check found 0 main landmarks and no `#main-content` skip link. Render `<main id="main-content">` for content routes and provide a visible-on-focus skip link in the root layout.

3. **Dialogs do not manage focus.** The mobile menu (`app/_ui/HomeSplash.tsx:423-490`) and hash modal (`app/_ui/HomeSplash.tsx:1018-1081`) expose `role="dialog"`, but do not move focus into the dialog, trap it, mark the background inert, or restore focus to the trigger. The modal also does not lock document scroll. Use a tested dialog primitive or implement the full focus lifecycle.

### P1 — highest UX/conversion impact

4. **Mobile decision cost is too high.** All 12 products render as full cards (`app/_ui/HomeSplash.tsx:702-747`). At 390 px this creates a very long catalogue before the process, FAQ and support content. Show 4–6 popular categories on Home, then link to the full catalogue; consider category tabs only if they materially reduce choices.

5. **The page repeats the same two actions too often.** “Design…”, “Browse Designs” and equivalent CTAs appear in the header, hero, experience section, every product card, product-grid footer, process section and final CTA. Keep one primary action (“Start designing”) and one discovery action (“Browse memorials”), then vary downstream CTAs only when their destination is genuinely different.

6. **Trust proof is too weak for the purchase context.** The strongest proof is “since 2005” (`app/_ui/HomeSplash.tsx:623-624`, `916-918`). Add verifiable customer reviews, completed memorial examples, manufacturing/shipping coverage, warranty/material durability, cemetery-approval guidance and clear support expectations. Place concise proof immediately below the hero CTA, not only near the footer.

7. **Several footer links behave unlike links.** `app/_ui/HomeSplash.tsx:952-955` and `992-996` use hash URLs but intercept navigation to open modal content. “FAQ” does not scroll to the existing FAQ section, and “Privacy Policy” ignores the real `/privacy` page. This weakens user expectations, browser history/deep linking and crawlable legal/help destinations. Use real URLs for documents and ordinary anchors for page sections; use buttons only when the action truly opens a dialog.

8. **The responsive header changes abruptly at `xl`.** Desktop gets category navigation plus search and Browse Designs, while all smaller widths get only a menu icon (`app/_ui/HomeSplash.tsx:379-419`). Retain one visible primary CTA at tablet widths so the main task remains obvious without opening a drawer.

### P1 — SEO and sharing

9. **Social cards request a large image but provide none.** The rendered page contains `twitter:card=summary_large_image`, but no `twitter:image` or `og:image`. The page-level `openGraph` object in `app/page.tsx:13-20` replaces the root Open Graph object rather than inheriting its image. Add a branded, outcome-led 1200×630 image to both Open Graph and Twitter metadata.

10. **Hard-coded commercial data can become misleading.** Prices, offer counts, availability and USD currency are embedded in JSON-LD (`app/page.tsx:56-175`) while the business targets Australia, North America and Europe. Generate offer data from the same current source used by the catalogue, or omit volatile fields. Validate the resulting graph in Schema.org and Google Rich Results tools after deployment.

11. **The title is keyword-complete but long.** `app/page.tsx:6-9` is likely to truncate in many result layouts. Test a tighter title such as “Custom Headstones & Memorial Plaques | Forever Shining”; preserve “monuments” in the H1 and description.

12. **FAQ schema is valid but unlikely to earn a Google FAQ rich result.** Keep it for semantic clarity, but do not treat it as a SERP-feature strategy. The visible FAQ and JSON-LD correctly share the same source (`homeFaqItems`), which is a good implementation detail.

### P2 — design consistency and polish

13. **The typography token is applied inconsistently.** The H1 uses the configured Playfair family (`app/_ui/HomeSplash.tsx:511`), while most display headings use generic `font-serif` (`620`, `693`, `772`, `838`, `882`). Point `font-serif` to Playfair or use one explicit display token throughout.

14. **The cream process section is visually isolated.** `app/_ui/HomeSplash.tsx:765-824` switches from the dark blue/black/gold system to a light editorial block and immediately returns to black. The contrast can be useful, but it currently reads as a separate template. Either repeat the light surface elsewhere as a deliberate rhythm or keep the process section within the established dark material palette.

15. **Cards use generic motion and the motion policy is incomplete.** Product cards and the 3D preview use hover translation/scaling (`app/_ui/HomeSplash.tsx:661-670`, `706-715`) with `transition-all` in places (`615`, `706`) and no reduced-motion variant. Transition named properties only and disable non-essential transforms under `prefers-reduced-motion`.

16. **Theme controls are duplicated.** The root always renders `ThemeToggle` (`app/layout.tsx:148`), while Home adds another mobile-only theme button inside the second section (`app/_ui/HomeSplash.tsx:606-618`). Keep one predictable global location.

17. **The hero background is not handled by the image pipeline.** It is a CSS background (`app/_ui/HomeSplash.tsx:493-503`), so it misses responsive source selection and Next image optimisation. The source asset is about 255 KB. Consider an absolutely positioned `Image` with `fill`, `priority`, responsive `sizes` and an art-directed mobile crop.

18. **Global H1 styling leaks across the project.** `styles/globals.css:342-345` adds 40 px vertical padding to every H1, while Home overrides it with `!mb-0 !pb-0`. Replace the global element rule with route/component typography tokens to avoid specificity workarounds and inconsistent rhythm.

## What already works

- One descriptive H1 with a logical H2/H3 hierarchy.
- Clear value proposition and primary action above the fold.
- Useful product-specific copy rather than generic marketing filler.
- Canonical URL, indexable robots policy and sitemap coverage.
- Visible FAQ content and matching JSON-LD source.
- All rendered images had alt text; icon-only controls had accessible names.
- No horizontal overflow or console errors at 390 px and 1440 px.
- Image components below the fold use responsive `sizes` and lazy loading by default.
- Touch targets are generally close to or above 44 px.

## Recommended sequence

1. Restore focus visibility, add `<main>`/skip link, and replace custom dialog behaviour with an accessible primitive.
2. Reduce Home to 4–6 category/product entry points and consolidate CTA language.
3. Add credible trust proof directly after the hero.
4. Fix footer destinations and add complete social-share metadata.
5. Consolidate typography/theme tokens and reduced-motion behaviour.
6. Measure production LCP, INP and CLS after the structural changes; the development server is not suitable for performance scoring.

## Acceptance checks

- Every interactive element has a visible keyboard focus indicator.
- Tab focus cannot escape an open menu/dialog and returns to its trigger on close.
- Home exposes exactly one `<main>` landmark and a working skip link.
- At 390 px, key proof and process content appear without traversing 12 full product cards.
- Privacy, terms, FAQ and sitemap destinations are deep-linkable and work without JavaScript.
- `og:image` and `twitter:image` render as absolute production URLs.
- A production Lighthouse run is performed on mobile, with Core Web Vitals verified from field data when available.
