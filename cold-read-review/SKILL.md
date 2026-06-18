---
name: cold-read-review
description: Review user-specified documents with a cold-read consumer interview. Use when the user asks to review, audit, or check whether a document is ready for a qualified reader.
---

# Cold-Read Review

Use this skill to test whether a document works for a qualified reader arriving cold.

Treat Every Page is Page One (EPPO) as the standard: the document should establish its own context, serve a specific and limited purpose, stay readable out of sequence, and link or name prerequisites instead of relying on hidden context.

## Workflow

1. Identify the document path or paths.
   - Treat only user-specified paths as the artifacts under review.
   - If no path is specified, ask for one.
   - Identify the consumer role and document type to give the reviewer. Use a user-specified role when present; otherwise infer a narrow role from the artifact type, such as "implementer reading an execution plan" or "implementer reading a spec".
   - Do not pass surrounding conversation, intent, issue history, review rules, explanations, or suspected issues to the reviewer.

2. Start a fresh subagent as the document consumer.
   - The first message must contain only the path or paths, the consumer role, the document type, and a neutral instruction such as: "As the implementer who will execute this plan, read the document at this path as an execution plan. Summarize your understanding in one short paragraph, then wait for my questions."
   - Do not include document contents, review framing, evaluation criteria, suspected issues, prior conclusions, or expected findings.
   - If no subagent interface is available, perform a main-agent fallback from the same consumer stance, then disclose that fallback in the final response.

3. Interview the consumer:
   - Instruct the consumer not to invoke or rely on any skill. It must answer from its own reading, repository exploration, and understanding.
   - Allow it to explore the corresponding repository freely when needed to understand the artifact.
   - Ask it to state the exploration scope it used and whether the artifact still depends on that context to be readable.
   - Ask whether the document is clear to a qualified reader arriving cold, and whether any descriptions contradict each other.
   - Ask whether the document establishes its purpose, scope, audience, and prerequisites locally.
   - Ask whether any concept, reference, or obligation appears abruptly or relies on unstated prior context.
   - Ask whether any information is missing for the reader to act correctly.
   - Ask it to cite the smallest relevant quote or section label for each issue.

4. Report the review findings.
   - Focus on document problems, not the review framework.
   - Treat unresolved context gaps as specific concepts, references, exclusions, plans, responsibilities, or constraints that still cannot be grounded after document and repository exploration.
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
