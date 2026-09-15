---
name: validate-openspec-format
description: Validate OpenSpec Markdown or apply one delta spec to an explicitly named main spec with the bundled Bun CLI. Use without OpenSpec project discovery, archive, or workflow orchestration.
---

# OpenSpec Spec Tools

Use the bundled deterministic CLI. Resolve `scripts/cli.ts` relative to this `SKILL.md` and pass its absolute path to Bun.

- Main spec: `bun <script> validate spec <file>`
- Delta spec: `bun <script> validate change <file>`
- Apply delta to main spec: `bun <script> apply <change-file> <dest-file>`
- Strict keyword checks: append `--strict`

Choose `spec` for a main document with `## Purpose` and `## Requirements`; choose `change` for a delta document with ADDED, MODIFIED, REMOVED, or RENAMED Requirements. Inspect the headings when the user does not name the kind, and ask only if they remain ambiguous.

Apply reads one delta file and writes one explicit destination, creating it when absent. It validates the delta and rebuilt main spec before writing, never modifies the change file, and refuses to leave an empty spec. It does not discover OpenSpec roots, archive changes, or inspect workflow artifacts.

Report the diagnostics and whether the command exited successfully. Exit code 1 means the document is invalid; exit code 2 means the invocation or file read failed.

If Bun is unavailable, report that prerequisite instead of substituting the OpenSpec workflow CLI.
