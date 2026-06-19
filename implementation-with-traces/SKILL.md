---
name: implementation-with-traces
description: >
  Trace implementation decisions left unresolved by an agreed spec, plan,
  contract, design, or issue. Use during implementation when the source is
  silent, ambiguous, conflicting, or a discovered constraint forces the agent to
  choose beyond the source; do not use for requirements, steps, or decisions
  already stated by the source.
---

# Implementation With Traces

This skill records unresolved implementation decisions: choices the agent must
make because the source did not state, settle, or make them actionable. The
source remains authoritative; the trace only records how execution resolved
those choices.

## Workflow

1. Identify the source input and the current execution point.
2. Classify the choice before tracing:
   - Trace an unresolved implementation decision when the source is silent, ambiguous, conflicting, or a discovered constraint forces an unstated choice.
   - Do not trace direct execution of explicit source requirements, decisions, or steps.
   - Do not trace routine choices fully determined by repo conventions unless they materially affect behavior, interfaces, data, UX, security, tests, or delivery.
3. Create or update `docs/traces/implementations/YYYY-MM-DD-slug.md` only when the first unresolved implementation decision appears.
4. Use the user's preferred language for the trace file; if unspecified, use the conversation language.
5. Append a trace entry before or immediately after making the unresolved implementation decision.
6. Keep implementation changes in their normal locations. The trace records reasoning; it is not the authoritative artifact.

## Trace Format

```md
# Implementation Trace: <Scope>

Date: YYYY-MM-DD
Source: <input path, issue, or user request>
Language: <user preferred language>

## Entries

### 1. <Short Title>

Type: unresolved-implementation-decision | interpretation | deviation | tradeoff | CONFLICT | open-question

Context:
<What the source left silent or ambiguous, which inputs conflicted, or what discovered constraint created the gap.>

Decision:
<What was decided or done to resolve the implementation choice. For CONFLICT, state the final decision or Pending.>

Reason:
<Why this resolves the choice. Include alternatives only when useful.>

Follow-up:
<Question, confirmation needed, or None.>
```

## Rules

- Do not create a trace file just because implementation starts. If no unresolved implementation decision appears, no trace file is needed.
- Do not record requirements, steps, or decisions already present in the source. Cite them only as context for an unresolved implementation decision.
- Keep entries append-only and ordered by discovery. Modify an existing entry only to fix a factual error, update a pending decision, or add a small clarification.
- For `CONFLICT`, name the conflicting inputs or constraints in `Context`, then record the final decision in `Decision`.
- If a question blocks implementation, ask the user. Otherwise append an `open-question` entry and continue with the conservative interpretation.
