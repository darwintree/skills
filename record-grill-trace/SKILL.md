---
name: record-grill-trace
description: Record discussion traces after `grilling`. Always invoke by default when a grilling discussion ends or reaches stable decisions, before any post-grill work continues.
---

# Record Grill Trace

Treat the discussion trace as the gate between `grilling` and any post-grill work.

## Workflow

1. Stop any other post-grill work until the discussion trace exists.
2. Identify the topic of the completed `grilling` discussion, then create or update `docs/traces/discussion/YYYY-MM-DD-slug.md`.
   - Use the current local date for `YYYY-MM-DD`.
   - Use a kebab-case topic slug for `slug`.
   - If the same trace file already exists for the current discussion, update it instead of creating a second file.
3. Read nearby discussion traces only if repository trace style is still unclear.
4. Extract every resolved question from the discussion.
5. Organize resolved questions into logical groups (with the top group capturing the Core Intent / Design Tree Root — i.e., "Why", core problem, or main objective).
6. For each group:
   - provide a short 1-2 sentence Brief summary of key takeaways/intent,
   - keep the original questions intact below it (details and specifics are grounded in the original questions),
   - for each question within the group, write a clear question heading, `问题：` with the design branch or ambiguity that needed resolution, and `决定：` with only the final choice.
7. If the discussion produced or is tracked by a `docs/spec/changes/YYYY-MM-DD-*.md` file, add or update a `## Discussion Trace` section in that change file with the trace path.
8. If the trace is linked from an issue and that issue is created or updated in the same task, ensure the issue acceptance criteria include a checklist item requiring a line-by-line audit that every decision recorded in the trace has been implemented.
9. Read the final file back.

Done when the dated trace file exists, every resolved question from the grill is recorded, any related spec-change link is current, and the final file has been read back.

## Writing Rules

- Keep the trace factual and concise.
- Group related questions logically. Always place the Core Intent / Design Tree Root ("Why" / core problem / main objective) as the top group.
- The Brief summary for each group must be minimal (1-2 sentences) to avoid review overhead or distortion; details and specifics must always defer to the original questions and decisions below.
- It is acceptable to make question wording clearer than the original discussion.
- Do not add implementation plans, rationale, TODOs, or new decisions that were not made in the discussion.
- Do not include rejected intermediate options unless they are necessary to describe the question.
- Preserve final decisions even when the discussion changed direction.
- If a decision is ambiguous or missing, ask one focused follow-up question before writing that item.
- Before the trace file exists, do not modify specs, issues, code, or `CONTEXT.md`.
- After the trace file exists, only make the minimal trace-link updates above unless the user explicitly asks for additional changes.
- When no spec change is related, write `对应 spec change: None.`

## Trace Shape

Use this structure:

```markdown
# [Topic] 讨论记录

对应 spec change: [`docs/spec/changes/YYYY-MM-DD-short-name.md`](../../spec/changes/YYYY-MM-DD-short-name.md)

## 1. 核心意图 / Core Intent (Design Tree Root)

> Brief: [1-2 sentences summarizing the core objective and why this feature/change exists.]

### 1.1 [Question Title]

问题：[Clear description of the core motivation or objective branch.]

决定：[Final decision.]

## 2. [Group Name / Subsystem]

> Brief: [1-2 sentences high-level takeaway for this group.]

### 2.1 [Question Title]

问题：[Clear description of the branch that was resolved.]

决定：[Final decision.]
```

Repeat the grouped section structure for every logical area and resolved question.
