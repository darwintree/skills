// Adapted from Fission-AI/OpenSpec under the MIT license in ../LICENSE.OpenSpec.

import {
  buildCodeFenceMask,
  findSection,
  normalizeRequirementName,
  parseLevelTwoSections,
  parseRequirementBlocks,
  type RequirementBlock,
  type Section,
} from './markdown.ts';

export interface DeltaPlan {
  purpose?: string;
  added: RequirementBlock[];
  modified: RequirementBlock[];
  removed: Array<{ name: string; line: number }>;
  renamed: Array<{ from: string; to: string; line: number }>;
  skippedHeaders: Array<{ title: string; line: number; section: string }>;
  parseErrors: Array<{ line: number; message: string }>;
  sectionPresence: {
    added: boolean;
    modified: boolean;
    removed: boolean;
    renamed: boolean;
  };
}

function sectionByTitle(sections: Section[], title: string): Section | undefined {
  const wanted = title.toLowerCase();
  return sections.find(section => section.title.toLowerCase() === wanted);
}

function parseRemoved(section: Section | undefined): Array<{ name: string; line: number }> {
  if (!section) return [];
  const mask = buildCodeFenceMask(section.lines);
  const removed: Array<{ name: string; line: number }> = [];

  for (let index = 0; index < section.lines.length; index++) {
    if (mask[index]) continue;
    const header = section.lines[index].match(/^ {0,3}###(?!#)[ \t]+Requirement:[ \t]*(.+?)[ \t]*$/i);
    const bullet = section.lines[index].match(/^\s*-\s*\x60?###\s*Requirement:\s*(.+?)\x60?\s*$/i);
    const name = header?.[1] ?? bullet?.[1];
    if (name) removed.push({ name: normalizeRequirementName(name), line: section.headerLine + index + 1 });
  }
  return removed;
}

function parseRenamed(section: Section | undefined): {
  pairs: Array<{ from: string; to: string; line: number }>;
  errors: Array<{ line: number; message: string }>;
} {
  if (!section) return { pairs: [], errors: [] };
  const mask = buildCodeFenceMask(section.lines);
  const pairs: Array<{ from: string; to: string; line: number }> = [];
  const errors: Array<{ line: number; message: string }> = [];
  let current: { from: string; line: number } | undefined;

  for (let index = 0; index < section.lines.length; index++) {
    if (mask[index]) continue;
    const from = section.lines[index].match(/^\s*-?\s*FROM:\s*\x60?###\s*Requirement:\s*(.+?)\x60?\s*$/i);
    const to = section.lines[index].match(/^\s*-?\s*TO:\s*\x60?###\s*Requirement:\s*(.+?)\x60?\s*$/i);

    if (from) {
      if (current) errors.push({ line: current.line, message: 'RENAMED FROM is missing its TO pair' });
      current = { from: normalizeRequirementName(from[1]), line: section.headerLine + index + 1 };
    } else if (to) {
      if (!current) errors.push({ line: section.headerLine + index + 1, message: 'RENAMED TO is missing its FROM pair' });
      else {
        pairs.push({ from: current.from, to: normalizeRequirementName(to[1]), line: current.line });
        current = undefined;
      }
    }
  }

  if (current) errors.push({ line: current.line, message: 'RENAMED FROM is missing its TO pair' });
  return { pairs, errors };
}

export function parseDeltaPlan(content: string): DeltaPlan {
  const sections = parseLevelTwoSections(content);
  const purposeSection = findSection(content, 'Purpose');
  const addedSection = sectionByTitle(sections, 'ADDED Requirements');
  const modifiedSection = sectionByTitle(sections, 'MODIFIED Requirements');
  const removedSection = sectionByTitle(sections, 'REMOVED Requirements');
  const renamedSection = sectionByTitle(sections, 'RENAMED Requirements');
  const added = addedSection ? parseRequirementBlocks(addedSection) : undefined;
  const modified = modifiedSection ? parseRequirementBlocks(modifiedSection) : undefined;
  const renamed = parseRenamed(renamedSection);

  return {
    purpose: purposeSection?.lines.join('\n').trim() || undefined,
    added: added?.blocks ?? [],
    modified: modified?.blocks ?? [],
    removed: parseRemoved(removedSection),
    renamed: renamed.pairs,
    skippedHeaders: [
      ...(added?.skippedHeaders ?? []).map(header => ({ ...header, section: 'ADDED Requirements' })),
      ...(modified?.skippedHeaders ?? []).map(header => ({ ...header, section: 'MODIFIED Requirements' })),
    ],
    parseErrors: renamed.errors,
    sectionPresence: {
      added: Boolean(addedSection),
      modified: Boolean(modifiedSection),
      removed: Boolean(removedSection),
      renamed: Boolean(renamedSection),
    },
  };
}
