// Adapted from Fission-AI/OpenSpec under the MIT license in ../LICENSE.OpenSpec.

import { basename, dirname, extname } from 'node:path';
import { parseDeltaPlan } from './delta.ts';
import {
  buildCodeFenceMask,
  findSection,
  foldRequirementName,
  normalizeContent,
  normalizeRequirementName,
  parseRequirementBlocks,
  type RequirementBlock,
} from './markdown.ts';
import {
  validateChangeContent,
  validateSpecContent,
  type ValidationReport,
} from './validators.ts';

export class ApplyError extends Error {
  constructor(message: string, readonly report?: ValidationReport) {
    super(message);
    this.name = 'ApplyError';
  }
}

export interface ApplyResult {
  content: string;
  created: boolean;
  counts: { added: number; modified: number; removed: number; renamed: number };
  warnings: string[];
  report: ValidationReport;
}

function blockContent(block: RequirementBlock): string {
  return block.lines.join('\n').trim();
}

function scenarioNames(block: RequirementBlock): string[] {
  const mask = buildCodeFenceMask(block.lines);
  const names: string[] = [];
  for (let index = 0; index < block.lines.length; index++) {
    if (mask[index]) continue;
    const match = block.lines[index].match(/^ {0,3}####(?!#)[ \t]+(.+?)[ \t]*$/);
    if (!match) continue;
    names.push(match[1].replace(/[ \t]+#+[ \t]*$/, '').replace(/^Scenario:\s*/i, '').trim());
  }
  return names;
}

function missingScenarios(current: RequirementBlock, incoming: RequirementBlock): string[] {
  const remaining = new Map<string, number>();
  for (const name of scenarioNames(incoming)) remaining.set(name, (remaining.get(name) ?? 0) + 1);

  const missing: string[] = [];
  for (const name of scenarioNames(current)) {
    const count = remaining.get(name) ?? 0;
    if (count === 0) missing.push(name);
    else remaining.set(name, count - 1);
  }
  return missing;
}

function specNameFromPath(destPath: string): string {
  const filename = basename(destPath);
  return filename.toLowerCase() === 'spec.md'
    ? basename(dirname(destPath))
    : basename(destPath, extname(destPath));
}

function changeNameFromPath(changePath: string): string {
  return basename(changePath, extname(changePath));
}

function newSpec(destPath: string, changePath: string, purpose: string | undefined): string {
  const specName = specNameFromPath(destPath);
  const overview = purpose ?? 'TBD - created by applying change ' + changeNameFromPath(changePath) + '. Update Purpose after apply.';
  return '# ' + specName + ' Specification\n\n## Purpose\n' + overview + '\n\n## Requirements\n';
}

function rebuildSpec(content: string, blocks: RequirementBlock[]): string {
  const normalized = normalizeContent(content);
  const section = findSection(normalized, 'Requirements');
  if (!section) throw new ApplyError('Destination spec has no ## Requirements section');

  const lines = normalized.split('\n');
  const headerIndex = section.headerLine - 1;
  const suffixIndex = headerIndex + 1 + section.lines.length;
  const parsed = parseRequirementBlocks(section);
  const firstBlock = parsed.blocks[0];
  const preambleLength = firstBlock ? firstBlock.line - section.headerLine - 1 : section.lines.length;
  const preamble = section.lines.slice(0, preambleLength).join('\n').trimEnd();
  const body = [preamble, ...blocks.map(blockContent)].filter(Boolean).join('\n\n');
  const prefix = lines.slice(0, headerIndex + 1).join('\n').trimEnd();
  const suffix = lines.slice(suffixIndex).join('\n').trim();
  return [prefix, body, suffix].filter(Boolean).join('\n\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

export function applyDelta(
  changePath: string,
  changeContent: string,
  destPath: string,
  destContent: string | undefined,
  strict = false,
): ApplyResult {
  const changeReport = validateChangeContent(changePath, changeContent, strict);
  if (!changeReport.valid) throw new ApplyError('Change validation failed', changeReport);

  const plan = parseDeltaPlan(changeContent);
  const created = destContent === undefined;
  const warnings: string[] = [];
  const counts = { added: 0, modified: 0, removed: 0, renamed: 0 };

  if (created && (plan.modified.length > 0 || plan.renamed.length > 0)) {
    throw new ApplyError('A new destination accepts only ADDED requirements');
  }

  let base = destContent ?? newSpec(destPath, changePath, plan.purpose);
  if (destContent !== undefined) {
    const destinationReport = validateSpecContent(destPath, destContent, strict);
    if (!destinationReport.valid) throw new ApplyError('Destination spec validation failed', destinationReport);
    if (plan.purpose) warnings.push('Delta Purpose ignored because the destination already exists');
  } else if (plan.removed.length > 0) {
    warnings.push('REMOVED requirements ignored because the destination does not exist');
  }

  const requirements = findSection(base, 'Requirements');
  if (!requirements) throw new ApplyError('Destination spec has no ## Requirements section');
  const originalBlocks = parseRequirementBlocks(requirements).blocks;
  const blocks = new Map(originalBlocks.map(block => [normalizeRequirementName(block.name), block]));
  const order = originalBlocks.map(block => normalizeRequirementName(block.name));

  for (const rename of plan.renamed) {
    const from = normalizeRequirementName(rename.from);
    const to = normalizeRequirementName(rename.to);
    const block = blocks.get(from);
    if (!block) {
      if (blocks.has(to)) continue;
      throw new ApplyError('RENAMED source not found: "' + rename.from + '"');
    }
    if (blocks.has(to)) throw new ApplyError('RENAMED target already exists: "' + rename.to + '"');
    const renamed = { ...block, name: to, lines: ['### Requirement: ' + to, ...block.lines.slice(1)] };
    blocks.delete(from);
    blocks.set(to, renamed);
    const index = order.indexOf(from);
    if (index >= 0) order[index] = to;
    counts.renamed++;
  }

  for (const removed of plan.removed) {
    const name = normalizeRequirementName(removed.name);
    if (!blocks.has(name)) {
      if (!created) {
        const nearMiss = [...blocks.keys()].find(existing => foldRequirementName(existing) === foldRequirementName(name));
        if (nearMiss) throw new ApplyError('REMOVED requirement not found exactly; destination contains "' + nearMiss + '"');
        warnings.push('REMOVED requirement already absent: "' + removed.name + '"');
      }
      continue;
    }
    blocks.delete(name);
    counts.removed++;
  }

  for (const modified of plan.modified) {
    const name = normalizeRequirementName(modified.name);
    const current = blocks.get(name);
    if (!current) throw new ApplyError('MODIFIED requirement not found: "' + modified.name + '"');
    const missing = missingScenarios(current, modified);
    if (missing.length > 0) {
      throw new ApplyError('MODIFIED requirement "' + modified.name + '" omits scenario(s): ' + missing.join(', '));
    }
    if (blockContent(current) !== blockContent(modified)) counts.modified++;
    blocks.set(name, modified);
  }

  for (const added of plan.added) {
    const name = normalizeRequirementName(added.name);
    const current = blocks.get(name);
    if (current) {
      if (blockContent(current) === blockContent(added)) continue;
      throw new ApplyError('ADDED requirement already exists with different content: "' + added.name + '"');
    }
    blocks.set(name, added);
    order.push(name);
    counts.added++;
  }

  const finalBlocks = order.flatMap(name => {
    const block = blocks.get(name);
    return block ? [block] : [];
  });
  if (finalBlocks.length === 0) throw new ApplyError('Apply would leave the destination with no requirements');

  base = rebuildSpec(base, finalBlocks);
  const report = validateSpecContent(destPath, base, strict);
  if (!report.valid) throw new ApplyError('Applied spec validation failed', report);

  return { content: base, created, counts, warnings, report };
}
