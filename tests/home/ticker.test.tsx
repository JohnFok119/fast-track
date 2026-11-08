// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RUNS } from '../../src/ui/data';
import { Ticker } from '../../src/home/sections/Ticker';

describe('Ticker', () => {
  it('names every city the engine checks, then the sources behind them', () => {
    render(<Ticker />);
    const region = screen.getByRole('region', { name: 'Cities and sources so far' });
    for (const run of RUNS) expect(region.textContent).toContain(run.name);
    expect(region.textContent).toContain('HCD letters');
    expect(region.textContent).toContain('Gov. Code § 66317');
  });

  it('repeats the set once, hidden from screen readers, so the loop is seamless', () => {
    const { container } = render(<Ticker />);
    const sets = container.querySelectorAll('.tk-set');
    expect(sets).toHaveLength(2);
    expect(sets[1]?.getAttribute('aria-hidden')).toBe('true');
    expect(sets[1]?.textContent).toBe(sets[0]?.textContent);
  });
});
