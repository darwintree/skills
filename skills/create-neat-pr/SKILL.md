---
name: create-neat-pr
description: Prepare or create pull requests with low review cost. Use when preparing a PR for review, cleaning a noisy diff, or splitting unrelated changes into reviewable units.
---

# Create Neat PR

A neat PR lets a reviewer judge correctness and completeness with minimal effort. Optimize review cost, not line count: every changed hunk should implement the intended outcome or help the reviewer understand and verify it.

## Establish the review boundary

Use the existing PR's base or the user's specified base. Otherwise inspect repository branch conventions; ask if the evidence leaves materially different possible bases. Inspect the full branch diff from its merge-base with that target, plus staged, unstaged, and relevant untracked changes.

Before editing, distinguish task changes from pre-existing or concurrent work. Preserve unrelated work. If ownership of a mixed hunk is unclear, resolve that uncertainty before changing it; never reset or discard someone else's changes to clean the diff.

This step is complete when the PR's purpose can be stated in one or two sentences and the comparison includes every change intended for review.

## Make the diff earn its place

For each hunk, determine whether it is:

- **Required:** implements the outcome, updates affected callers, or supplies necessary tests, documentation, migrations, or generated artifacts.
- **Explanatory:** a local restructuring that makes the intended change easier to understand and verify while preserving required behavior.
- **Unrelated:** independently useful work or mechanical churn that does not serve this PR's purpose.

Retain explanatory changes only when the understanding they save outweighs the extra behavior or structure a reviewer must check. Leave unrelated work outside this PR while preserving it in the workspace or a separate branch as appropriate.

Common noise includes whole-file formatting, incidental renaming or file movement, import reordering unrelated to tooling requirements, unnecessary lockfile churn, and opportunistic cleanup. Follow required repository tooling; when it causes unavoidable churn, isolate and explain it rather than hand-editing generated output.

Keep code and comments focused on the resulting behavior. Preserve compatibility that has actual consumers or an explicit contract; avoid speculative compatibility layers and historical explanations that the final code no longer needs.

Unless explicitly requested, do not add assertions that old symbols, code patterns, or implementation choices have disappeared.

## Split only when it lowers review cost

Keep coupled implementation, callers, and verification together. Split independently understandable changes when mixing them would force a reviewer to reason about separate concerns. A preparatory refactor may deserve its own PR when it can be verified independently and materially clarifies the behavior change.

Separate commits can help a reviewer follow the work, but they do not remove noise from the aggregate PR diff. Inspect that aggregate before deciding the result is neat.

## Verify and present

Reinspect the final comparison after cleanup and generation: account for every changed file, inspect whitespace errors, and confirm affected callers and necessary artifacts are included. Every included hunk must have an identifiable purpose in this PR.

Write the PR title and description for a reviewer without access to the conversation:

- Lead with the concrete problem and resulting behavior; use a before/after example when useful.
- Explain only non-obvious choices or unavoidable churn that affect review.
- Give actual validation results and material limitations.

Keep detail proportional to the change; omit the work diary and abandoned approaches unless they explain a necessary tradeoff.
