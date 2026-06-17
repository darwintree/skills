---
name: cold-read-review
description: Review user-specified documents with a cold-read method. Use when the user asks to review, audit, or check a document.
---

# Cold-Read Review

Use this skill to test whether a document works for a qualified reader arriving cold.

Treat Every Page is Page One as the standard: the document should establish its own context, serve a specific and limited purpose, stay readable out of sequence, and link or name prerequisites instead of depending on hidden context.

## Workflow

1. Identify the document path or paths.
   - Treat only user-specified paths as the artifacts under review.
   - If no path is specified, ask for one.
   - Do not pass surrounding conversation, intent, issue history, review rules, or explanations as context.

2. Start a fresh subagent with only the document path or paths.
   - The first message may only contain the path or paths and a neutral instruction such as: "Read the document at this path. Wait for my follow-up question."
   - Do not include document contents, review framing, suspected issues, or prior conclusions.
   - If no subagent interface is available, do the same path-only review yourself and disclose that fallback in the final response.

3. Ask the reviewer:
   - Instruct it to answer from materials it personally read: the review artifact plus any context explicitly linked or named by that artifact.
   - Allow it to follow referenced files, links, or section references when needed to understand the artifact.
   - Ask it to state which extra context it consulted, if any, and whether the artifact still depends on that context to be readable.
   - Ask whether the document is clear to a qualified reader arriving cold, and whether any descriptions contradict each other.
   - Ask whether the document establishes its purpose, scope, audience, and prerequisites locally.
   - Ask whether any concept, reference, or obligation appears abruptly or relies on unstated prior context.
   - Ask whether any information is missing for the reader to act correctly.
   - Ask it to cite the smallest relevant quote or section label for each issue.

4. Report the review findings.
   - Infer likely cold-read and EPPO issues from clarity problems, missing local context, abrupt concepts, contradictions, and missing information.
   - Use `blocks a new reader` for missing information or contradictions that prevent action.
   - Use `likely context gap` for abrupt concepts or references to unstated context.
   - Use `smaller EPPO risk` for non-blocking ambiguity, weak purpose, weak audience fit, or avoidable sequence dependence.
   - State whether the pass used a fresh subagent or main-agent fallback.

## Editing

Only edit when the user asks for changes or an updated document. Prefer deleting content that only makes sense with hidden context. If the content must remain, add the minimum local context, prerequisite, or link label needed. Do not invent backstory. Re-run the review after substantive edits.
