#!/usr/bin/env bun

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { ApplyError, applyDelta } from './apply.ts';
import { validateChangeContent, validateSpecContent, type ValidationReport } from './validators.ts';

const USAGE = [
  'Usage:',
  '  bun cli.ts validate <spec|change> <file> [--strict]',
  '  bun cli.ts apply <change-file> <dest-file> [--strict]',
].join('\n');

function printReport(report: ValidationReport): void {
  for (const issue of report.issues) {
    const location = issue.path + (issue.line ? ':' + issue.line : '');
    console.log(issue.level + ' ' + location + ' ' + issue.message);
  }
  console.log(
    (report.valid ? 'VALID' : 'INVALID') +
      ' errors=' + report.summary.errors +
      ' warnings=' + report.summary.warnings +
      ' info=' + report.summary.info,
  );
}

export async function run(argv: string[]): Promise<number> {
  if (argv.length === 1 && (argv[0] === '--help' || argv[0] === '-h')) {
    console.log(USAGE);
    return 0;
  }

  const [command, kind, filePath, ...options] = argv;
  const strict = options.includes('--strict');
  const unknownOptions = options.filter(option => option !== '--strict');

  if (command === 'apply') {
    const changePath = kind;
    const destPath = filePath;
    if (!changePath || !destPath || unknownOptions.length > 0) {
      console.error(USAGE);
      return 2;
    }
    if (resolve(changePath) === resolve(destPath)) {
      console.error('Change and destination must be different files');
      return 2;
    }

    const changeFile = Bun.file(changePath);
    if (!(await changeFile.exists())) {
      console.error('File not found: ' + changePath);
      return 2;
    }

    let changeContent: string;
    let destContent: string | undefined;
    try {
      changeContent = await changeFile.text();
      const destFile = Bun.file(destPath);
      destContent = (await destFile.exists()) ? await destFile.text() : undefined;
    } catch (error) {
      console.error('Could not read apply input: ' + (error instanceof Error ? error.message : String(error)));
      return 2;
    }

    let result;
    try {
      result = applyDelta(changePath, changeContent, destPath, destContent, strict);
    } catch (error) {
      if (error instanceof ApplyError) {
        if (error.report) printReport(error.report);
        console.error('Apply failed: ' + error.message);
        return 1;
      }
      throw error;
    }

    try {
      await mkdir(dirname(resolve(destPath)), { recursive: true });
      await writeFile(destPath, result.content);
    } catch (error) {
      console.error('Could not write ' + destPath + ': ' + (error instanceof Error ? error.message : String(error)));
      return 2;
    }

    for (const warning of result.warnings) console.log('WARNING ' + warning);
    for (const issue of result.report.issues) {
      if (issue.level !== 'ERROR') {
        const location = issue.path + (issue.line ? ':' + issue.line : '');
        console.log(issue.level + ' ' + location + ' ' + issue.message);
      }
    }
    const counts = result.counts;
    console.log(
      'APPLIED ' + destPath +
        ' created=' + result.created +
        ' added=' + counts.added +
        ' modified=' + counts.modified +
        ' removed=' + counts.removed +
        ' renamed=' + counts.renamed,
    );
    return 0;
  }

  if (command !== 'validate' || (kind !== 'spec' && kind !== 'change') || !filePath || unknownOptions.length > 0) {
    console.error(USAGE);
    return 2;
  }

  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    console.error('File not found: ' + filePath);
    return 2;
  }

  let content: string;
  try {
    content = await file.text();
  } catch (error) {
    console.error('Could not read ' + filePath + ': ' + (error instanceof Error ? error.message : String(error)));
    return 2;
  }

  const report = kind === 'spec'
    ? validateSpecContent(filePath, content, strict)
    : validateChangeContent(filePath, content, strict);
  printReport(report);
  return report.valid ? 0 : 1;
}

if (import.meta.main) process.exitCode = await run(Bun.argv.slice(2));
