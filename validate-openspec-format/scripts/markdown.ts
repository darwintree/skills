// Adapted from Fission-AI/OpenSpec under the MIT license in ../LICENSE.OpenSpec.

export interface Section {
  title: string;
  headerLine: number;
  lines: string[];
}

export interface RequirementBlock {
  name: string;
  line: number;
  lines: string[];
}

export interface ParsedRequirements {
  blocks: RequirementBlock[];
  skippedHeaders: Array<{ title: string; line: number }>;
}

interface ActiveFence {
  marker: string;
  length: number;
}

const REQUIREMENT_HEADER = /^ {0,3}###(?!#)[ \t]+Requirement:[ \t]*(.+?)[ \t]*$/i;

export function normalizeContent(content: string): string {
  return content.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
}

export function buildCodeFenceMask(lines: string[]): boolean[] {
  const mask = new Array<boolean>(lines.length).fill(false);
  let active: ActiveFence | null = null;

  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(/^\s*(~{3,})/);
    const tickMatch = lines[index].match(/^\s*(\x60{3,})/);
    const marker = match?.[1] ?? tickMatch?.[1];

    if (!active) {
      if (marker) {
        active = { marker: marker[0], length: marker.length };
        mask[index] = true;
      }
      continue;
    }

    mask[index] = true;
    if (marker && marker[0] === active.marker && marker.length >= active.length && /^\s*(?:~{3,}|\x60{3,})\s*$/.test(lines[index])) {
      active = null;
    }
  }

  return mask;
}

export function parseLevelTwoSections(content: string): Section[] {
  const lines = normalizeContent(content).split('\n');
  const mask = buildCodeFenceMask(lines);
  const headers: Array<{ title: string; index: number }> = [];

  for (let index = 0; index < lines.length; index++) {
    if (mask[index]) continue;
    const match = lines[index].match(/^ {0,3}##(?!#)[ \t]+(.+?)[ \t]*$/);
    if (match) headers.push({ title: match[1].replace(/[ \t]+#+[ \t]*$/, '').trim(), index });
  }

  return headers.map((header, index) => ({
    title: header.title,
    headerLine: header.index + 1,
    lines: lines.slice(header.index + 1, headers[index + 1]?.index ?? lines.length),
  }));
}

export function findSection(content: string, title: string): Section | undefined {
  const wanted = title.toLowerCase();
  return parseLevelTwoSections(content).find(section => section.title.toLowerCase() === wanted);
}

export function parseRequirementBlocks(section: Section): ParsedRequirements {
  const mask = buildCodeFenceMask(section.lines);
  const blocks: RequirementBlock[] = [];
  const skippedHeaders: Array<{ title: string; line: number }> = [];
  let index = 0;

  while (index < section.lines.length) {
    if (!mask[index]) {
      const header = section.lines[index].match(REQUIREMENT_HEADER);
      const otherLevelThree = section.lines[index].match(/^ {0,3}###(?!#)[ \t]+(.+?)[ \t]*$/);

      if (header) {
        const start = index;
        index++;
        while (index < section.lines.length) {
          if (!mask[index] && /^ {0,3}#{1,3}(?!#)[ \t]+/.test(section.lines[index])) break;
          index++;
        }
        blocks.push({
          name: normalizeRequirementName(header[1]),
          line: section.headerLine + start + 1,
          lines: section.lines.slice(start, index),
        });
        continue;
      }

      if (otherLevelThree) {
        skippedHeaders.push({ title: otherLevelThree[1].trim(), line: section.headerLine + index + 1 });
      }
    }
    index++;
  }

  return { blocks, skippedHeaders };
}

export function extractRequirementBody(block: RequirementBlock): string {
  const lines = block.lines.slice(1);
  const mask = buildCodeFenceMask(lines);
  const body: string[] = [];
  const metadata: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    if (mask[index]) continue;
    if (/^ {0,3}#{1,6}(?!#)[ \t]+/.test(lines[index])) break;
    const line = lines[index].trim();
    if (!line) continue;
    if (/^\*\*[^*]+\*\*:/.test(line)) metadata.push(line);
    else body.push(line);
  }

  return (body.length ? body : metadata).join('\n');
}

export function countScenarios(block: RequirementBlock): number {
  const mask = buildCodeFenceMask(block.lines);
  return block.lines.reduce(
    (count, line, index) => count + (!mask[index] && /^ {0,3}####(?!#)[ \t]+/.test(line) ? 1 : 0),
    0,
  );
}

export function containsShallOrMust(text: string): boolean {
  return /\b(?:SHALL|MUST)\b/.test(text);
}

export function normalizeRequirementName(name: string): string {
  return name.trim();
}

export function foldRequirementName(name: string): string {
  return normalizeRequirementName(name).toLowerCase().replace(/\s+/g, ' ');
}
