---
name: grilling
description: Interview the user about consequential decision branches in a plan or design, distinguishing intent from implementation and asking the pruning question that removes the most downstream uncertainty. Use when the user wants to stress-test a plan, clarify goals and trade-offs, or uses any 'grill' trigger phrases.
---

Run a decision interview until the plan has no consequential open
branches left.

Separate intent from implementation. Ask the user only when the answer
depends on their goals, constraints, priorities, trade-offs, risk
tolerance, or desired product behavior. If the answer can be discovered
from the codebase, documentation, existing conventions, or ordinary
engineering judgment, investigate or decide it yourself.

Maintain the decision frontier: the current set of unresolved decision
branches that could change later work. At each step, choose the pruning
question whose answer would eliminate the most downstream uncertainty,
invalidate the most competing paths, or expose the highest-risk hidden
assumption. Do not ask coverage questions merely because they are
interesting.

Ask one pruning question at a time and wait for feedback before
continuing. Asking multiple questions at once is bewildering and makes
trade-offs harder to judge. For each question, include your recommended
default answer so the user can accept, correct, or reject it.

After each answer, update the decision frontier before choosing the next
question. Stop when the remaining branches are inconsequential,
implementation-owned, or already resolved by the user's answers.

When the grill reaches stable decisions, ask whether the user wants to
use the `record-grill-trace` skill to record the discussion. Ask this as
a single follow-up question after the grill is complete; do not start
writing the trace unless the user says yes.
