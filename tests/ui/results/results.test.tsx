// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCheck } from '../../../src/contract/api';
import type { City } from '../../../src/contract/types';
import { Results } from '../../../src/ui/guided/Results';
import { groupItems } from '../../../src/ui/model';
import { matchingQueries } from '../../browser-fakes';

const REDUCED = '(prefers-reduced-motion: reduce)';
const NARROW = '(max-width: 960px)';

function show(city: City) {
  const run = runCheck(city);
  const onNext = vi.fn();
  const onBack = vi.fn();
  const view = render(<Results run={run} items={groupItems(run)} onNext={onNext} onBack={onBack} />);
  return { run, onNext, onBack, view };
}

const flagOf = (city: City, id: string) => {
  const flag = runCheck(city).flags.find((f) => f.itemId === id);
  if (!flag) throw new Error(`no flag ${id}`);
  return flag;
};
const pane = () => screen.getByRole('region', { name: 'The source, open' });
const picked = () => screen.getByRole('button', { pressed: true });

beforeEach(() => matchingQueries.add(REDUCED));
afterEach(() => {
  matchingQueries.clear();
  vi.useRealTimers();
});

describe('Results heading', () => {
  it.each<City>(['dana-point', 'anaheim', 'irvine'])('counts the lines the state says no to in %s, out of all lines read', (city) => {
    const { run } = show(city);
    const no = new Set(run.flags.filter((f) => f.status === 'CONFLICTS').map((f) => f.itemId)).size;
    const all = new Set(run.flags.map((f) => f.itemId)).size;
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(`${no} of ${all} lines the state says no to.`);
  });
});

describe('Results header', () => {
  it('leaves the step number to the card bar above it', () => {
    show('dana-point');
    expect(screen.queryByText(/Step 3 of 6/)).toBeNull();
  });
});

describe('Results source pane', () => {
  it('opens the first line the state says no to, with its own quote and HCD letter', () => {
    show('dana-point');
    const dp01 = flagOf('dana-point', 'dp-01');
    expect(within(picked()).getByText('State says no')).toBeTruthy();
    expect(within(pane()).getByText(dp01.itemText)).toBeTruthy();
    expect(within(pane()).getByText(dp01.why ?? '')).toBeTruthy();
  });

  it("shows the picked line's own quote and citation with its page and date", () => {
    show('dana-point');
    const dp05 = flagOf('dana-point', 'dp-05');
    fireEvent.click(screen.getByRole('button', { name: /Total Floor Area shall not exceed 800 square feet\.\.\.\. In no event/ }));
    expect(picked().textContent).toContain('In no event shall the two Residential Units');
    expect(within(pane()).getByText(dp05.itemText)).toBeTruthy();
    expect(within(pane()).queryByText(flagOf('dana-point', 'dp-01').itemText)).toBeNull();
    const cite = dp05.citations[0];
    const link = within(pane()).getByRole('link', { name: cite?.label });
    expect(link.getAttribute('href')).toBe(cite?.url);
    expect(link.closest('li')?.textContent).toContain('Dated Apr 17, 2023 · Page 4 · Checked Nov 7, 2026');
  });

  it('opens every source link, the city one too, in a new tab and on the real URL', () => {
    const { run } = show('irvine');
    const links = within(pane()).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual([run.sourceUrl, ...(run.flags[0]?.citations.map((c) => c.url) ?? [])]);
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });

  it('says plainly when no rule covers a line, with no source link for the state', () => {
    show('dana-point');
    fireEvent.click(screen.getByRole('button', { name: /must be attached or connected/ }));
    expect(within(pane()).getByText(/No rule covers this line yet/)).toBeTruthy();
    expect(within(pane()).getAllByRole('link')).toHaveLength(1);
  });

  it('marks only the old law numbers in a line that cites a renumbered section', () => {
    const { view } = show('anaheim');
    fireEvent.click(screen.getByRole('button', { name: /OWNER OCCUPANCY COVENANT/ }));
    expect([...view.container.querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['65852.2', '65852.22']);
    expect(within(pane()).getAllByText('UNKNOWN')).toHaveLength(2);
  });
});

describe('Results moving between lines', () => {
  it('moves with the arrow keys, Home and End, and keeps focus on the picked line', () => {
    show('dana-point');
    picked().focus();
    fireEvent.keyDown(picked(), { key: 'ArrowDown' });
    expect(picked().textContent).toContain('height limitation of twelve feet');
    expect(document.activeElement).toBe(picked());
    fireEvent.keyDown(picked(), { key: 'End' });
    expect(picked().textContent).toContain('[a]ny person responsible for violating');
    fireEvent.keyDown(picked(), { key: 'Home' });
    expect(picked().textContent).toContain('No more than two residential units');
  });

  it('steps with the Next line and Previous line buttons', () => {
    show('dana-point');
    expect((screen.getByRole('button', { name: 'Previous line' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Next line' }));
    expect(picked().textContent).toContain('height limitation of twelve feet');
    expect(within(pane()).getByText('2 of 9')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Previous line' }));
    expect(picked().textContent).toContain('No more than two residential units');
  });

  it('on a phone, opens the source right under the picked line', () => {
    matchingQueries.add(NARROW);
    show('dana-point');
    fireEvent.click(screen.getByRole('button', { name: /Total Floor Area shall not exceed 800 square feet\.\.\.\. In no event/ }));
    expect(screen.getAllByRole('region', { name: 'The source, open' })).toHaveLength(1);
    expect(picked().closest('li')?.contains(pane())).toBe(true);
  });
});

describe('Results flow', () => {
  it('checks the lines one by one, then shows them all when asked', () => {
    matchingQueries.clear();
    vi.useFakeTimers();
    show('dana-point');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Checking 9 lines against state law');
    fireEvent.click(screen.getByRole('button', { name: 'Show all now' }));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('6 of 9 lines the state says no to.');
  });

  it('goes back and on through the shell', () => {
    const { onBack, onNext } = show('dana-point');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next: time saved' }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });
});
