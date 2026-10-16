# Iteration Workflow

## Project settings

Resolve this section during setup; store project choices here and replace template pointers with actual project-relative paths.

- Spec content scope: external or cross-module behavior contracts (default; replace with the selected scope).
- Formal Specs and index: `docs/spec/`, `docs/spec/README.md`.
- Bundles: `docs/spec/changes/<change-id>/`.
- Formal Spec template: `docs/spec/spec-template.md`.
- Change template: `docs/spec/change-template.md`.
- Design details: disabled; if enabled, record filename, content scope and template path here.
- Implementation decisions: `docs/traces/implementations/`.

## Artifacts and authority

Formal Specs describe the current confirmed and implemented product within the selected content scope. A Bundle records one proposed or accepted change to those Specs. `change.md` alone owns its lifecycle: `proposed → in progress → merged`.

`proposal.md` records resolved discussion questions and final decisions, not authoritative requirements or execution plans. Optional design details record confirmed concrete designs, separate from proposal. Implementation traces record choices left unresolved by accepted inputs; they cannot authorize changing those inputs.

## Discuss and propose

Read the Spec index, relevant formal Specs and selected templates. Determine whether the request affects the project's Spec content. If it does not, perform the task without a Bundle. If scope is unclear, resolve it from evidence or ask the user.

For existing behavior without a Spec, inspect only the affected scope, show the observed baseline and obtain user confirmation before recording it as a formal Spec. Code demonstrates behavior, not acceptance. Separate the baseline from the requested change. An empty project has no baseline behavior to invent; propose a new target Spec and create it after implementation.

Use the project-local grilling skill when discussing unresolved requirements or design. Start with intent, then ask each frontier of independent decisions together. Do not re-open already settled questions. At discussion completion, use record-grill-trace to write the Bundle's proposal before proceeding. Discussions with no Spec impact may use a dated discussion trace outside Bundles.

Create one Bundle for one change. Choose a descriptive kebab-case change-id, reusing the current Bundle across turns. `change.md` begins as proposed and identifies every target Spec. For one target, put the delta in change.md; for multiple targets, keep an index there and one delta per target under `specs/`. Express changes using the selected project model and identify their intended absorption location. Keep implementation steps out of Spec deltas.

Done proposing when every intended Spec change is represented once, target locations are clear and unresolved requirements are visible to the user. Leave unresolved changes proposed.

## Accept and hand off

Show the concrete change for user acceptance. Record the accepted scope and confirmation in change.md; only then mark it in progress and implement. Prior explicit acceptance of the same concrete content is sufficient; a vague request to build a feature does not confirm unseen requirements. Formal Specs still describe the implemented baseline during implementation.

When optional design details are enabled, record only user-confirmed designs with recoverable confirmation evidence; create the document only when such choices exist. When disabled, keep confirmed required design constraints in a separate part of change.md. A single clear user authorization can accept both change and designs. Neither design details nor proposal override the accepted Spec delta.

A new session reads change.md, its target Specs, any delta files, proposal and applicable confirmed designs to recover scope and confirmation. Missing confirmation evidence means unknown: ask before treating the design or change as accepted. Implement within that scope; use trace-implementation-decisions for consequential choices the inputs leave unresolved.

If implementation requires a change to accepted requirements or designs, explain the difference and obtain confirmation, then update the affected Bundle material before implementing it. A trace entry is not permission. Keep the current Bundle unless this is a separate change.

## Complete and merge

After implementation, check that every accepted delta and confirmed design is satisfied using evidence appropriate to the project. If implementation is incomplete or verification is unavailable, retain in progress and report what remains; do not claim completion. A discrepancy in Spec content requires resolving the change before merging.

Once satisfied, absorb each delta into its formal Spec using the project's template. Write current product content, not change history; keep formal Specs understandable without the Bundle. Update the Spec index for new or moved Specs. Record a concise completion-evidence summary in change.md, then mark merged only after all target Specs are updated. No extra confirmation is needed for faithful absorption of an already accepted, implemented change.

Report Bundle path/status, affected Specs, optional design document if present, and remaining work.
