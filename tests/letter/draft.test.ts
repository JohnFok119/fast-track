import { describe, expect, it } from 'vitest';
import { getEscalation, runCheck } from '../../src/contract/api';
import type { CityRun, Status } from '../../src/contract/types';
import { CITIES } from '../../src/contract/types';
import { conflictItems, draftCityReply, draftHcdRequest, itemsNeedingAttention } from '../../src/letter/draft';

const EM_DASH = String.fromCharCode(0x2014);

function unknownOnlyTexts(run: CityRun): string[] {
  const byItem = new Map<string, { text: string; allUnknown: boolean }>();
  for (const f of run.flags) {
    const prev = byItem.get(f.itemId);
    byItem.set(f.itemId, { text: f.itemText, allUnknown: (prev?.allUnknown ?? true) && f.status === 'UNKNOWN' });
  }
  return [...byItem.values()].filter((v) => v.allUnknown).map((v) => v.text.slice(0, 40));
}

describe.each(CITIES)('letter drafts for %s', (city) => {
  const run = runCheck(city);
  // The city reply covers conflicts and old law numbers; the HCD request covers conflicts only.
  const drafts: [string, string, Status[], number][] = [
    ['city reply', draftCityReply(run), ['CONFLICTS', 'OUTDATED_CITATION'], itemsNeedingAttention(run).length],
    ['HCD request', draftHcdRequest(run, getEscalation()), ['CONFLICTS'], conflictItems(run).length],
  ];

  it('lists every item with a conflict or an old law number, in city order', () => {
    const needs = new Set(
      run.flags.filter((f) => f.status === 'CONFLICTS' || f.status === 'OUTDATED_CITATION').map((f) => f.itemId),
    );
    expect(itemsNeedingAttention(run).map((i) => i.itemId)).toEqual([...needs]);
  });

  it.each(drafts)('%s cites every source behind the flags it covers', (_name, text, statuses) => {
    for (const flag of run.flags.filter((f) => statuses.includes(f.status))) {
      for (const c of flag.citations) {
        expect(text, `${flag.itemId} label`).toContain(c.label);
        expect(text, `${flag.itemId} url`).toContain(c.url);
      }
    }
  });

  it.each(drafts)('%s leaves out items with only UNKNOWN flags', (_name, text) => {
    for (const snippet of unknownOnlyTexts(run)) expect(text).not.toContain(snippet);
  });

  it.each(drafts)('%s is marked DRAFT, has placeholders and no em dash', (_name, text) => {
    expect(text).toContain('DRAFT. Review before sending. Not legal advice. Fast Track sends nothing.');
    expect(text).toContain('[Your name]');
    expect(text).not.toContain(EM_DASH);
  });

  it('HCD request leaves out lines whose only issue is an old law number', () => {
    const text = draftHcdRequest(run, getEscalation());
    const conflicting = new Set(conflictItems(run).map((i) => i.itemId));
    for (const item of itemsNeedingAttention(run).filter((i) => !conflicting.has(i.itemId))) {
      expect(text).not.toContain(item.text.slice(0, 40));
    }
  });

  it.each(drafts)('%s quotes each city line with balanced quote marks', (_name, text, _statuses, count) => {
    const quoted = text.split('\n').filter((line) => /^\d+\. "/.test(line));
    expect(quoted.length).toBe(count);
    for (const line of quoted) expect((line.match(/"/g) ?? []).length % 2, line).toBe(0);
  });
});

describe('letter drafts with nothing to answer', () => {
  it('say no line needs a response and stay marked DRAFT', () => {
    const run: CityRun = { ...runCheck('irvine'), flags: [] };
    for (const text of [draftCityReply(run), draftHcdRequest(run, getEscalation())]) {
      expect(text).toContain('no line');
      expect(text).toContain('DRAFT. Review before sending.');
    }
  });
});
