import { describe, expect, it } from 'vitest';
import sourcesRaw from '../../data/sources/index.json';
import { SourceCards, formatDate } from '../../src/home/trust/sourceCards';

const cards = SourceCards.fromData();

describe('SourceCards', () => {
  it('builds the four cards with the titles the user chose', () => {
    expect(cards.build().map((c) => c.title)).toEqual(['HCD letters', 'ADU Handbook', 'Gov. Code', 'City pages']);
  });

  it('resolves every card to real sources with a checked date', () => {
    const ids = new Set((sourcesRaw as { id: string }[]).map((s) => s.id));
    for (const card of cards.build()) {
      expect(card.sourceIds.length).toBeGreaterThan(0);
      for (const id of card.sourceIds) expect(ids.has(id)).toBe(true);
      expect(card.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('takes letter cities and dates from the sources', () => {
    const letters = cards.build()[0]!.docs.map((d) => [d.label, d.date]);
    expect(letters).toEqual([
      ['Irvine', '2025-03-27'],
      ['Dana Point', '2023-04-17'],
      ['Orange', '2026-05-05'],
    ]);
  });

  it('shows statute numbers from the source ids and no date for them', () => {
    const law = cards.build()[2]!.docs;
    expect(law.map((d) => d.label)).toEqual(['66315', '66317', '66333']);
    expect(law.every((d) => d.date === undefined)).toBe(true);
  });

  it('shows no date for a source whose date is UNKNOWN', () => {
    const web = cards.build()[3]!.docs;
    expect(web.find((d) => d.tag === 'IRVINE')!.date).toBeUndefined();
    expect(web.find((d) => d.tag === 'ANAHEIM')!.date).toBe('Nov 2025');
  });

  it('fails loudly on an unknown source id', () => {
    expect(() => cards.source('no-such-source')).toThrow(/no-such-source/);
  });

  it('formats dates', () => {
    expect(formatDate('2026-03', 'long')).toBe('March 2026');
    expect(formatDate('2025-11', 'short')).toBe('Nov 2025');
    expect(formatDate('2023-04-17', 'short')).toBe('2023-04-17');
    expect(formatDate('UNKNOWN', 'short')).toBeUndefined();
    expect(formatDate(null, 'short')).toBeUndefined();
  });
});
