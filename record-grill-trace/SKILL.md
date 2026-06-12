---
name: record-grill-trace
description: Record a concise docs/traces discussion trace after a grill-me or grill-with-docs session completes. Use this after a design interview reaches decisions and the user wants the questions and final choices captured as a trace file.
---

# Record Grill Trace

Use this skill after a `grill-me` or `grill-with-docs` discussion has reached stable decisions and the user asks to record the discussion.

## Goal

Create or update one Markdown file under `docs/traces/` that records the discussion branches from the completed `grill-me` session.

## Workflow

1. Identify the topic of the completed `grill-me` discussion.
2. Choose a trace file:
   - Use the user-provided path when one is given.
   - Otherwise create a kebab-case filename under `docs/traces/` that names the discussed topic.
3. Read nearby trace files only as needed to match repository style.
4. Extract each resolved question from the discussion.
5. For each question, write:
   - a clear question heading,
   - `问题：` with the design branch or ambiguity that needed resolution,
   - `决定：` with only the final choice.
6. If the discussion produced or is tracked by a `docs/spec/changes/YYYY-MM-DD-*.md` file, add or update a `## Discussion Trace` section in that change file with the trace path.
7. If the trace is linked from an issue and that issue is created or updated in the same task, ensure the issue acceptance criteria include a checklist item requiring a line-by-line audit that every decision recorded in the trace has been implemented.
8. Verify the written file by reading it back.

## Writing Rules

- Keep the trace factual and concise.
- It is acceptable to make the question description clearer than the original wording.
- Do not add implementation plans, rationale, TODOs, or new decisions that were not made in the discussion.
- Do not include rejected intermediate options unless they are necessary to describe the question.
- Preserve final decisions even when the discussion changed direction.
- If a decision is ambiguous or missing, ask one focused follow-up question before writing that item.
- Do not modify specs, issues, code, or `CONTEXT.md` unless the user explicitly asks for those changes.

## Trace Shape

Use this structure:

```markdown
# [Topic] 讨论记录

对应 spec change: [`docs/spec/changes/YYYY-MM-DD-short-name.md`](../spec/changes/YYYY-MM-DD-short-name.md)

## 1. [Question Title]

问题：[Clear description of the branch that was resolved.]

决定：[Final decision.]
```

Repeat the numbered section for every resolved question.
