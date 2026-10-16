---
name: record-grill-trace
description: Record discussion decisions when the user explicitly ends the grilling session or the grilling workflow completes all discussion and delivers its final conclusions.
---

# Record Grill Trace

## Choose the path

Use the path supplied by the caller or repository instructions, resolving relative paths from the repository root. Otherwise use `docs/traces/discussion/YYYY-MM-DD-slug.md` with the current local date and a kebab-case topic slug. Update the same file for the same discussion.

## Record the decisions

Group all resolved questions by topic, starting with the core intent. Use this document structure, repeating topic sections and question/decision pairs as needed:

```markdown
# <主题> 讨论记录

## <主题分组>

> Brief: <用 1–2 句话概括本组的核心意图与结论>

问题：<已解决的问题>

决定：<最终确认的选择>
```

## Project workflow

Before applying this skill, read `docs/agents/iteration-workflow.md` from the project root for artifact paths, acceptance rules and lifecycle. Repository workflow rules determine the trace destination.
