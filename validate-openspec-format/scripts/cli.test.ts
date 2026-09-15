import { describe, expect, test } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ApplyError, applyDelta } from './apply.ts';
import { validateChangeContent, validateSpecContent } from './validators.ts';

const validSpec = [
  '# Retry Spec',
  '',
  '## Purpose',
  'Define predictable request retries so transient failures do not leak through to callers.',
  '',
  '## Requirements',
  '### Requirement: Retry transient failures',
  'The client SHALL retry a transient failure once.',
  '',
  '#### Scenario: First request fails',
  '- **WHEN** the first request fails transiently',
  '- **THEN** the client retries it once',
].join('\n');

const validChange = [
  '## ADDED Requirements',
  '### Requirement: Retry transient failures',
  'The client SHALL retry a transient failure once.',
  '',
  '#### Scenario: First request fails',
  '- **WHEN** the first request fails transiently',
  '- **THEN** the client retries it once',
].join('\n');

const applyTarget = [
  '# Account Specification',
  '',
  '## Purpose',
  'Define stable account behavior so callers can rely on predictable lifecycle operations.',
  '',
  '## Requirements',
  '### Requirement: Old name',
  'The system SHALL expose the old name.',
  '',
  '#### Scenario: Existing rename case',
  '- **WHEN** the feature is used',
  '- **THEN** the old name is visible',
  '',
  '### Requirement: Remove me',
  'The system SHALL expose removable behavior.',
  '',
  '#### Scenario: Existing removal case',
  '- **WHEN** the feature is used',
  '- **THEN** removable behavior is visible',
  '',
  '### Requirement: Update me',
  'The system SHALL expose the original behavior.',
  '',
  '#### Scenario: Kept case',
  '- **WHEN** the existing case occurs',
  '- **THEN** the original behavior remains',
].join('\n');

const tick = String.fromCharCode(96);
const applyChange = [
  '## RENAMED Requirements',
  '- FROM: ' + tick + '### Requirement: Old name' + tick,
  '- TO: ' + tick + '### Requirement: New name' + tick,
  '',
  '## REMOVED Requirements',
  '### Requirement: Remove me',
  '',
  '## MODIFIED Requirements',
  '### Requirement: Update me',
  'The system SHALL expose the updated behavior.',
  '',
  '#### Scenario: Kept case',
  '- **WHEN** the existing case occurs',
  '- **THEN** the updated behavior is visible',
  '',
  '#### Scenario: Added case',
  '- **WHEN** the new case occurs',
  '- **THEN** the updated behavior is visible',
  '',
  '## ADDED Requirements',
  '### Requirement: Added name',
  'The system SHALL expose added behavior.',
  '',
  '#### Scenario: Added requirement case',
  '- **WHEN** the added feature is used',
  '- **THEN** added behavior is visible',
].join('\n');

describe('OpenSpec format validation', () => {
  test('accepts a main spec', () => {
    expect(validateSpecContent('spec.md', validSpec).valid).toBe(true);
  });

  test('rejects a main spec without Purpose', () => {
    expect(validateSpecContent('spec.md', validSpec.replace(/## Purpose[\s\S]*?(?=## Requirements)/, '')).valid).toBe(false);
  });

  test('accepts a delta spec', () => {
    expect(validateChangeContent('change.md', validChange).valid).toBe(true);
  });

  test('rejects a delta requirement without a scenario', () => {
    const withoutScenario = validChange.replace(/\n#### Scenario:[\s\S]*/, '');
    expect(validateChangeContent('change.md', withoutScenario).valid).toBe(false);
  });

  test('runs validation through the CLI entrypoint', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openspec-validator-'));
    const file = join(directory, 'spec.md');
    await Bun.write(file, validSpec);

    try {
      const process = Bun.spawn(['bun', join(import.meta.dir, 'cli.ts'), 'validate', 'spec', file], {
        stdout: 'pipe',
        stderr: 'pipe',
      });
      const output = await new Response(process.stdout).text();
      expect(await process.exited).toBe(0);
      expect(output).toContain('VALID errors=0');

      await Bun.write(file, '# Invalid spec');
      const invalid = Bun.spawn(['bun', join(import.meta.dir, 'cli.ts'), 'validate', 'spec', file], {
        stdout: 'pipe',
        stderr: 'pipe',
      });
      const invalidOutput = await new Response(invalid.stdout).text();
      expect(await invalid.exited).toBe(1);
      expect(invalidOutput).toContain('INVALID errors=');
    } finally {
      await rm(directory, { recursive: true });
    }
  });

  test('applies every delta operation and is idempotent', () => {
    const first = applyDelta('change.md', applyChange, 'account/spec.md', applyTarget);
    expect(first.counts).toEqual({ added: 1, modified: 1, removed: 1, renamed: 1 });
    expect(first.content).toContain('### Requirement: New name');
    expect(first.content).toContain('### Requirement: Added name');
    expect(first.content).not.toContain('### Requirement: Remove me');

    const second = applyDelta('change.md', applyChange, 'account/spec.md', first.content);
    expect(second.counts).toEqual({ added: 0, modified: 0, removed: 0, renamed: 0 });
    expect(second.content).toBe(first.content);
  });

  test('creates a new destination from ADDED requirements', () => {
    const result = applyDelta('add-retry.md', validChange, 'retry/spec.md', undefined);
    expect(result.created).toBe(true);
    expect(result.content).toContain('# retry Specification');
    expect(result.content).toContain('### Requirement: Retry transient failures');

    const named = applyDelta('add-retry.md', validChange, '/tmp/custom-name.md', undefined);
    expect(named.content).toContain('# custom-name Specification');
  });

  test('rejects MODIFIED scenario loss', () => {
    const lossy = applyChange.replace(/\n#### Scenario: Kept case[\s\S]*?(?=\n#### Scenario: Added case)/, '');
    expect(() => applyDelta('change.md', lossy, 'account/spec.md', applyTarget)).toThrow(ApplyError);
  });

  test('runs apply through the CLI entrypoint', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openspec-apply-'));
    const change = join(directory, 'change.md');
    const dest = join(directory, 'spec.md');
    await Bun.write(change, validChange);

    try {
      const process = Bun.spawn(['bun', join(import.meta.dir, 'cli.ts'), 'apply', change, dest], {
        stdout: 'pipe',
        stderr: 'pipe',
      });
      const output = await new Response(process.stdout).text();
      expect(await process.exited).toBe(0);
      expect(output).toContain('APPLIED ' + dest);
      expect(await Bun.file(dest).text()).toContain('### Requirement: Retry transient failures');
    } finally {
      await rm(directory, { recursive: true });
    }
  });
});
