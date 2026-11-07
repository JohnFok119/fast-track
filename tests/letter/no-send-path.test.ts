// Acceptance test 4: nothing in the app can send anything. Fast Track drafts; the applicant sends.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPLAIN_PATH, PLAN_PATH } from '../../src/assist/types';

const SRC = join(import.meta.dirname, '..', '..', 'src');
const FORBIDDEN = ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'mailto:', 'WebSocket', '<form', '.submit('];
// The only allowed network calls: same-origin POSTs from src/assist/client.ts to this app's own dev-server routes,
// which run Claude locally to explain flags (off unless FT_CLAUDE=1). Nothing reaches a city or a person.
const SAME_ORIGIN_CLIENT = join(SRC, 'assist', 'client.ts');
const SAME_ORIGIN_CALLS = ['fetch(EXPLAIN_PATH', 'fetch(PLAN_PATH'];

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

  it('allows network calls only to relative /api/ routes on this app\'s own server', () => {
    expect(EXPLAIN_PATH).toMatch(/^\/api\/[a-z]+$/);
    expect(PLAN_PATH).toMatch(/^\/api\/[a-z]+$/);
    const client = readFileSync(SAME_ORIGIN_CLIENT, 'utf8');
    for (const call of SAME_ORIGIN_CALLS) expect(client).toContain(call);
  });

  it.each(sourceFiles(SRC))('%s has no network, mail or form submit call', (file) => {
    let text = readFileSync(file, 'utf8');
    if (file === SAME_ORIGIN_CLIENT) for (const call of SAME_ORIGIN_CALLS) text = text.replaceAll(call, '');
    for (const needle of FORBIDDEN) {
      expect(text.includes(needle), `${file} contains "${needle}"`).toBe(false);
    }
  });
});
