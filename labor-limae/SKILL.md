---
name: labor-limae
description: "Polish existing drafts with the Labor Limae method: clarify intent, improve structure, raise information density, remove redundancy, choose Frame-evoking words, record each workflow step in a system temporary trace file, and make the document easier to understand, judge, decide from, or act on. Use when the user asks to refine, tighten, rewrite, edit, polish, or review a memo, spec, proposal, PRD, report, article, guide, or similar draft."
---

# Labor Limae

Use this skill to revise an existing document in complete rounds. Each round should make the reader understand faster, judge more accurately, and act with less effort.

Core rule: fix intent before structure; fix structure before language; delete surplus before adding detail; make the document clear before making it elegant.

## Step Trace

Before step 1, create a temporary Markdown trace file in the operating system temp directory, such as `$env:TEMP` on Windows or `/tmp` on Unix-like systems. Append the result of each numbered workflow step immediately after completing that step.

The trace must:

- Use the same seven step titles, numbering, and order as the Workflow.
- Record concrete results: intent sentence, paragraph propositions, density decisions, dilution fixes, redundancy merges, consulted vocabulary sources, chosen Frame-evoking words, candidate comparisons, and validation answers.
- If a step produces no edit, record the inspected result and `No change needed`.
- Omit no stages and add no extra stages.

## Workflow

Complete each revision round in this order. Preserve source facts and constraints. Do not invent unsupported details. When needed information is missing, flag the gap or add a clearly marked assumption.

1. Define the intent.
   - State in one sentence what the reader should understand, judge, decide, or execute.
   - Keep content that serves this intent.
   - Delete, compress, move, or flag weakly related content.
   - If the document has competing intents, state the assumed primary intent before editing.

2. Extract the skeleton.
   - Compress each paragraph into one core proposition.
   - Read the propositions in sequence.
   - If the sequence is clear, revise sentences next.
   - If the sequence is unclear, reorder, merge, split, or delete sections before polishing language.
   - Do not try to solve structural problems with nicer wording.

3. Check information density.
   - For each sentence, identify whether it provides a fact, reason, evidence, boundary, example, risk, consequence, standard, or action.
   - Delete sentences with no effective information.
   - Merge repeated information.
   - Add only the missing detail the reader needs to judge or act.

4. Fix information dilution.
   - Treat dilution as added length without added effective information.
   - Compress each diluted paragraph into one core proposition.
   - Restore only necessary facts, reasons, evidence, boundaries, or actions.
   - Prefer one precise sentence over several softer sentences with the same information.

5. Remove redundancy.
   - Label each sentence's function: claim, reason, evidence, boundary, example, risk, consequence, standard, action, or transition.
   - Merge sentences with duplicate functions and the same judgment.
   - If a claim lacks reason, evidence, boundary, or action, add the minimum needed or flag the gap.

6. Choose Frame-evoking words.
   - A Frame-evoking word is a term that imports a useful domain frame, making the document's core distinction easier to judge and harder to misread.
   - Identify the specific terms that carry the document's core concepts, judgments, roles, or actions.
   - For each important concept, first look for established vocabulary in the source document, surrounding project, or relevant knowledge domain.
   - If the search uses the surrounding project or a relevant knowledge domain, record the consulted source or scope in the trace.
   - Test 2-4 candidate terms from that vocabulary before inventing a new label.
   - For each candidate, write the associations it evokes: likely frame, implied actor or action, standard, risk, audience expectation, and adjacent concepts.
   - Compare candidates for precision, familiarity, information compression, usefulness for revision choices, and risk of misleading connotations.
   - Select words that evoke the most useful frame for the intended reader and use them consistently as leading terms.
   - Invent labels only when established vocabulary fails to clarify the frame, and only when the label materially reduces repeated reasoning.

7. Polish and validate.
   - Split long sentences.
   - Replace abstract nouns with concrete actions.
   - Replace vague words with explicit objects.
   - Compress repeated tone, hedging, and filler.
   - Validate with three questions: Is the intent clearer? Is the structure smoother? Is the information density higher?
   - If any answer is no or unclear, run another full round.

## Output

When editing directly, return the revised document or patch. For large rewrites, briefly note major deletions, moves, additions, and chosen Frame-evoking words.

When reviewing without editing, report the assumed intent, skeleton issues, density or redundancy issues, and recommended edits.

Always include the trace file path in the final response.
