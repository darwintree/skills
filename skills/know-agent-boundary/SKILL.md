---
name: know-agent-boundary
description: "Review or revise agent-facing documents by modeling the agent's possible states and in-brain testing what it can know, decide, do, and verify. Use for skills, prompts, AGENTS.md, plans, workflows, and policies; not for general prose readability."
---

# Know Agent Boundary

## Workflow

### 1. Model agent states

Identify the agent's context, durable state, tools, permissions, and execution boundaries. Derive the smallest set of states that covers every behavioral branch in the document. Split states only when the agent has different evidence or available actions; otherwise merge them.

```markdown
| State | Available or recoverable evidence | Available actions and checks |
| --- | --- | --- |
| <state> | ... | ... |
```

### 2. In-brain test

From each state, mentally execute every reachable operative instruction using only its modeled evidence and actions. Record what the agent derives and whether it can perform and verify it. Missing evidence yields `unknown`, not `false`; do not fill it with author intent.

Then remove the instruction and rerun the same state. Compare evidence gathered, branch, action, and completion condition. If none changes in any relevant state, the instruction is a no-op.

```markdown
| State | Instruction | Derived action | Boundary | Smallest fix |
| --- | --- | --- | --- | --- |
| <state> | <smallest relevant quote or section> | <act, stop, guess, or unknown> | <missing knowledge, indistinguishable, cannot execute, or no-op> | ... |
```

The test is complete when every behavioral branch and every operative instruction reachable from it has been exercised. Report failures and unresolved `unknown`; omit passing rows.

## Revision

Fix only the failed boundary: expose or record required evidence, merge indistinguishable branches or add observable signals, narrow actions to what the agent can perform and verify, and delete no-ops. Then update affected states and rerun the in-brain test for changed instructions.
