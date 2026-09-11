# Skill source

When asked to modify a skill, first look for its directory in the current repository. If present, edit that local source; use an installed copy only when no local source exists or the user explicitly requests it.

# Skill invocation compatibility

Before changing invocation metadata, confirm whether the skill is intended to be user-invoked-only. Apply the following fields only when that intent is explicit or already established by the skill's requirements:

- Add `disable-model-invocation: true` to `SKILL.md` frontmatter.
- Add `policy.allow_implicit_invocation: false` to `agents/openai.yaml`.

For skills that may be implicitly invoked, preserve or omit these fields according to their existing invocation policy. Do not infer user-invoked-only behavior merely because the skill was mentioned by the user in the current task. Keep both fields together when the user-invoked-only policy applies, even if a validator rejects `disable-model-invocation`; they support different skill runtimes.
