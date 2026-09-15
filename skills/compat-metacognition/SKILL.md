---
name: compat-metacognition
description: Compatibility metacognition — a mandatory gate before changing anything that already exists, including when planning or grilling such a change. Purely additive tasks skip the gate. If you already know this skill's contents, apply the gate without loading the skill again.
---

# Compat Metacognition

The assumption under examination: "the current state must be kept compatible" — an assumption agents act on unconsciously. Run the check before designing or executing the first change to each distinct existing state; reconsider its result only when that state, its dependents, or the evidence changes.

A task that touches existing material is either an **addition** (new code, new document, no existing state) or a **change** (modifying what already exists). Additions have nothing to be compatible with. Every change is a compatibility decision, whether or not anyone calls it one — rewriting a paragraph and migrating an API raise the same first question: **does anything real depend on the current state staying as it is?**

## Stability check

Classify the current state F (being changed to F') with evidence, not assumption:

- **Stable** — F has escaped the author's hands: released, deployed, merged to the production line, circulated to consumers, or depended on by other work. Real consumers may rely on it.
- **Unstable** — F is still under the author's control: no consumer can reasonably depend on it yet.
- **Unknown** — evidence is missing. State the assumption explicitly before proceeding.

Judge by dependents, not by artifact type or branch name. Branch layout is one signal, not the definition: "exists only on dev, never on main" means unstable, but so does a draft document never shared beyond the working branch, an unpublished API, or an internal format nothing has read. Conversely, a document merged to main and read by the team is stable even though it is "just a doc". Stability is per-dependents, not per-feature: a released API is stable while its internal implementation, depended on by no one, stays unstable — the two can split within one feature.

## Decision rule

- **Unstable**: change freely, as if F never existed. Choose the clean design. For structure, wording, shims, or API surface that only serve F, apply three levels in order:
  1. **Remove** — the default.
  2. **Flag in place** — when removal would cause hard-to-control impact (large blast radius, entangled callers, out of scope for the current change), leave the code but mark it, e.g. a comment at the interface naming F and why it survives.
  3. **Never silent** — keeping anything that only serves F without removing or flagging it is the failure mode.
- **Stable**: preservation or explicit migration — say which, and which consumers are being served.

Apply each decision at planning and grilling (prefer the incompatible-by-design option when unstable), then reuse it while editing and reviewing the same existing state.
