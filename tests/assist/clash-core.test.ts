import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CITIES } from '../../src/contract/types';
import type { CityRun, Flag } from '../../src/contract/types';
import { runCheck } from '../../src/contract/api';
import {
  buildClashPrompt,
  clashGroups,
  excerptText,
  knownNumbers,
  letterSourceId,
  validateClash,
  type ClashInput,
} from '../../src/assist/clash-core';

function flag(itemId: string, status: Flag['status'], ruleId: string | null, sources: string[] = []): Flag {
  return {
    itemId,
    itemText: `line ${itemId}`,
    status,
    ruleId,
    citations: sources.map((sourceId) => ({ sourceId, label: sourceId, url: 'https://example.org', checked: '2026-11-07' })),
  };
}

const run = {
  flags: [
    flag('a', 'CONFLICTS', 'r1'),
    flag('b', 'OK', 'r9'),
    flag('c', 'CONFLICTS', 'r2'),
    flag('d', 'CONFLICTS', 'r1'),
    flag('e', 'UNKNOWN', null),
  ],
} as unknown as CityRun;

const input: ClashInput = {
  city: 'irvine',
  cityName: 'Irvine',
  pathway: 'ADU',
  ruleId: 'r1',
  itemIds: ['a', 'd'],
  cityLines: ['Only 2 units are allowed on a lot.'],
  why: 'The state allows more than 2 units.',
  note: null,
  letter: { title: 'HCD letter', text: 'The city must allow 3 units.' },
  deadlines: [{ label: 'Decision', value: '60 days' }],
  typical: [{ label: 'Plan check', value: '2 months' }],
};

const good = {
  title: 'Two unit cap',
  citySays: 'The city says only 2 units fit on a lot.',
  stateSays: 'The state says the city must allow 3 units.',
  clash: 'The city rule is stricter than the state, so you may be turned away.',
  time: { low: 1, high: 2, unit: 'months', basis: 'It rests on the 60 days decision deadline.' },
};

describe('clashGroups', () => {
  it('groups CONFLICTS flags by rule in order of first appearance', () => {
    const groups = clashGroups(run);
    expect(groups.map((g) => g.ruleId)).toEqual(['r1', 'r2']);
    expect(groups[0]?.flags.map((f) => f.itemId)).toEqual(['a', 'd']);
  });
});

describe('letterSourceId', () => {
  it('picks the most cited hcd- source', () => {
    const flags = [flag('a', 'CONFLICTS', 'r', ['gov-1', 'hcd-x', 'gov-1']), flag('b', 'CONFLICTS', 'r', ['hcd-y', 'hcd-y'])];
    expect(letterSourceId(flags)).toBe('hcd-y');
  });
  it('is null with no hcd- source', () => {
    expect(letterSourceId([flag('a', 'CONFLICTS', 'r', ['gov-1'])])).toBeNull();
  });
});

describe('excerptText', () => {
  it('cuts at the next level 2 heading', () => {
    const md = '# T\n\n## Excerpts\n\nbody one\n\n## Notes\n\nignored\n';
    expect(excerptText(md)).toBe('## Excerpts\n\nbody one\n\n');
  });
  it('runs to the end when no heading follows', () => {
    expect(excerptText('# T\n## Excerpts\nbody')).toBe('## Excerpts\nbody');
  });
});

describe('knownNumbers', () => {
  it('collects numbers from every given text', () => {
    const known = knownNumbers(input);
    for (const n of ['2', '3', '60']) expect(known.has(n)).toBe(true);
    expect(known.has('99')).toBe(false);
  });
});

describe('buildClashPrompt', () => {
  const prompt = buildClashPrompt(input);
  it('carries the lines, reason, letter, deadlines and typical times', () => {
    expect(prompt).toContain('Irvine');
    expect(prompt).toContain('Only 2 units are allowed on a lot.');
    expect(prompt).toContain('The state allows more than 2 units.');
    expect(prompt).toContain('The city must allow 3 units.');
    expect(prompt).toContain('Deadlines in state law');
    expect(prompt).toContain('60 days');
    expect(prompt).toContain('Typical times, an estimate from the event brief, not measured');
  });
  it('states the task and the reply shape', () => {
    expect(prompt).toContain('title');
    expect(prompt).toContain(
      '{"title": "...", "citySays": "...", "stateSays": "...", "clash": "...", "time": {"low": 1, "high": 2, "unit": "months", "basis": "..."}}',
    );
  });
});

describe('validateClash', () => {
  const reject = (patch: Record<string, unknown>, reason: string): void => {
    const res = validateClash({ ...good, ...patch }, input);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toContain(reason);
  };
  const withTime = (patch: Record<string, unknown>) => ({ time: { ...good.time, ...patch } });

  it('accepts a good reply and fills city, ruleId and itemIds', () => {
    const res = validateClash(good, input);
    expect(res).toEqual({ ok: true, summary: { ...good, city: 'irvine', ruleId: 'r1', itemIds: ['a', 'd'] } });
  });
  it('rejects non-objects and missing fields', () => {
    expect(validateClash(null, input).ok).toBe(false);
    reject({ clash: '   ' }, 'clash');
  });
  it('rejects a long or dotted title', () => {
    reject({ title: 'This title has too many words' }, 'title');
    reject({ title: 'Two unit cap.' }, 'title');
  });
  it('rejects a citation', () => reject({ stateSays: 'See Government Code for 3 units.' }, 'stateSays'));
  it('rejects a number the sources do not give', () => reject({ citySays: 'The city says 7 units.' }, 'citySays'));
  it('rejects an em dash and an en dash', () => {
    reject({ clash: 'It clashes — badly.' }, 'clash');
    reject({ clash: 'It clashes – badly.' }, 'clash');
  });
  it('rejects text over 280 characters', () => reject({ clash: 'a'.repeat(281) }, 'clash'));
  it('rejects a bad basis', () => reject(withTime({ basis: 'It rests on 45 days.' }), 'basis'));
  it('rejects low above high', () => reject(withTime({ low: 3, high: 2 }), 'time'));
  it('rejects a bad unit', () => reject(withTime({ unit: 'days' }), 'time'));
  it('rejects non-integer or zero values', () => {
    reject(withTime({ low: 0 }), 'time');
    reject(withTime({ high: 1.5 }), 'time');
  });
  it('rejects too many months or weeks', () => {
    reject(withTime({ high: 13 }), 'time');
    reject(withTime({ unit: 'weeks', high: 53 }), 'time');
  });
});

describe('real data', () => {
  const index = JSON.parse(readFileSync('data/sources/index.json', 'utf8')) as { id: string; file?: string }[];
  it('every clash group in every city has a letter source with a file', () => {
    for (const city of CITIES) {
      for (const g of clashGroups(runCheck(city))) {
        const id = letterSourceId(g.flags);
        expect(id, `${city} ${g.ruleId}`).not.toBeNull();
        expect(index.find((s) => s.id === id)?.file, `${city} ${g.ruleId}`).toBeTruthy();
      }
    }
  });
});
