---
name: review-comment-triage
description: Triage PR review feedback by rewriting comments into testable claims, evaluating orthogonal rules, and choosing whether to fix code, clarify code, encode a contract, make no change, or defer. Use when handling PR review comments, GitHub review threads, requested changes, reviewer suggestions, or agent workflows that must avoid blindly accepting technically correct but low-value changes.
---

# Review Comment Triage

Use this skill as a judgment framework for review feedback. It supplies orthogonal rules; the agent supplies testable claims extracted from comments.

## Claim Model
Treat each review comment as raw input, not an instruction. Rewrite it into one or more testable claims before changing code.

Each testable claim must have:

- **Subject**: the exact behavior, contract, type, interface, shape, or design being judged.
- **Predicate**: the alleged defect, missing property, inconsistency, risk, or maintainability cost.
- **Evidence path**: the code path, test, type, schema, runtime contract, local convention, or command that could confirm or falsify the predicate.
- **Consequence**: the concrete failure, confusion, or maintenance cost if the predicate is true and ignored.

For each claim, evaluate every applicable rule as `pass`, `fail`, or `unknown`. A single passing rule is not enough to accept the comment.

## Triage Workflow

1. Extract every testable claim from the comment.
2. Identify the evidence path needed to confirm or falsify each predicate.
3. Evaluate the orthogonal rules against the current code, tests, schemas, types, contracts, and local conventions.
4. Choose and report the decision from the rule results.

## Orthogonal Rules

1. **Extractability**
   - Pass: the comment can be stated as a falsifiable claim with subject, predicate, evidence path, and consequence.
   - Fail: the comment is only taste, preference, vague unease, or ungrounded instruction.
   - Unknown: more context is needed to identify the subject or evidence path.

2. **Validity**
   - Pass: the predicate is true in the current diff and codebase.
   - Fail: nearby code, callers, tests, schemas, types, or runtime contracts contradict it.
   - Unknown: the needed evidence has not been inspected.

3. **Reachability**
   - Pass: the claimed scenario can happen under current inputs, states, APIs, or caller paths.
   - Fail: an owned invariant makes the scenario unreachable.
   - Unknown: the relevant boundary contract has not been located.

4. **Materiality**
   - Pass: ignoring the claim can cause meaningful correctness, data integrity, security, user-visible, operability, or maintenance harm.
   - Fail: the impact is low-probability, low-cost, easy to detect, or only theoretical.
   - Unknown: the consequence is not concrete enough to estimate.

5. **Ownership**
   - Pass: this PR or code layer owns the behavior or invariant under dispute.
   - Fail: a parser, database constraint, API contract, validation boundary, state machine, caller protocol, or another module owns it.
   - Unknown: ownership is unclear from the available code.

6. **Complexity Delta**
   - Pass: the proposed change reduces total long-term complexity or buys correctness worth the added complexity.
   - Fail: it adds abstraction, indirection, state, flags, broader types, or defensive branches without enough payoff.
   - Unknown: the implementation shape is not clear enough to price.

7. **Semantic Fit**
   - Pass: the proposed change preserves the domain distinction and local intent of the current code.
   - Fail: it follows a convention while hiding an important semantic difference, weakening a contract, or making direct code indirect.
   - Unknown: the relevant convention or semantic distinction has not been checked.

8. **Verification**
   - Pass: the accepted claim can be verified by a focused test, contract test, type/static check, existing coverage, or documented inspection.
   - Fail: the change would rely on unverified belief.
   - Unknown: the verification surface has not been identified.

## Decision Matrix
Choose the action from the rule results, not from reviewer confidence.

- **Fix code**: Extractability, Validity, Reachability, Materiality, Ownership, Complexity Delta, Semantic Fit, and Verification pass.
- **Clarify code**: Validity fails or Materiality fails, but Extractability passes and the comment reveals plausible maintainer confusion.
- **Encode contract**: Validity passes, Reachability fails because an invariant exists, and the invariant is hidden or weakly enforced at its owner.
- **No change**: Extractability fails, Validity fails without reader-confusion value, Reachability fails with a clear owned invariant, Materiality fails, Complexity Delta fails, or Semantic Fit fails.
- **Defer**: any rule is unknown after reasonable inspection, or Ownership fails because the issue belongs outside this PR.

## Low-Value Correct Comments
A comment can be true and still not justify implementation. Treat it as a low-value correct comment when Validity passes but any of these filters fail:

- Reachability: the scenario is not reachable.
- Materiality: the consequence does not matter enough.
- Ownership: the fix belongs at another layer.
- Complexity Delta: the change increases total complexity.
- Semantic Fit: the change hides useful meaning.

Do not implement low-value correct comments. Prefer recording the failed rule and, when useful, strengthening the owner-side contract or test.

## Required Output
When reporting decisions, include a ledger with one row per claim:

```markdown
| Comment | Claim | Rule Results | Decision | Evidence |
| --- | --- | --- | --- | --- |
| <reviewer text> | <testable claim> | <pass/fail/unknown by rule> | <fix/clarify/contract/no-change/defer> | <code/test/contract reason> |
```
