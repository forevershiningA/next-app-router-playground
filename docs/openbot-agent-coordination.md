# OpenBot: test of agent-to-agent coordination

This test is run inside OpenBot. It does not connect the separate Codex session
to OpenBot, and it has not yet been performed. OpenBot's agent tools can differ
between installed versions: discover their current schemas before using them.

Use an existing OpenBot agent as coordinator and the existing `Forever MCP —
test tymczasowy` agent as the worker. The worker needs Forever MCP and the
`forever-reference-design` skill enabled. Keep the local designer and its pilot
Chrome window running. Do not edit the `original` session or save a design in
this first communication test.

Send the following to the coordinator in OpenBot:

> Use OpenBot's `list_agents` to find `Forever MCP — test tymczasowy`. Send
> that agent one message using `send_message`. Ask it to report its agent name,
> whether `forever-reference-design` is available, whether the Forever MCP
> tools are available, and the current revision of the `original` designer
> session. This is a read-only communication test: do not edit or save any
> design. Ask it to reply to you using OpenBot's normal agent reply mechanism.
> Once the response arrives, relay its contents to me and say explicitly which
> facts you verified yourself. If the recipient or tools are unavailable, report
> the exact failure; do not create another agent or change OpenBot settings.

Confirm in OpenBot that the worker received the request and returned its reply
to the coordinator. The test passes only when the coordinator reports the
worker's actual response and no design changes occur. If the coordinator cannot
receive a reply automatically, record what happened; do not assume a wait or
polling tool is available. This first test does not establish that Codex can
directly send messages to, or read messages from, OpenBot.

Upstream documentation: https://github.com/nightly-labs/openbot/blob/main/docs/architecture/providers.md
