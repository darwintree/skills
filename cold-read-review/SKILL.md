---
name: cold-read-review
description: Review user-specified documents with a cold-read consumer interview. Use when the user asks to review, audit, or check whether a document is ready for a qualified reader.
---

# Cold-Read Review

Use this skill to test whether a document works for a qualified reader arriving without the originating conversation.

Cold means **conversation-isolated**, not **project-isolated**. The reviewer may use durable project context available to the intended reader, including repository instructions, neighboring specs, code, and version history. It must not receive the authoring conversation, prior agent reasoning, unstated intent, or suspected findings.

Treat Every Page is Page One (EPPO) relative to that qualified reader: the document should establish its purpose and local scope, and name or link required prerequisites. It may rely on stable, discoverable project facts instead of restating them.

## Workflow

1. Identify the document path or paths.
   - Treat only user-specified paths as the artifacts under review.
   - If no path is specified, ask for one.
   - Identify the consumer role and document type to give the reviewer. Use a user-specified role when present; otherwise infer a narrow role from the artifact type, such as "implementer reading an execution plan" or "implementer reading a spec".
   - Separate durable project artifacts from transient authoring context. The former is available for exploration; do not pass the latter to the reviewer.

2. Start a fresh subagent as the document consumer.
   - Start it without inherited conversation history. When the subagent interface exposes context-fork controls, use the option that passes no prior turns.
   - The first message must contain only the path or paths, the consumer role, the document type, and a neutral instruction such as: "As the implementer who will execute this plan, read the document at this path as an execution plan. Explore the repository context a qualified implementer would normally use. Summarize your understanding in one short paragraph, then wait for my questions."
   - Do not include document contents, review framing, evaluation criteria, suspected issues, prior conclusions, or expected findings.
   - If no subagent interface is available, perform a main-agent fallback from the same consumer stance, then disclose that fallback in the final response.

3. Interview the consumer:
   - Have it answer from its own reading, repository exploration, and understanding, without invoking a review skill or receiving the parent agent's conclusions.
   - Allow it to explore the corresponding repository freely when needed to understand the artifact, including project instructions, linked or neighboring documents, code, and version history.
   - Ask it to state the exploration scope it used and whether the artifact still depends on that context to be readable.
   - Ask whether the document is clear to a qualified reader, and whether any descriptions contradict each other.
   - Ask whether the document establishes its purpose, scope, audience, and prerequisites locally or points to a discoverable project source.
   - Ask whether any concept, reference, or obligation appears abruptly or relies on transient authoring context that a qualified reader cannot recover.
   - Ask whether any information is missing for the reader to act correctly.
   - Ask it to cite the smallest relevant quote or section label for each issue.

4. Report the review findings.
   - Focus on document problems, not the review framework.
   - Treat unresolved context gaps as specific concepts, references, exclusions, plans, responsibilities, or constraints that still cannot be grounded after reasonable repository exploration.
   - Do not report a gap merely because its context lives outside the document when that context is stable, discoverable, and normally available to the intended reader.
   - Use `blocking` for issues that prevent correct action, cause likely wrong execution, or make completion impossible to judge.
   - Use `non-blocking` for issues that can cause misreadings, repeated clarification, or execution divergence without blocking action.
   - State whether the review pass used a fresh subagent or main-agent fallback in the exploration scope.
   - Use this structure:

```md
Readiness: ready | not ready | ready after minor fixes
Exploration scope: ...

Findings:
- **[blocking | non-blocking] Problem title**
  - **Problem**: ...
  - **Signal**: ...
  - **Where**: ...
```

## Editing

Only edit when the user asks for changes or an updated document.

- Prefer deleting content that only makes sense with hidden context.
- If the content must remain, add the minimum local context, prerequisite, or link label needed.
- Do not invent backstory.
- Re-run the review after substantive edits.
