# Current product backlog

This is the active backlog. Historical status notes remain in `STARTER.md`,
but unfinished items there are not automatically current requirements.

Last reviewed: 2026-10-16

## Now — UI foundation

- [x] Introduce semantic designer day/night colour tokens.
- [x] Add shared selected/idle designer tab and option controls.
- [x] Cover the mobile Select Size panel with day/night contrast checks.
- [x] Add an unauthenticated designer UI smoke job to CI.
- [x] Pin Node 22 and pnpm 9.6.0 across local metadata and CI.
- [x] Migrate recurring compact designer controls to shared primitives.
- [x] Add visual coverage for Inscriptions, Images, Check Price, and Checkout.
- [x] Add automated accessibility checks for the guided designer flow.

## Next — conversion path

- [x] Calculate uploaded-image pricing from trusted server rules.
- [x] Continue checkout inline when an account already exists.
- [x] Replace generic navigation labels with contextual step names.
- [x] Preserve an automatic local draft and warn before losing changes.
- [x] Clarify estimated versus confirmed pricing throughout checkout.

## Now — architecture and performance

- [x] Split `DesignerNav.tsx` by panel and domain responsibility. The parent now composes navigation hooks and views; route state, panel synchronization, save/purchase workflow, product capabilities, canvas visibility, quick navigation, menu actions, grouped menu rendering, base selectors, workflow modals, and fullscreen/mobile navigation are separated into focused hooks and components. Product-dependent visibility and labels plus guided-navigation and expandable-menu rules live in navigation configuration. The menu retains its natural composition responsibilities, including placing the inline Select Size panel within its section.
- [x] Split the Zustand store into product, content, scene, UI, and pricing domains. Pricing, general UI, catalog-option, monument-configuration, product-appearance, project metadata, async product-selection, image-editing, inscription, motif, emblem, scene, addition, and reset slices are extracted. Color and catalog normalization, product configuration and dimension derivation, material-option loading, and editing-object visibility fallback are shared helpers. Product selection remains the async orchestration boundary; root composition stays in the root store.
- [x] Centralize Check Price calculations for the quote panel, saved-design estimates, server-confirmed checkout quotes, and email/PDF breakdown formatting.
- [x] Keep estimate/confirmed authority visible throughout presentation flows. Shared quote display, saved-design pages, PDFs, and saved-design emails explicitly label estimates; order invoice emails and confirmed quote formatting identify server-confirmed order pricing. The Check Price page summary, navigation headers, 3D product-price label, and motif/inscription editor previews use shared Check Price calculations; the additions selector is selection-only and shows no price.
- [x] Move generated saved-design records out of the TypeScript source into JSON; keep TypeScript types and query helpers in the module.
- [x] Separate static homepage sections from interactive client islands. The page is a server composition; product catalog, process overview, FAQ, support CTA, and footer are server components, while the hero menu, review carousel, and tutorial chapter controls are isolated client components.

## Operational follow-ups

- [x] Implement and deploy Content Security Policy in Report-Only mode first. Production headers now include the policy and Reporting API endpoint; review violation reports in production logs before narrowing or enforcing the policy.
- [x] Report browser WebGL availability and context loss/restoration to bounded runtime logs through `/api/client-webgl-report`; telemetry contains only an allowlisted event name and no page URL or customer data.
- [ ] Complete legal review of Terms & Conditions. Pre-review questions and official Australian-law references are in [terms-review-prep.md](../legal/terms-review-prep.md); legal counsel review and approval remain outstanding.
- [ ] Consolidate customer-facing email domains after mailbox verification. [The inventory](../operations/email-domain-inventory.md) now includes a public DNS spot-check; ownership, SMTP authorization, DKIM setup, and inbox receipt still need confirmation from the business/mail administrators.
- [x] Select Sentry and configure application error capture, tracing, checkout/WebGL reporting, and high-priority issue notifications. The local end-to-end event was confirmed and the temporary verification issue was resolved. `next.config.ts` uses a full Git SHA release name and records Vercel production deploy metadata. Release `c7cc87a72bdf6338db9bad7ee285871b996cb539` has a production deploy and ten associated commits; Vercel logs confirm Node.js, Edge, and Client source map uploads. Production-event symbolication and event privacy still need verification. Enable IP-address storage prevention in Sentry and keep the source-map auth token in Vercel.
