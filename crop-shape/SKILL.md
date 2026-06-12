---
name: crop-shape
description: Prune interface and model shapes by forcing every field, parameter, enum value, and option to prove immediate necessity, then deleting anything redundant. Use when designing, reviewing, trimming, or refactoring API interfaces, DTOs, schemas, domain models, data models, config shapes, request/response payloads, component props, event payloads, or any structured shape.
---

# Crop Shape

Use this skill to make an interface or model smaller, sharper, and harder to misuse.

The default stance is deletion. A field, parameter, enum value, flag, option, prop, relation, or metadata item has no right to exist until someone can prove it is needed now.

## Core Rules

1. **Survival burden**
   - Ask field by field and parameter by parameter: "What exact scenario cannot be completed right now without this?"
   - The scenario must be concrete, current, and blocking: who uses it, in which flow, at what moment, and what fails if it is absent.
   - "Might need later", "nice to have", "for flexibility", "for completeness", "debugging", "analytics someday", and "the backend already has it" do not count.
   - If nobody can name the immediate blocking scenario, delete it.

2. **Redundancy removal**
   - If the same information can be obtained from any other place in the system, it is redundant in this shape.
   - Other places include route params, auth/session context, server state, database relations, cache keys, existing APIs, derived values, feature flags, configuration, parent objects, or caller-owned state.
   - Prefer references, identifiers, derivation, and localized lookup over copying facts through multiple shapes.
   - If duplication is kept temporarily for migration or performance, mark the owner, expiry condition, and consistency rule. Otherwise delete it.

## Workflow

1. Identify the shape boundary:
   - Name the interface, model, schema, prop type, payload, or config under review.
   - State who constructs it and who consumes it.
   - State the current product or system flow it supports.

2. Inventory every candidate:
   - List each field, parameter, enum value, option, nested object, and relation.
   - Include defaults, optional fields, passthrough metadata, and convenience mirrors.

3. Run the survival test:
   - For each candidate, demand one concrete sentence: "Without `<name>`, `<actor>` cannot `<current task>` because `<specific failure>`."
   - Reject vague or future-tense justifications.
   - If the task can still be completed with a lookup, derivation, or existing context, the candidate fails.

4. Run the redundancy test:
   - Search for alternate sources of the same information.
   - Check whether the value is derivable from existing fields.
   - Check whether the consumer already has enough context to obtain it.
   - Delete duplicates unless there is a documented temporary exception.

5. Produce the crop:
   - Keep only fields with a concrete current blocking scenario and no better source.
   - Delete unproven fields, redundant mirrors, broad metadata bags, speculative flags, and convenience fields.
   - Rename survivors if the crop reveals a narrower purpose.

## Output Format

When reporting a crop, use this structure:

- **Boundary**: the shape and flow being reviewed.
- **Deleted**: each removed candidate with the failed survival or redundancy reason.
- **Kept**: each survivor with the exact current blocking scenario.
- **Temporary duplicates**: any tolerated redundancy, with owner and expiry condition.
- **Resulting shape**: the minimal interface or model after deletion.

## Example Challenge

For a payload field `organizationName`, ask:

- Does this exact request fail right now without `organizationName`?
- Does the receiver already have `organizationId`?
- Can the receiver read the name from organization state when rendering?

If the answer is yes to either of the last two questions and there is no current blocking reason to inline the name, delete `organizationName`.
