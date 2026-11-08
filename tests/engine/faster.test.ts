// Faster paths: every entry is sourced, unconfirmed ones say what is unchecked, and the SB 9 60-day deadline
// cites HCD's 2025 letter to Dana Point (page 2), which quotes Gov. Code 65852.21(h)(1).
import { describe, expect, it } from 'vitest';
import sourcesRaw from '../../data/sources/index.json';
import { getFasterPaths } from '../../src/contract/api';
import { PATHWAYS } from '../../src/contract/types';
import { loadFasterPaths } from '../../src/engine/faster';
import { loadSources } from '../../src/engine/load';

const SOURCES = loadSources(sourcesRaw);
const entry = (over: Record<string, unknown>) => ({ paths: [{ id: 'x', pathways: ['ADU'], title: 'T', text: 'Words.', status: 'CONFIRMED', sources: [{ sourceId: 'gov-66317' }], ...over }] });

describe('faster paths', () => {
  it.each(PATHWAYS)('%s: every path cites at least one dated source with a link', (pathway) => {
    const paths = getFasterPaths(pathway);
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) {
      expect(p.citations.length).toBeGreaterThan(0);
      for (const c of p.citations) {
        expect(c.url).toMatch(/^https:\/\//);
        expect(c.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      if (p.status === 'UNCONFIRMED') expect(p.caveat).toBeTruthy();
    }
  });

  it('SB 9: the 60-day deadline cites the HCD letter to Dana Point, page 2', () => {
    const p = getFasterPaths('SB9').find((x) => x.id === 'sb9-60-days');
    expect(p?.status).toBe('CONFIRMED');
    expect(p?.text).toContain('60 days');
    expect(p?.citations[0]).toMatchObject({ sourceId: 'hcd-dana-point-2025-09-15', page: '2', section: '65852.21(h)(1)' });
  });

  it('labels the secondary-source statute as not yet checked on leginfo', () => {
    const p = getFasterPaths('ADU').find((x) => x.id === 'third-party-plan-check');
    expect(p?.status).toBe('UNCONFIRMED');
    expect(p?.citations[0]?.label).toContain('not yet checked on leginfo');
  });

  it('refuses a path with no source', () => {
    expect(() => loadFasterPaths(entry({ sources: [] }), SOURCES)).toThrow(/no source, no path/);
  });

  it('refuses a source id that is not in the sources list', () => {
    expect(() => loadFasterPaths(entry({ sources: [{ sourceId: 'made-up' }] }), SOURCES)).toThrow(/no source, no citation/);
  });

  it('refuses an UNCONFIRMED path without a caveat, and an unknown pathway', () => {
    expect(() => loadFasterPaths(entry({ status: 'UNCONFIRMED' }), SOURCES)).toThrow(/caveat/);
    expect(() => loadFasterPaths(entry({ pathways: ['HOTEL'] }), SOURCES)).toThrow(/unknown pathway/);
  });
});
