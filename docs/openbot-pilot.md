# OpenBot: local, no-account pilot

This is a personal test of the existing designer tools, not the planned public
remote MCP service. OpenBot, the MCP server, the designer and a dedicated Chrome
window must run on the same Windows computer. The customer-facing anonymous
project and private-link workflow are not implemented.

## Start the designer

From PowerShell in this repository, run:

```powershell
pwsh -NoProfile -File .\scripts\start-openbot-pilot.ps1
```

The script starts a local development server at `127.0.0.1:3104` and opens a
visible Chrome window using a separate profile with a loopback-only debugging
port at `127.0.0.1:9222`. It refuses to start if either port is already in use.
Keep the Chrome window open with exactly one designer tab. No sign-in to the
designer is required. The script prints the local server process ID; close the
pilot Chrome window and stop that process when finished. Its logs and Chrome
profile are under `%TEMP%\forevershining-openbot-pilot`, outside the project so
their updates do not repeatedly trigger the development server's file watcher.
First startup can take several minutes while Next.js compiles the designer.

The development server uses a separate Next.js output directory and may update
the generated `next-env.d.ts` reference while it runs.

## Connect OpenBot

On the same computer, add a custom **stdio / command** MCP server in OpenBot
(Marketplace → Apps → Add custom, or Server settings → MCP on older releases).
Use these values, with each argument and environment variable entered in its
own field if the interface asks for that:

- Name: `memorial-designer-local`
- Command: `C:\Program Files\nodejs\node.exe`
- Argument: `C:\Users\polcr\documents\github\next-app-router-playground\scripts\designer-mcp.mjs`
- Environment: `DESIGNER_MCP_CDP_URL` = `http://127.0.0.1:9222`
- Environment: `DESIGNER_MCP_DISABLE_UPLOADS` = `1`

Enter the variable name and value separately. The name must not include `=1`;
do not add `DESIGNER_MCP_DISABLE_UPLOADS=1` to an environment passthrough list.
Uploads are disabled by default; explicitly setting the variable to `0` enables
them and may send images to the existing remote image storage.

Enable the server for the intended OpenBot agent and test the connection. If the
agent uses a remote OpenBot host rather than this computer, its `localhost` is a
different machine and this setup will not connect. Never expose the debugging
port to the internet or use a regular personal browser profile for this pilot.
If the server is enabled but the current conversation cannot see its tools,
verify the designer and debugging port are running, use OpenBot's connection
test, and start a new conversation so the provider receives the current tool
list. The MCP process advertises its tools before connecting to Chrome; it
connects on the first operation that needs the designer. A missing debugging
port produces `SESSION_UNAVAILABLE`, and a later call can reconnect once Chrome
is running without restarting that MCP process.

A successful connection test only confirms that OpenBot can start the server
and list its tools; it does not establish that Chrome or the designer is ready.
Call `get_design` to verify the actual designer connection. If agent tool search returns only `openbot.*` results, the
Forever tools have not been made discoverable in that provider session; another
turn alone is not a confirmed fix. Check provider logs and test a new session.

If `get_preview` returns an image but no `previewId`, the conversation is using
an older server process. Fully restart OpenBot (not only the conversation), then
reconnect Forever and obtain a new preview; a preview token belongs to the MCP
process that produced it and cannot survive a restart.

## Try a design

The local `forever-reference-design` skill in this repository documents how to
compare a reference image, inspect the actual MCP preview and save a reviewed
revision. Install it in the OpenBot agent's `.agents/skills` directory and
start a new agent session for discovery. It guides the agent; it cannot prove
visual accuracy or replace the user's requested review.

Give the agent a description or attach a reference photo and use a model that
can interpret images. For example:

> Zaprojektuj prosty nagrobek z ciemnego granitu, z zaokrągloną górą,
> napisem „Anna Kowalska 1940–2020” i niewielkim motywem róży. Pokaż podgląd,
> a następnie użyj `save_local_design`, żeby zapisać projekt lokalnie.

The agent should read the current revision, discover available catalog options,
apply supported edits, request the preview, then call `save_local_design` with
the latest revision, passing the `previewId` from the visually reviewed image
and `visuallyReviewed: true` only when it meets the user's requirements. The
server saves the exact preview image; a design change, MCP reconnect or 15-minute
expiry requires a fresh preview. The flag records the agent's assertion and
cannot prove that the agent actually assessed the image. It should describe approximations where the catalog cannot
match the request. Reference-photo interpretation happens in OpenBot's chosen
model; its provider's image handling applies. The pilot disables MCP image
uploads to the site's remote image storage. It therefore tests designing *from*
a photo, not embedding the photo itself into the memorial.

New inscriptions on a base use `coordinateSpace: "mm-center"`: `(0, 0)` is
the centre of the base's front face and coordinates are in millimetres. Older
base inscriptions retain their existing coordinate convention; inspect them
before editing, and replace a legacy line if it renders on the top edge instead
of the front face. Preview readiness checks loaded glyphs, not legibility or
whether they are within the surface.

For this local pilot, `expectedRevision: "latest"` lets the server read the
current revision immediately before an edit or export. It still rejects changes
made during the operation, but does not detect changes since an earlier agent
read; use the exact revision when that stronger check matters. This shortcut is
not available on a live designer. Reconnect the MCP server in OpenBot after
updating its script so the new tool schemas are loaded.

The save tool writes a JSON snapshot and a JPEG under
`output/mcp-local-drafts/` and returns their paths. These files may contain
personal information and are excluded from Git and Vercel. They are local test
exports, not account projects or shareable URLs. `open_local_design` accepts an
export UUID (not an arbitrary path), validates the file and opens it in a new
isolated local browser session. `create_local_session` starts a separate blank
session for a product; `list_local_sessions` and `select_local_session` select
which session subsequent tools operate on. Select `original` to return to the
previous designer tab. `close_local_session` explicitly discards the temporary
session. Session IDs are scoped to the current MCP process and are not
persistent; save your work before reconnecting.

Inscription rendering historically depended on transient positioning state not
stored in older exports. New exports include rendered positions. For older
exports, import compares two possible layouts against the saved JPEG and reports
`legacyLayoutCompared` with a warning; the agent must visually verify the result.
Coordinates may be normalized, producing a different revision even when the
picture matches. If the reference image or layout data is insufficient, import
can fail rather than silently claim success.

Existing `save_design` still requires an account and
can trigger the existing email flow, so use `save_local_design` for this pilot.
The current estimate is not a confirmed quote. Preview readiness covers the
checked inscriptions, images, motifs, additions and emblems. For the traditional
engraved headstone (product `124`), it also checks that the selected shape and
headstone texture are mounted and loaded, and that the visible base uses a
loaded texture. `shapeReady`, `headstoneMaterialReady`, and `baseReady` report
these checks; `baseReady: "not_applicable"` means there is no base. For other
products these three flags are `"unverified"`. `otherAssetsReady` remains
`"unverified"` for all products: the checks do not cover every asset, dimension,
scene element or visual placement, so a person or agent must still inspect the image.

For product `124`, `get_preview` additionally returns `motifLayout`: the IDs
checked, IDs not checked, and warnings when the rectangular bounds of a
headstone motif extend outside or approach the stone's rectangular bounds, or
may be covered by the base from the front view. This is advisory: it does not
block saving and cannot verify the exact curved silhouette, transparent padding,
text, overlap, contrast, or actual legibility. Other products and motifs on
other surfaces remain unchecked. The assessment is returned with local saves
and stored in new export JSON files.
