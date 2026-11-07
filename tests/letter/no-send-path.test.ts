// Acceptance test 4: nothing in the app can send anything. Fast Track drafts; the applicant sends.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(import.meta.dirname, '..', '..', 'src');
const FORBIDDEN = ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'mailto:', 'WebSocket', '<form', '.submit('];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe('acceptance test 4: no send path in src', () => {
  it('finds source files to check', () => {
    expect(sourceFiles(SRC).length).toBeGreaterThan(0);
  });

  it.each(sourceFiles(SRC))('%s has no network, mail or form submit call', (file) => {
    const text = readFileSync(file, 'utf8');
    for (const needle of FORBIDDEN) {
      expect(text.includes(needle), `${file} contains "${needle}"`).toBe(false);
    }
  });
});
