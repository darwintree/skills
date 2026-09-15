---
name: complexity-audit
description: Audit whether code complexity is required by behavioral contracts or created by design choices. Use when the user says a change "looks too complex", "overengineered", or "too much code for a simple case"; asks for the "root complexity"; asks whether the design is wrong; or wants to know which behavioral contracts force complexity and which complexity is accidental.
---

# Complexity Audit

Use this skill for complexity-fit audits: decide whether the implementation shape is required by behavioral contracts or created by design choices.

This is not a general code-quality review. Judge whether the code is more complex than the problem requires, then name the smallest implementation shape that preserves required behavior.

Behavioral contracts are must-preserve behaviors: spec requirements, invariants, externally visible behavior, compatibility promises, security rules, transaction boundaries, or concurrency guarantees.

Separate two kinds of complexity:

- **Essential complexity**: required to satisfy behavioral contracts.
- **Incidental complexity**: created by optional boundaries, abstractions, layering, data flow, control flow, or defensive generality that the current problem does not require.

The goal is the simplest valid shape, not shorter code at any cost.

## Scope

Start with the smallest target that matches the request:

- a diff
- one file
- one function
- one feature spec plus its implementation
- one review thread about complexity

If the user references a spec, design doc, diff, or review thread, read that first. Then gather only enough surrounding context to answer:

- What is the user-facing requirement?
- What side effects does the implementation perform?
- Which behavioral contracts must hold?
- Which existing APIs, data boundaries, transactions, concurrency rules, security rules, or compatibility promises shape the code?

Treat missing context as a gap. Do not fill it with speculation.

## Audit workflow

Follow this sequence:

1. **Restate the surface problem.**
   - Describe the required behavior in one or two plain sentences.
   - Strip away implementation wording.
   - Example: "count consecutive verification failures and block later attempts."

2. **List the behavioral contracts.**
   - Include only contracts imposed by the spec, existing APIs, data model, transactionality, concurrency, security, or compatibility.
   - Name the exact rule, invariant, error behavior, flow requirement, or externally visible behavior.

3. **Trace the complexity sources.**
   - Identify the code paths, abstractions, wrappers, data boundaries, state transitions, or control-flow choices that create complexity.
   - For each source, ask whether removing it would violate a named behavioral contract.
   - Classify each source as contract-driven, design-driven, or uncertain.

4. **Classify the complexity.**
   - Use `Design-caused` when optional choices dominate. Name the mistaken boundary, abstraction, or flow shape.
   - Use `Contract-caused` when named behavioral contracts force the structure.
   - Use `Mixed` when both are true. Separate the real difficulty from the incidental indirection.

5. **Define the simplest valid shape.**
   - Describe the minimum shape that still satisfies the behavioral contracts.
   - If simplification requires weakening a contract, name that contract explicitly.
   - If missing context prevents a confident answer, state the gap and the narrowest assumption needed.

## Classification cues

### Design-caused complexity

Treat complexity as design-caused when optional structure carries more weight than the requirement:

- a simple linear flow split into many single-call-site helpers
- generic wrappers hiding non-obvious control flow
- abstractions created to save a few repeated lines but making semantics harder to follow
- mixing "commit state" and "return original error" semantics through indirection instead of explicit control flow
- a data model or boundary choice forcing awkward orchestration
- trying to preserve theoretical flexibility or reuse that the current feature does not need

Do not stop at "overengineered". Name the decision that creates the complexity:

- wrong abstraction boundary
- generic helper hiding special semantics
- event log used as authoritative state
- unnecessary reuse pressure
- premature generalization

### Contract-caused complexity

Treat complexity as contract-caused when the code must preserve required behavior:

- strict transactional semantics
- exact error behavior
- concurrency safety
- replay protection
- security-sensitive blocking rules
- backwards-compatible behavior
- asymmetric flows such as identified-user vs new-user handling

Name the exact behavioral contract. Avoid vague labels like "edge cases".

## Guardrails

- Be direct when the complexity is self-inflicted.
- Do not pretend all complexity is accidental.
- Do not recommend simplification that silently breaks a behavioral contract.
- If the code is complex for good reason, name the responsible contract.
- If the code is complex because the design is wrong, name the design decision causing it.

## Output format

Start with findings, not summary.

Use this structure:

### Findings
- List the key complexity sources in severity or impact order.
- Reference concrete files and lines when possible.

### Complexity Source
- `Design-caused`, `Contract-caused`, or `Mixed`
- Explain why in terms of the traced sources.

### Root Cause
- State the minimum set of behavioral contracts that make the problem genuinely hard.
- State which complexity is optional.

### Simplest Valid Shape
- Describe the simplest implementation shape that still respects the behavioral contracts.
- If the current implementation is already near that shape, say so and name the contracts responsible.
- If a simpler solution requires weakening a contract, say exactly which one.

## Typical prompts

- "This diff looks way too complicated for what it does. Review it."
- "Find the root complexity here."
- "Is this complexity required, or is the design wrong?"
- "Why did a simple feature produce so much code?"
- "Check whether the real problem is the behavioral contracts or the design."
