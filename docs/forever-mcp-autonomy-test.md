# Forever MCP: autonomy test

## Purpose

Compare completion of the same local design task in the existing long OpenBot
conversation and a fresh conversation. The earlier Jan Wiśniewski run required
one follow-up after the agent had created a session, chosen a shape and selected
a material. The logs showed no tool error; the cause of the early stop is not
known. A fresh conversation tests whether conversation context affects the
outcome, but one run cannot establish causation.

## Setup

Keep the local designer and Forever MCP running. Start a fresh OpenBot
conversation with the same agent, provider, model and skill. A new provider
connection may not retain temporary session IDs; do not rely on any previous
temporary session. Keep the existing `original` project unchanged. This test
authorizes one new local export; it does not authorize a cloud save or email.

## User prompt

> Odczytaj skill `forever-reference-design`. W nowej, niezależnej sesji
> zaprojektuj pionowy nagrobek z ciemnego granitu i prostą górą. Umieść napis
> „Jan Wiśniewski / 1938–2019” oraz niewielki krzyż. Na przedniej ścianie
> podstawy dodaj „POZOSTANIESZ W NASZYCH SERCACH”. Obejrzyj podgląd, popraw
> widoczne problemy i zapisz projekt lokalnie. Pokaż końcowy obraz i ścieżki
> do plików. Nie zmieniaj sesji `original`.

## Record the outcome

Record whether the agent completes all requested steps in one response or
needs follow-up, and any actual tool error. Inspect the final image for text,
placement, surface and motif; check that the reported local JSON/JPG exist and
belong to the same revision. Compare the original session's revision before and
after the test. A valid completion requires all of these checks; tool-ready
flags and the agent's description alone do not prove the visual result.

## Observed follow-up

On 2026-11-01 the agent completed the full task in one turn and saved a valid
local export. The visible result matches the requested elements. However, its
tool calls were recorded in the same provider rollout as the earlier attempt,
and it had access to the previous task history. This verifies one-turn
completion after a similar earlier run, not an independent fresh-context test;
the reason for the earlier stop remains unknown.

A genuinely new OpenBot agent and provider rollout completed the Jan
Wiśniewski task in one turn, and its local JSON/JPG passed integrity checks.
However, the saved image shows only a tiny fragment of the requested cross at
the bottom edge behind the base, despite the agent reporting success. The new
thread therefore passed the one-turn completion check but failed the visual
acceptance check. One run does not determine the cause or general reliability.

Another, different two-person task in the same provider rollout stopped after
the skill read and eight successful Forever calls, with no recorded tool error;
its follow-up completed after further calls. This rules out a simple universal
three-call limit, but does not establish why the agent stopped. Repeated prompts
in this rollout are not independent fresh-context trials. To compare context,
verify that a genuinely new provider thread/rollout was created before treating
the next run as a fresh-context trial. Preserve the same model, skill and task,
and compare both the number of turns and the actual visual output.
