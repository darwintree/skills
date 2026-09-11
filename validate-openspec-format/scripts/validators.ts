// Adapted from Fission-AI/OpenSpec under the MIT license in ../LICENSE.OpenSpec.

import {
  buildCodeFenceMask,
  containsShallOrMust,
  countScenarios,
  extractRequirementBody,
  findSection,
  foldRequirementName,
  normalizeContent,
  normalizeRequirementName,
  parseRequirementBlocks,
  type RequirementBlock,
} from './markdown.ts';
import { parseDeltaPlan } from './delta.ts';

export type ValidationLevel = 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationIssue {
  level: ValidationLevel;
  path: string;
  message: string;
  line?: number;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
  summary: { errors: number; warnings: number; info: number };
}

const MIN_PURPOSE_LENGTH = 50;
const MAX_REQUIREMENT_TEXT_LENGTH = 500;
const DELTA_TITLES = ['ADDED Requirements', 'MODIFIED Requirements', 'REMOVED Requirements', 'RENAMED Requirements'] as const;

function createReport(issues: ValidationIssue[]): ValidationReport {
  const summary = {
    errors: issues.filter(issue => issue.level === 'ERROR').length,
    warnings: issues.filter(issue => issue.level === 'WARNING').length,
    info: issues.filter(issue => issue.level === 'INFO').length,
  };
  return { valid: summary.errors === 0, issues, summary };
}

function addKeywordIssue(
  issues: ValidationIssue[],
  path: string,
  block: RequirementBlock,
  body: string,
  strict: boolean,
): void {
  if (!body) {
    issues.push({ level: 'ERROR', path, line: block.line, message: 'Requirement "' + block.name + '" is missing requirement text' });
  } else if (!containsShallOrMust(body)) {
    issues.push({
      level: strict ? 'ERROR' : 'WARNING',
      path,
      line: block.line,
      message: 'Requirement "' + block.name + '" should contain SHALL or MUST in its body',
    });
  }
}

function validateRequirementBlock(
  issues: ValidationIssue[],
  path: string,
  block: RequirementBlock,
  strict: boolean,
): void {
  const body = extractRequirementBody(block);
  addKeywordIssue(issues, path, block, body, strict);

  if (countScenarios(block) === 0) {
    issues.push({ level: 'ERROR', path, line: block.line, message: 'Requirement "' + block.name + '" must include at least one scenario' });
  }
  if (body.length > MAX_REQUIREMENT_TEXT_LENGTH) {
    issues.push({ level: 'INFO', path, line: block.line, message: 'Requirement "' + block.name + '" is very long; consider splitting it' });
  }
}

export function validateSpecContent(path: string, content: string, strict = false): ValidationReport {
  const issues: ValidationIssue[] = [];
  const normalized = normalizeContent(content);
  const purpose = findSection(normalized, 'Purpose');
  const requirements = findSection(normalized, 'Requirements');

  if (!purpose) {
    issues.push({ level: 'ERROR', path, message: 'Spec must have a ## Purpose section' });
  } else {
    const purposeText = purpose.lines.join('\n').trim();
    if (!purposeText) issues.push({ level: 'ERROR', path, line: purpose.headerLine, message: 'Purpose section cannot be empty' });
    else if (purposeText.length < MIN_PURPOSE_LENGTH) issues.push({ level: 'WARNING', path, line: purpose.headerLine, message: 'Purpose section is brief (less than 50 characters)' });
  }

  if (!requirements) {
    issues.push({ level: 'ERROR', path, message: 'Spec must have a ## Requirements section' });
  } else {
    const parsed = parseRequirementBlocks(requirements);
    if (parsed.blocks.length === 0) {
      issues.push({ level: 'ERROR', path, line: requirements.headerLine, message: 'Spec must have at least one ### Requirement: block' });
    }
    for (const skipped of parsed.skippedHeaders) {
      issues.push({ level: 'ERROR', path, line: skipped.line, message: 'Requirement header must use "### Requirement: <name>"' });
    }

    const names = new Set<string>();
    for (const block of parsed.blocks) {
      if (names.has(block.name)) {
        issues.push({ level: 'ERROR', path, line: block.line, message: 'Duplicate requirement: "' + block.name + '"' });
      }
      names.add(block.name);
      validateRequirementBlock(issues, path, block, strict);
    }
  }

  const lines = normalized.split('\n');
  const mask = buildCodeFenceMask(lines);
  const requirementStart = requirements?.headerLine ?? -1;
  const requirementEnd = requirements ? requirements.headerLine + requirements.lines.length : -1;

  for (let index = 0; index < lines.length; index++) {
    if (mask[index]) continue;
    if (/^ {0,3}##(?!#)[ \t]+(?:ADDED|MODIFIED|REMOVED|RENAMED)[ \t]+Requirements[ \t]*$/i.test(lines[index])) {
      issues.push({ level: 'ERROR', path, line: index + 1, message: 'Delta headers are not valid in a main spec' });
    }
    if (/^ {0,3}###(?!#)[ \t]+Requirement:[ \t]*.+$/i.test(lines[index])) {
      const line = index + 1;
      if (line <= requirementStart || line > requirementEnd) {
        issues.push({ level: 'ERROR', path, line, message: 'Requirement appears outside the ## Requirements section' });
      }
    }
  }

  return createReport(issues);
}

function validateDeltaBlocks(
  issues: ValidationIssue[],
  path: string,
  operation: 'ADDED' | 'MODIFIED',
  blocks: RequirementBlock[],
  strict: boolean,
): Set<string> {
  const names = new Set<string>();
  for (const block of blocks) {
    const name = normalizeRequirementName(block.name);
    if (names.has(name)) issues.push({ level: 'ERROR', path, line: block.line, message: 'Duplicate requirement in ' + operation + ': "' + block.name + '"' });
    names.add(name);
    validateRequirementBlock(issues, path, block, strict);
  }
  return names;
}

export function validateChangeContent(path: string, content: string, strict = false): ValidationReport {
  const issues: ValidationIssue[] = [];
  const plan = parseDeltaPlan(content);
  const presence = plan.sectionPresence;

  if (!presence.added && !presence.modified && !presence.removed && !presence.renamed) {
    issues.push({ level: 'ERROR', path, message: 'No delta sections found; expected ADDED, MODIFIED, REMOVED, or RENAMED Requirements' });
    return createReport(issues);
  }

  for (const error of plan.parseErrors) {
    issues.push({ level: 'ERROR', path, line: error.line, message: error.message });
  }
  for (const skipped of plan.skippedHeaders) {
    issues.push({
      level: 'INFO',
      path,
      line: skipped.line,
      message: 'Ignored non-canonical requirement header "### ' + skipped.title + '" in ' + skipped.section,
    });
  }

  if (presence.added && plan.added.length === 0) issues.push({ level: 'ERROR', path, message: 'Delta section "' + DELTA_TITLES[0] + '" has no recognized entries' });
  if (presence.modified && plan.modified.length === 0) issues.push({ level: 'ERROR', path, message: 'Delta section "' + DELTA_TITLES[1] + '" has no recognized entries' });
  if (presence.removed && plan.removed.length === 0) issues.push({ level: 'ERROR', path, message: 'Delta section "' + DELTA_TITLES[2] + '" has no recognized entries' });
  if (presence.renamed && plan.renamed.length === 0) issues.push({ level: 'ERROR', path, message: 'Delta section "' + DELTA_TITLES[3] + '" has no recognized entries' });

  const addedNames = validateDeltaBlocks(issues, path, 'ADDED', plan.added, strict);
  const modifiedNames = validateDeltaBlocks(issues, path, 'MODIFIED', plan.modified, strict);
  const removedNames = new Set<string>();
  for (const item of plan.removed) {
    if (removedNames.has(item.name)) issues.push({ level: 'ERROR', path, line: item.line, message: 'Duplicate requirement in REMOVED: "' + item.name + '"' });
    removedNames.add(item.name);
  }

  const renamedFrom = new Set<string>();
  const renamedTo = new Set<string>();
  for (const pair of plan.renamed) {
    if (renamedFrom.has(pair.from)) issues.push({ level: 'ERROR', path, line: pair.line, message: 'Duplicate FROM in RENAMED: "' + pair.from + '"' });
    if (renamedTo.has(pair.to)) issues.push({ level: 'ERROR', path, line: pair.line, message: 'Duplicate TO in RENAMED: "' + pair.to + '"' });
    renamedFrom.add(pair.from);
    renamedTo.add(pair.to);
  }

  for (const name of modifiedNames) {
    if (removedNames.has(name)) issues.push({ level: 'ERROR', path, message: 'Requirement appears in both MODIFIED and REMOVED: "' + name + '"' });
    if (addedNames.has(name)) issues.push({ level: 'ERROR', path, message: 'Requirement appears in both ADDED and MODIFIED: "' + name + '"' });
  }
  for (const name of addedNames) {
    if (removedNames.has(name)) issues.push({ level: 'ERROR', path, message: 'Requirement appears in both ADDED and REMOVED: "' + name + '"' });
  }
  for (const pair of plan.renamed) {
    if (modifiedNames.has(pair.from)) issues.push({ level: 'ERROR', path, line: pair.line, message: 'MODIFIED must use the new name after RENAMED: "' + pair.to + '"' });
    if (addedNames.has(pair.to)) issues.push({ level: 'ERROR', path, line: pair.line, message: 'RENAMED TO collides with ADDED: "' + pair.to + '"' });
    const removedMatch = [...removedNames].find(name => foldRequirementName(name) === foldRequirementName(pair.from));
    if (removedMatch) issues.push({ level: 'ERROR', path, line: pair.line, message: 'Requirement appears in both RENAMED and REMOVED: "' + pair.from + '"' });
  }

  const total = plan.added.length + plan.modified.length + plan.removed.length + plan.renamed.length;
  if (total === 0) issues.push({ level: 'ERROR', path, message: 'Change must contain at least one parsed delta' });

  return createReport(issues);
}
