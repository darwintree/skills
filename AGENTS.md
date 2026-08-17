# Skill source

When asked to modify a skill, first look for its directory in the current repository. If present, edit that local source; use an installed copy only when no local source exists or the user explicitly requests it.

# Skill invocation compatibility

For a user-invoked skill, set both invocation controls:

- Add `disable-model-invocation: true` to `SKILL.md` frontmatter.
- Add `policy.allow_implicit_invocation: false` to `agents/openai.yaml`.

Keep both fields even if a validator rejects `disable-model-invocation`; they support different skill runtimes.
