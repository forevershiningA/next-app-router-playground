# Designer personalization and agent access

## Local changes — 2026-10-27

The inscription editor lists every inscription by text and target surface, with
an accessible button and pressed state. Selection uses the existing store action
and existing canvas selection outline. Desktop and mobile use the same list.

Saving now mounts the scene when necessary (including Check Price), waits for a
stable serialized design and processed inscription glyphs, and renders a fresh
frame. Readiness checks text, size, alignment and requested font against Troika's
processed parameters. Missing or removed inscription meshes block capture.
Blank frames are retried within a 15-second deadline to allow initial camera fit.
The final snapshot and estimated pricing are collected together; a subsequent
snapshot change aborts the save. Renderer failures no longer fall back to an
unverified canvas in this save path. Screenshot mode is restored on failure.
Inscription selection handles are excluded from the capture. Save errors appear
in the modal, including errors encountered while proceeding to purchase.

Validation includes unit cases for stale KLEIN glyphs with ALEX MORGAN props,
missing/deleted text, pending fonts, stable-state capture and timeout cleanup.
Browser coverage selects two inscriptions independently at 1440px and 390px and
captures a personalized project from Check Price. Its POST is intercepted and
rejected intentionally: no account project or email is created by this test.
The image evidence is `output/personalized-saved-preview.jpg`.

These tests reproduce the underlying stale-glyph and missing-renderer conditions,
not the original production session. They do not establish why that user's
EUR/USD figures differed. Readiness does not yet provide revision acknowledgements
for every asynchronous image, motif or material loader.

## Local MCP prototype — 2026-10-27

### Opt-in live-site test

The same local stdio server can be used against one administrator's browser
tab on a deployed HTTPS site. This is not a remotely hosted MCP endpoint: the
MCP client, server process and CDP browser must run on the tester's computer.

1. Build the test deployment with `NEXT_PUBLIC_DESIGNER_MCP_LIVE_TEST=1`.
   The flag is embedded at build time and must also be available to the server.
   Leave it unset for normal deployments. The production bridge is installed
   only after `/api/admin/designer-mcp` verifies a signed-in admin session.
2. Launch a dedicated Chromium profile with remote debugging bound to loopback
   (for example `--remote-debugging-address=127.0.0.1`,
   `--remote-debugging-port=9222`, and a dedicated `--user-data-dir`). Do not
   expose the debugging port. Sign in as an administrator and open a designer
   page in exactly one tab.
3. Set `DESIGNER_MCP_LIVE_ORIGIN` to the exact HTTPS origin without a trailing
   slash, and `DESIGNER_MCP_PAGE_URL` to the exact current URL of that tab.
   Launch `pnpm mcp:designer` from this repository using an MCP client. The
   first matching tab is pinned for subsequent navigation within that origin;
   the admin session is rechecked on each tool call. Restarting the server
   requires setting the URL to the tab's current URL.
4. For a read-only smoke test call `get_design`, then `get_product_configuration`
   and `get_preview` with the returned revision. Mutations change the open
   design. `save_design` uses the live signed-in account and can create a real
   project and trigger the existing email workflow.

Disabling the flag requires a new deployment, and closing or reloading the test
tab removes its installed bridge. Browser CDP access gives full control over
the browser profile, so this is suitable for a controlled test only. A public
remote MCP service would require a separate authenticated transport and session
binding; this setup does not provide one.

`pnpm exec playwright test --config playwright.mcp-live.config.mjs` exercises
the HTTPS origin, pinned-tab navigation and reauthorization using an intercepted
test page. It does not replace testing the deployed site or production build.

`scripts/designer-mcp.mjs` provides a local stdio MCP server using the official
TypeScript SDK (v1, protocol support through 2025-11-25). It connects over CDP
to exactly one existing designer tab. The page exposes a narrow bridge in
development and, only when explicitly enabled and authorized, for a production
administrator's test tab. This is a local adapter, not a hosted MCP endpoint or
an authentication mechanism for remote clients.

Run the development app (`pnpm dev`), start a separate Chrome/Chromium profile
with `--remote-debugging-port=9222 --user-data-dir=<dedicated-profile>`, and open
the local designer in that browser. Configure an MCP client to launch
`node scripts/designer-mcp.mjs` with this repository as its working directory.
Set `DESIGNER_MCP_CDP_URL` to another localhost HTTP debugging endpoint when
needed. If more than one local designer tab is open, select one using its exact
URL in `DESIGNER_MCP_PAGE_URL`; identical URLs remain ambiguous and are rejected.
Keep the debugging endpoint bound to loopback and use a dedicated browser
profile: anyone with access to that port can control the browser.

- `get_design`: design snapshot, selected inscription, existing AUD estimate,
  and a SHA-256 revision of the serialized snapshot.
- `list_products` and `select_product`: catalog of product identities and
  navigation to a selected product. Selection returns `pending`; poll
  `get_design` for the requested product and `productConfigurationReady` before
  changing its configuration. `catalogLoaded` only confirms the XML is present.
- `get_product_configuration`, `set_shape`, `set_material` and `set_dimensions`:
  list and apply built-in shapes, materials, and headstone dimensions for
  products `1`, `4`, `5`, `8`, `9`, `22`, `23`, `32`, `34`, `52`, `100`, `101`, `103`,
  `124`, `135`, and `2350`.
  Bronze plaque shapes use the same border rule as the editor; mini headstones
  expose traditional shapes; full monuments expose material targets for the
  ledger and kerbset where present. Other products return `UNSUPPORTED_PRODUCT`
  until their special rules are implemented. Urn and pet-rock shapes use their
  own catalog size constraints. Full-colour plaques use `set_fixed_size` with
  an orientation, and stainless plaques offer brushed and polished finishes.
  Backgrounds and fixed sizes may be empty when catalog APIs are unavailable.
  Material selection preloads the texture and rechecks revision and available
  options before applying it.
  Dimension values outside the reported limits are rejected; changing width
  may also affect the base.
- `get_product_configuration` also returns current assembly options and their
  product-level availability. `set_assembly_options` changes base visibility,
  full-monument ledger/kerbset visibility, base finish, flower-pot selection and
  flower-pot lid finish. Unsupported combinations return `OPTION_UNAVAILABLE`;
  lid finish can only change while flower pots are selected. Changes require
  the current design revision.
  Stainless headstones expose `stainlessBaseStyle` (`none`, `stainless`, or
  `granite`); material selection applies only to a visible granite base.
- `set_dimensions` additionally accepts `thicknessMm` for headstones and
  reports its limits/current value/style under
  `componentDimensions.headstoneThickness`. `set_component_dimensions` changes
  width, height and/or depth for a visible base, ledger or kerbset. The
  configuration response includes each component's availability and limits.
  Existing store actions synchronize linked monument dimensions (for example,
  ledger width updates base and kerbset width); responses contain the full
  resulting snapshot. Kerb height is coupled to base height and may resolve to
  a lower applied value than the requested value due to the store's existing
  limits.
- `get_inscription_capabilities`: available fonts, colour availability,
  permitted size and rotation, and selected surface for new inscriptions.
- `list_inscriptions`: inscription IDs and data with the same revision.
- `add_inscription` and `delete_inscription`: create and remove individual
  inscriptions. New lines use the requested target or the selected editor
  surface and the editor's defaults.
- `update_inscription`: validated text, font, size, colour, position, rotation or
  alignment changes, requiring a matching revision. The synchronous browser
  mutation compares the complete snapshot again to detect races with the UI.
  The response contains actual applied values; rendering is pending.
- `list_additions`, `add_addition`, `update_addition` and `delete_addition`:
  discover the existing addition catalog, create/remove exact instances, and
  update position, size variant, scale and rotation. Updates
  validate instance IDs and editor control ranges and require the current
  revision. Surface is read from the instance and is not changed by update.
  `xPos`/`yPos`/`zPos` are native store offsets whose
  coordinate meaning depends on the target surface; they are not universally
  millimetres. The add action uses the editor's current/default placement
  behavior. Selected instances and offsets are returned with the design.
- `list_motif_categories` and `list_motifs` expose categories and files
  available through the current motif catalog or the editor's static category
  route. `add_motif` requires a path returned by the selected category and
  rechecks it before applying. `update_motif` supports position, height,
  rotation, scale, flips and color when the product permits it; height and
  color are checked against existing product rules. `duplicate_motif` uses the
  editor's placement rules and returns the new instance ID. `delete_motif` removes an
  exact motif instance. Position values retain their stored coordinate space;
  the MCP does not reinterpret them as millimetres or transfer an item between
  surfaces.
- `list_emblems`, `add_emblem`, `update_emblem`, `duplicate_emblem` and
  `delete_emblem` expose the fixed emblem catalog for bronze plaque product
  `5`. Mutations require the current revision and exact instance IDs. Updates
  support the catalog's seven size variants, position, rotation and horizontal
  or vertical flip. Positions retain the saved coordinate space. The model
  derives rendered width/height from the image aspect ratio after texture load,
  so those derived dimensions may update asynchronously after choosing a size.
- `list_images`, `add_image`, `replace_image`, `update_image`,
  `duplicate_image` and `delete_image` expose image catalog and instance
  operations. Upload accepts JPEG, PNG or WebP base64 up to 5 MiB and applies
  crop rectangle, scale, rotation, flips, mask and color mode in the browser,
  then uses the existing `/api/upload-image` endpoint. Image type, fixed size
  variant and flexible height are checked against the loaded catalog. Replace
  keeps the existing instance's placement and size controls while replacing its
  processed source. Mutations require the current revision; an upload followed
  by a lost response or intervening revision change can leave an unreferenced
  uploaded file. Position edits preserve the stored coordinate space.
  `move_image_to_surface` moves an image to the center of a visible target;
  moving to its existing target preserves its position. Headstone coordinates
  use `mm-center`; base and ledger retain their native coordinate spaces.
- `get_preview`: captures a JPEG for the expected revision. Inscription glyphs
  visible image and motif textures, addition models, and emblem textures are
  checked, including stale and placeholder textures. Readiness of other scene
  assets remains unverified.
- `save_design`: saves the expected snapshot and preview to the signed-in
  browser account through the existing projects API. The idempotency key is
  retained only for this MCP process; it is not durable across restarts. A
  failed request can have an unknown outcome; check the account before retrying
  with a different key. Save still uses the existing email/background workflow.

The CDP connection is local-only, not an authorization boundary. This prototype
does not expose loading or listing saved projects, independent rendering, OAuth
or order placement.
The existing estimate is AUD only and must not be presented as a confirmed quote.
The Playwright integration test exercises a real MCP client, actual browser tab,
update, conflict, nonexistent ID, image, product selection and save. The save
request is intercepted by the test and creates no project or email. It exercises
shape, material, dimensions, invalid options, unsupported products, bronze,
mini headstone, and full monument configuration discovery.

## Proposed MCP contract — future work

The existing `window.__headstoneStore` hook is development-only Playwright access,
not an MCP transport. Keep direct store access private. Extend the local bridge
into a validated command layer; both UI and tools must use the same
mutation, pricing and capture functions.

| Operation | Inputs | Result |
| --- | --- | --- |
| `get_design` | session ID | Serializable design, revision, selected inscription ID |
| `list_inscriptions` | session ID | IDs, text, font, colour, size, target surface and coordinates with their coordinate space |
| `update_inscription` | session ID, ID, expected revision, validated patch | Updated inscription and new revision; rendering pending until preview acknowledgement |
| `get_preview` | session ID, expected revision | Image and rendered revision; timeout instead of stale image |
| `get_quote` | session ID, expected revision, market/currency context | Estimated amount in minor units, currency, itemized breakdown and revision |
| `save_design` | session ID, expected revision, title, idempotency key | Authorized project ID, saved revision, preview and quote |

Unknown IDs must return `NOT_FOUND`; an outdated revision must return
`REVISION_CONFLICT`. Invalid patches return `INVALID_ARGUMENT`; renderer timeout
returns `PREVIEW_NOT_READY`. Do not silently choose the currently selected field.
Coordinates must retain the existing per-surface coordinate-space semantics;
legacy coordinates cannot all be described as millimetres.

Start with a local development session adapter to validate the entire workflow.
Public deployment additionally needs authenticated session binding and ownership
checks so a tool changes the intended user's browser/project. Merely exposing the
global store on production does not provide that. Public MCP, client configuration,
authorization and full scene revision tracking remain a separate implementation
stage. The local prototype must not be exposed as a public endpoint.
