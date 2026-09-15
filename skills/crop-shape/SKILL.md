---
name: crop-shape
description: Trim API interfaces, DTOs, schemas, domain models, data models, config shapes, request/response payloads, component props, event payloads, and other structured shapes by requiring each field, parameter, enum value, option, relation, and metadata item to prove a current blocking use case and deleting redundant or derivable data.
---

# Crop Shape

Use this skill to reduce a structured interface or model to the smallest shape that supports a current flow.

The default stance is deletion. A field, parameter, enum value, flag, option, prop, relation, nested object, or metadata item survives only when it is needed now and cannot be sourced more cleanly elsewhere.

## Core Rules

1. **Survival burden**
   - Ask for each candidate: "What exact current scenario fails if this is absent?"
   - The proof must name the actor, flow, moment, task, and failure.
   - "Might need later", "nice to have", "for flexibility", "for completeness", "debugging", "analytics someday", and "the backend already has it" do not count.
   - Delete candidates without a current blocking scenario.

2. **Redundancy removal**
   - Delete data the consumer can get from route params, auth/session context, server state, database relations, cache keys, existing APIs, derived values, feature flags, configuration, parent objects, or caller-owned state.
   - Prefer identifiers, references, derivation, and localized lookup over copying facts through shapes.
   - Keep duplication only for a documented migration or performance reason. Record the owner, expiry condition, and consistency rule.

## Workflow

1. Identify the shape boundary.
   - Name the interface, model, schema, prop type, payload, event, or config under review.
   - State who constructs it, who consumes it, and which current flow it supports.

2. Inventory every candidate.
   - List each field, parameter, enum value, option, nested object, relation, default, optional field, passthrough metadata item, and convenience mirror.

3. Run the survival test.
   - For each candidate, require this sentence: "Without `<name>`, `<actor>` cannot `<current task>` because `<specific failure>`."
   - Reject vague, hypothetical, or future-tense justifications.
   - If lookup, derivation, or existing context still lets the task complete, mark the candidate for deletion.

4. Run the redundancy test.
   - Search for alternate sources of the same information.
   - Check whether the value is derivable from surviving fields.
   - Check whether the consumer already has enough context to obtain it.
   - Delete duplicates unless there is a documented temporary exception.

5. Produce the crop.
   - Keep only candidates with a concrete current blocking scenario and no cleaner source.
   - Delete unproven fields, redundant mirrors, broad metadata bags, speculative flags, and convenience fields.
   - Rename survivors when the crop reveals a narrower purpose.

## Output Format

When reporting a crop, use this structure:

- **Boundary**: shape, constructors, consumers, and current flow.
- **Deleted**: each removed candidate with the failed survival or redundancy reason.
- **Kept**: each survivor with the exact current blocking scenario.
- **Temporary duplicates**: tolerated redundancy with owner, expiry condition, and consistency rule.
- **Resulting shape**: the minimal interface or model after deletion.

## Example Challenge

For a payload field `organizationName`, ask:

- Does this exact request fail right now without `organizationName`?
- Does the receiver already have `organizationId`?
- Can the receiver read the name from organization state when rendering?

If the receiver has `organizationId` or can read the name from organization state, and there is no current blocking reason to inline it, delete `organizationName`.
