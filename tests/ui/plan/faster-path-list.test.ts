import { describe, expect, it } from 'vitest';
import { getFasterPaths } from '../../../src/contract/api';
import type { FasterPath } from '../../../src/contract/types';
import { FasterPathList } from '../../../src/ui/faster/FasterPathList';

const cite = { sourceId: 's', label: 'A source', url: 'https://example.org/x', section: '1', page: '2', checked: '2026-01-02' };
const first = (paths: FasterPath[]) => {
  const row = new FasterPathList(paths).rows[0];
  if (!row) throw new Error('no row');
  return row;
};
const mk = (over: Partial<FasterPath>): FasterPath => ({ id: 'a', title: 'A', text: 't', status: 'CONFIRMED', citations: [cite], ...over });

describe('FasterPathList', () => {
  it('puts confirmed paths before unconfirmed ones and keeps data order otherwise', () => {
    const list = new FasterPathList([mk({ id: 'u', status: 'UNCONFIRMED', caveat: 'c' }), mk({ id: 'b' }), mk({ id: 'c' })]);
    expect(list.rows.map((r) => r.id)).toEqual(['b', 'c', 'u']);
  });

  it('warns on an unconfirmed path with its caveat', () => {
    const row = first([mk({ status: 'UNCONFIRMED', caveat: 'Read in a handout.' })]);
    expect(row.warning).toEqual({ label: 'Not confirmed yet', text: 'Read in a handout.', strong: true });
  });

  it('shows a confirmed path caveat as a quieter note', () => {
    const row = first([mk({ caveat: 'Mirror only.' })]);
    expect(row.warning).toEqual({ label: 'Check', text: 'Mirror only.', strong: false });
  });

  it('has no warning when there is no caveat', () => {
    expect(first([mk({})]).warning).toBeNull();
  });

  it('describes a citation with section, page and date', () => {
    expect(first([mk({})]).sources[0]?.detail).toBe('§ 1 · p. 2 · checked 2026-01-02');
  });

  it('wraps the real data for both pathways', () => {
    expect(new FasterPathList(getFasterPaths('ADU')).rows.length).toBeGreaterThan(0);
    expect(new FasterPathList(getFasterPaths('SB9')).rows.length).toBeGreaterThan(0);
  });
});
