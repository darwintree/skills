---
name: setup-iteration-workflow
description: Set up a project-local iteration workflow for an empty or existing project, with configurable Spec scope, templates, paths, and optional design-detail documents. Use when asked to initialize or reconfigure this workflow.
---

# Setup Iteration Workflow

Install a fixed discussion → accepted change → implementation handoff → implemented Spec workflow. Configure the project's expression of requirements; it may use contracts, user stories, or another Spec model. This skill sets up the workflow, not the product's first iteration.

## Establish project choices

Read the target project's instructions, existing workflow documents, templates, and local skills. Inspect enough of an existing project to identify conventions; an empty project needs no inferred technology or product requirements.

Resolve these project-level choices from explicit input and existing documents, then ask only for missing choices. Offer these defaults together:

- Spec content scope: external or cross-module behavior contracts. This is a selectable default, not a universal definition of Spec.
- Spec root: `docs/spec/`; Bundle root: `docs/spec/changes/`; workflow: `docs/agents/iteration-workflow.md`.
- Formal Spec template: the bundled Contract / Semantics / Guarantees template. Accept a supplied template or a description of another structure; establish what belongs in that project's Spec as well as its headings.
- Change expression: adapt additions, changes, and removals to the selected Spec model, including its acceptance conditions when applicable.
- Optional design details: off, the bundled `shape.md` preset, or a custom filename and format. When enabled, establish what confirmed design choices belong there; creation is conditional on an iteration producing such choices.

Reuse known choices on reruns. For actual conflicts with existing content, show the conflicting rules and resolve them with the user before replacement. Update the existing workflow in place and preserve unrelated instructions and skills. Do not infer authorization to replace unrelated files from a setup request.

## Install

Use the assets relative to this SKILL.md; no personal skill installation is required.

1. Adapt [the workflow asset](assets/iteration-workflow.md) to the resolved choices. Its project settings are the authority for paths, scope, template locations, and optional design details; substitute project paths in links and installed skill pointers. Preserve the lifecycle and artifact responsibilities while adapting the Spec and delta wording.
2. Save the selected formal Spec and change templates in the project, using [the default Spec template](assets/spec-template.md) and [change template](assets/change-template.md) as defaults. For shape, use [the shape preset](assets/shape-template.md); for custom design details, produce the chosen template. Omit a design template when disabled.
3. Install the bundled `grilling`, `record-grill-trace`, and `trace-implementation-decisions` directories from `assets/skills/` into the project's `.agents/skills/`, reusing matching installed versions. Bind each skill's workflow pointer to the actual project workflow path. The project must be usable without this meta-skill or personal skills afterward.
4. Add a concise AGENTS.md entry pointing to the project workflow: read it before discussing a change, deciding Spec impact, implementing an accepted Bundle, or merging completed changes. Point to the three installed skills at their trigger points. Reuse an existing equivalent entry instead of appending another.
5. Create or update the Spec index with its content scope, template and workflow pointers, and any existing formal Specs. Leave an empty project's business index empty; do not fabricate business Specs or example Bundles. Existing code without Specs is baselined only when a later iteration touches that scope.

If the user selects OpenSpec-specific validation, use an available matching tool only after checking its format compatibility; report a missing dependency rather than assuming it exists. The core workflow requires no format-specific CLI.

Finish by reporting the installed paths and resolved project choices. Setup excludes GitHub, PRs, test commands, compatibility skills, domain/ADR workflows, and simulated iteration checks.
