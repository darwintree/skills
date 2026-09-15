---
name: feedback-loop-with-constraints
description: Run a task through an explicit constraints-file feedback loop with repeated review and autonomous correction. Use only when the user explicitly asks to use feedback-loop-with-constraints, $feedback-loop-with-constraints, or clearly requests this named workflow; do not trigger implicitly for ordinary implementation, review, iteration, or constraint-gathering requests.
---

# Feedback Loop With Constraints

Use this skill to execute a user task while preserving a stable source of truth for requirements and constraints, then iterate through implementation and review until feedback is resolved, the review is clean, or the configured loop budget is exhausted.

## Setup

1. Collect the user's task, requirements, constraints, and maximum loop count if provided.
2. If the user did not specify a maximum loop count, set it to `5`.
3. Create a constraints file in `/tmp` named `constraints-yyyy-mm-dd-slug.md`, where:
   - `yyyy-mm-dd` is the current date.
   - `slug` is a short lowercase hyphen-case summary of the task.
4. Create a feedback history file in `/tmp` named `feedback-history-yyyy-mm-dd-slug.md`, using the same date and slug as the constraints file.
5. Write the constraints file as the authoritative task contract:
   - Include the original user task.
   - Include all known requirements and constraints.
   - Include the maximum loop count.
   - Include the feedback history file path.
   - Include links or paths to any files that already define constraints instead of copying those constraints into the file.
   - Do not include review feedback history, action history, conflicts, ignored feedback, or other loop logs.
6. Write the feedback history file for all loop-state records:
   - Include the constraints file path.
   - Include loop feedback, action history, conflicts, ignored feedback, remaining feedback, and stop reasons.
7. After setup, do not modify the constraints file unless the user explicitly requests a constraint change. A user-provided new or clarified constraint counts as a user request to update the constraints file; review findings, implementation discoveries, or agent preferences do not.

## Required Loop

Repeat the following loop until a stop condition is reached.

### 1. Read Constraints

Read the constraints file at the start of every loop iteration, even if it was just updated. Treat it as the source of truth for the task.

Read the feedback history file before deciding whether review feedback is repeated, conflicting, already resolved, or should be ignored.

### 2. Execute Task Work

Perform the implementation, analysis, document writing, or other requested task work according to the constraints file and the workspace's normal conventions.

### 3. Review Against Constraints

Review the current result against every requirement in the constraints file.

If the workspace defines a review process in `AGENTS.md`, repo docs, or relevant skills, use that review process and explicitly include the constraints file as review criteria.

If no workspace review process is defined:

- Start an independent subagent to review the current result against the constraints file.
- Do not fork the current context. Give the subagent only the minimum task-local context it needs: the constraints file path, relevant artifact paths, and a request to compare the result against the constraints.
- If subagents are unavailable, block the task and report that the required review path cannot be performed.

The review output should identify only concrete mismatches, missing work, risks, and test or verification gaps. Treat an empty actionable finding list as no review feedback.

### 4. Decide Before Acting On Feedback

If the review returns feedback, NEVER directly follow it.

First decide which action process applies:

1. If the workspace defines how to act on review feedback in `AGENTS.md`, repo docs, relevant skills, or another local convention, follow that workspace-defined process first.
2. If no workspace-defined action process exists, use the fallback process below.

Fallback process when no workspace action process exists:

1. Determine whether each finding is actionable, relevant, and supported by the constraints.
2. Check whether the same issue appeared in earlier feedback.
3. If repeated feedback reveals an actual conflict in the current constraints, choose a resolution that best matches the user's original task and explicit priorities.
4. Record the conflict, chosen resolution, and any feedback to ignore in the feedback history file.
5. If no conflict exists, act autonomously on valid feedback.

After acting on feedback, update the feedback history file with the action taken and continue the loop if the loop budget remains. Do not update the constraints file unless the user explicitly requested a constraint change.

## Stop Conditions

Stop and deliver the result when either condition is true:

- The latest review produces no actionable feedback.
- The maximum loop count has been exhausted.

If the loop count is exhausted while unresolved feedback remains, deliver the best current result and clearly report the remaining feedback and why the loop stopped.

## File Maintenance

Keep the constraints file concise and contractual. Use this structure unless the task needs something more specific:

```markdown
# Constraints: <task>

- Created: <date>
- Max loop count: <number>
- Feedback history: </tmp/feedback-history-yyyy-mm-dd-slug.md>

## Original Task

<user request>

## Requirements And Constraints

- <constraint>
- See also: <path-or-link-to-existing-constraint-file>

## User-Authorized Constraint Changes

- <timestamp>: <constraint change requested by the user>
```

Keep the feedback history file as the mutable loop log. Use this structure unless the task needs something more specific:

```markdown
# Feedback History: <task>

- Created: <date>
- Constraints file: </tmp/constraints-yyyy-mm-dd-slug.md>
- Max loop count: <number>
- Current loop: <number>
- Status: <active|complete|blocked>

## Constraint Change Log

- <timestamp>: <user-authorized constraints file update>

## Review Feedback History

- Loop <n>: <finding or "No actionable findings">

## Conflicts And Ignored Feedback

- <conflict, resolution, and feedback to ignore>

## Actions Taken

- Loop <n>: <action>
```
