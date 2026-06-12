---
name: implementation-with-traces
description: >
  Implement an agreed input while keeping a dated implementation trace. Use when
  implementing a spec, contract, design, plan, or issue and the user wants notes
  about decisions, deviations, tradeoffs, conflicts, or open questions.
---

# Implementation With Traces

## Workflow

1. Identify the input and nearby context before editing.
2. Create or update `docs/traces/implementations/YYYY-MM-DD-slug.md`.
3. Use the user's preferred language for the trace file; if unspecified, use the conversation language.
4. Append a trace entry whenever a meaningful decision, interpretation, deviation, tradeoff, conflict, or open question appears.
5. Keep implementation changes in their normal locations. The trace records reasoning; it is not the authoritative artifact.

## Trace Format

```md
# Implementation Trace: <Scope>

Date: YYYY-MM-DD
Source: <input path, issue, or user request>
Language: <user preferred language>

## Entries

### 1. <Short Title>

Type: decision | interpretation | deviation | tradeoff | CONFLICT | open-question

Context:
<What was unclear, constrained, conflicting, or discovered.>

Decision:
<What was decided or done. For CONFLICT, state the final decision or Pending.>

Reason:
<Why this was chosen. Include alternatives only when useful.>

Follow-up:
<Question, confirmation needed, or None.>
```

If there are no entries yet, write `None yet.` under `Entries`.

## Rules

- Keep entries append-only and ordered by discovery. Modify an existing entry only to fix a factual error, update a pending decision, or add a small clarification.
- For `CONFLICT`, name the conflicting inputs or constraints in `Context`, then record the final decision in `Decision`.
- If a question blocks implementation, ask the user. Otherwise append an `open-question` entry and continue with the conservative interpretation.
