# Anonymous designs through external MCP clients

Status: proposed; not implemented or deployed. The current Preview is an
admin-only browser/CDP prototype and does not satisfy this workflow.

## User experience

The customer tells an external MCP-capable assistant what memorial they want,
optionally attaching a reference photo in that assistant. The assistant uses
the tools to create a guest draft, discover supported catalog choices, edit the
design, retrieve a preview, and save a draft. The customer receives a private
link to reopen and edit it without creating an account. The external assistant
interprets the prompt or photo; this application does not provide the model.
An assistant's ability to understand an attached image depends on that client
and model. Image-based designs approximate available catalog options and must
not invent inscriptions or claim an exact physical match.

## Required architecture

- Expose a remote MCP endpoint over HTTPS using Streamable HTTP. Keep MCP
  transport state independent of application design state so serverless
  requests may run on different instances. Negotiate protocol versions actually
  supported by the installed SDK and target clients.
- Create an anonymous project and issue a cryptographically random capability
  scoped to that project. A capability is authorization without a login; it is
  secret and must not appear in logs, analytics or third-party referrers.
  Store only a hash, limit its scope and lifetime, allow revocation, and issue a
  recoverable private link for the customer. Evaluate each target MCP client's
  support for authentication and tool arguments; use standard OAuth where the
  client requires it, without implying that OAuth must mean a user account.
- Persist drafts and revisions in shared durable storage. Existing `projects`
  require an account ID, and `/api/projects` rejects requests without a
  session; do not create a fake account or reuse the authenticated save route.
  Add a guest ownership model and schema migration, with explicit ownership
  checks on every read, mutation and preview. Define retention and a cleanup
  strategy before deploying guest persistence.
- Make the existing validated design operations reusable by the remote server.
  The current `window.__designerAgentBridge` invokes a browser-local Zustand
  store, and `scripts/designer-mcp.mjs` depends on a local CDP connection; neither
  is a remote execution service. Either extract the mutation/validation layer
  into a shared server-safe domain layer, or run isolated per-project browser
  workers with a reliable queue. Preview capture additionally needs a real 3D
  renderer and asset-readiness acknowledgement. Choose and test the execution
  model explicitly; do not expose CDP or the window bridge publicly.
- Apply revisions atomically and reject stale writes, including concurrent
  clients and retries across server instances. Persist idempotency for save;
  reject reusing a key for different input. Keep quote amounts labeled as
  estimates until a market-aware quote contract exists.
- Protect guest creation, file uploads and MCP calls against abuse with bounded
  input and upload sizes, rate limits, expiration and operational monitoring.
  Avoid triggering the existing account email workflow for anonymous saves.
- Define how a reference photo is handled: image analysis stays in the external
  client unless it explicitly uploads an image for use in the design. Return
  concrete catalog options and coordinate spaces to the assistant. Do not
  assume all MCP clients support image inputs, remote auth or every transport;
  test the target clients explicitly.

## Initial tool contract

| Operation | Purpose |
| --- | --- |
| `create_guest_design` | Create a project and return a scoped capability and expiry. |
| `get_design` | Return the project, capabilities and current revision. |
| Catalog discovery | List products, shapes, materials, motifs, additions and constraints. |
| Existing design mutations | Apply supported product and element changes with an expected revision. |
| `get_preview` | Return an image for a verified revision or a clear not-ready error. |
| `save_guest_design` | Persist the revision idempotently and provide a private reopen link. |

Names and authentication mechanism are provisional until tested with the
chosen external MCP clients. The private reopen link and the editing capability
must not be treated as public sharing links. Link delivery, guest recovery,
retention duration and handling lost links require product decisions.

## Acceptance checks

An external MCP client can create a draft, choose a product and material,
add inscriptions and motifs, obtain a matching preview, save and reopen it
without a user account. An image-capable client can use a reference photo to
select supported options, with limitations made clear. A second guest cannot
read or change the first guest's draft; invalid/expired capabilities, stale
revisions, duplicate saves, concurrent edits and failed asset loads have
explicit results. Test the real transport, renderer and durable storage with
separate sessions before exposing it to visitors.

References: [MCP TypeScript SDK server guidance](https://ts.sdk.modelcontextprotocol.io/server)
and [MCP transport specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports).
