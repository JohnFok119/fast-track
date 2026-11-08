// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCheck } from '../../../src/contract/api';
import type { City } from '../../../src/contract/types';
import { Results } from '../../../src/ui/guided/Results';
import { groupItems } from '../../../src/ui/model';
import { ReadModel } from '../../../src/ui/results/ReadModel';
import { ReadScan } from '../../../src/ui/results/ReadScan';
import { summaryOf } from '../../../src/ui/results/summaries';
import { matchingQueries } from '../../browser-fakes';

const REDUCED = '(prefers-reduced-motion: reduce)';

function show(city: City, read = false) {
  const run = runCheck(city);
  const items = groupItems(run);
  const onNext = vi.fn();
  const onBack = vi.fn();
  const onRead = vi.fn();
  const view = render(<Results run={run} items={items} read={read} onRead={onRead} onNext={onNext} onBack={onBack} />);
  return { run, items, onNext, onBack, onRead, view };
}

const heading = () => screen.getByRole('heading', { level: 1 }).textContent;
const cards = () => within(screen.getByRole('list', { name: 'Clashes' })).getAllByRole('listitem');
const dana = (rule: string) => summaryOf('dana-point', rule)!;

beforeEach(() => matchingQueries.add(REDUCED));
afterEach(() => {
  matchingQueries.clear();
  vi.useRealTimers();
});

describe('Results reading', () => {
  beforeEach(() => {
    matchingQueries.clear();
    vi.useFakeTimers();
  });

  it("reads the city's rules beside the state's own words, then lands on the clashes", () => {
    const { run, items, onRead } = show('dana-point');
    expect(heading()).toBe("Reading Dana Point's rules against HCD's letter");
    expect(screen.getByRole('region', { name: "Dana Point's rules" })).toBeTruthy();
    expect(screen.getByRole('region', { name: /HCD letter to the City of Dana Point/ })).toBeTruthy();
    expect(screen.getByText('Line 1 of 9')).toBeTruthy();
    expect(screen.queryByRole('list', { name: 'Clashes' })).toBeNull();
    const total = new ReadScan(new ReadModel(run, items).lines).total;
    act(() => vi.advanceTimersByTime(total + 200));
    expect(heading()).toBe('6 of 9 lines the state says no to.');
    expect(cards()).toHaveLength(4);
    expect(onRead).toHaveBeenCalled();
  });

  it('counts the clashes as it finds them', () => {
    show('dana-point');
    act(() => vi.advanceTimersByTime(1100));
    expect(screen.getByText(/1 clash found/)).toBeTruthy();
  });

  it('skips to the clashes when asked', () => {
    show('dana-point');
    fireEvent.click(screen.getByRole('button', { name: 'Skip to the results' }));
    expect(heading()).toBe('6 of 9 lines the state says no to.');
  });

  it('does not read again a city it already read', () => {
    show('dana-point', true);
    expect(heading()).toBe('6 of 9 lines the state says no to.');
  });
});

describe('Results clash cards', () => {
  it('numbers each clash and names it with its summary title, in the order the city wrote them', () => {
    show('dana-point');
    const rules = ['sb9-dana-point-two-unit-cap', 'sb9-dana-point-one-story', 'sb9-dana-point-floor-area-cap', 'sb9-dana-point-one-bedroom'];
    expect(cards().map((c) => within(c).getByRole('heading', { level: 3 }).textContent)).toEqual(rules.map((r) => dana(r).title));
    expect(cards().map((c) => c.querySelector('.cc-n')?.textContent)).toEqual(['1', '2', '3', '4']);
  });

  it('puts what the city says beside what the state says, how they clash, and the time saved as an estimate', () => {
    show('dana-point');
    const s = dana('sb9-dana-point-two-unit-cap');
    const card = cards()[0]!;
    expect(within(card).getByRole('button', { name: new RegExp(`Dana Point says.*${s.citySays.slice(0, 30)}`) })).toBeTruthy();
    expect(within(card).getByRole('button', { name: new RegExp(`The state says.*${s.stateSays.slice(0, 30)}`) })).toBeTruthy();
    expect(card.textContent).toContain(s.clash);
    expect(card.textContent).toContain(`About ${s.time.low} to ${s.time.high} ${s.time.unit}`);
    expect(within(card).getByText('Estimate')).toBeTruthy();
    expect(card.textContent).toContain(s.time.basis);
  });

  it('says the summaries are written by Claude and that the rule set decides the clashes', () => {
    show('dana-point');
    expect(screen.getByText(/Summaries and time estimates by Claude/)).toBeTruthy();
  });

  it("opens the exact words from either side, with the city's line, HCD's words and each source", () => {
    const { run } = show('dana-point');
    const flag = run.flags.find((f) => f.itemId === 'dp-01')!;
    const card = cards()[0]!;
    const [city, state] = within(card).getAllByRole('button', { expanded: false });
    fireEvent.click(city!);
    const words = within(card).getByRole('region', { name: /Exact words/ });
    expect(words.textContent).toContain(flag.itemText.slice(1, 60));
    expect(words.textContent).toContain(flag.why!.slice(0, 60));
    const cite = flag.citations[0]!;
    expect(within(words).getByRole('link', { name: cite.label }).getAttribute('href')).toBe(cite.url);
    expect(state!.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(state!);
    expect(within(card).queryByRole('region', { name: /Exact words/ })).toBeNull();
  });

  it("marks each clash's words in the state's text with its number", () => {
    show('dana-point');
    const state = screen.getByRole('region', { name: /HCD letter to the City of Dana Point/ });
    for (const n of ['1', '2', '3', '4']) expect(state.querySelector(`mark[data-n="${n}"]`)).not.toBeNull();
  });

  it('shows a card for two lines HCD answers the same way once, and says it covers both', () => {
    show('dana-point');
    expect(cards()[2]?.textContent).toContain('2 lines');
  });
});

describe('Results other lines', () => {
  it("lists the lines that do not clash, and explains one when it is opened", () => {
    show('dana-point');
    const other = screen.getByRole('region', { name: "Also on Dana Point's list" });
    const rows = within(other).getAllByRole('button');
    expect(rows).toHaveLength(3);
    fireEvent.click(rows[0]!);
    expect(within(other).getByText(/No rule covers this line yet/)).toBeTruthy();
  });

  it('says plainly when a city has no clash, and still shows its old law numbers', () => {
    const { view } = show('anaheim');
    expect(heading()).toBe('0 of 6 lines the state says no to.');
    expect(screen.queryByRole('list', { name: 'Clashes' })).toBeNull();
    expect(screen.getByText(/No line here clashes with state law/)).toBeTruthy();
    const other = screen.getByRole('region', { name: "Also on Anaheim's list" });
    expect(within(other).getAllByText('Old law number')).toHaveLength(1);
    expect(view.container.querySelectorAll('mark[data-n="old"]').length).toBeGreaterThan(0);
  });
});

describe('Results shell', () => {
  it('leaves the step number to the card bar above it', () => {
    show('dana-point');
    expect(screen.queryByText(/Step 3 of 6/)).toBeNull();
  });

  it('goes back and on through the shell', () => {
    const { onBack, onNext } = show('dana-point');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next: time saved' }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });
});
