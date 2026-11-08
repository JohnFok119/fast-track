// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../../../src/ui/App';
import { RUNS } from '../../../src/ui/data';
import { citeMeta, countBy, groupItems } from '../../../src/ui/model';
import { VERDICT } from '../../../src/letter/verdict';

const irvine = RUNS.find((r) => r.city === 'irvine' && r.pathway === 'ADU');
if (!irvine) throw new Error('test data needs an Irvine ADU run');
const irvineItems = groupItems(irvine);

describe('the all-on-one-page view', () => {
  it('shows the prototype notice at the top', () => {
    render(<App />);
    expect(screen.getByText(/Prototype\. Not legal advice\. Nothing is sent from this page\./)).toBeTruthy();
  });

  it('has a brand that links to the homepage, and a button back to the guided flow', () => {
    const onGuided = vi.fn();
    render(<App onGuided={onGuided} />);
    expect(screen.getByRole('link', { name: 'Fast Track home' }).getAttribute('href')).toBe('/');
    fireEvent.click(screen.getByRole('button', { name: 'Guided view' }));
    expect(onGuided).toHaveBeenCalledOnce();
  });

  it('headlines the conflict count from the run', () => {
    render(<App />);
    const n = countBy(irvineItems, 'CONFLICTS');
    const head = screen.getByRole('heading', { level: 1 }).textContent ?? '';
    expect(head).toContain(`${n} of ${irvineItems.length} lines`);
  });

  it('switching city updates the headline and counts from that city run', () => {
    const other = RUNS.find((r) => r.pathway === 'ADU' && r.city !== 'irvine');
    if (!other) throw new Error('need a second ADU city');
    const items = groupItems(other);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(other.name) }));
    const n = countBy(items, 'CONFLICTS');
    const head = screen.getByRole('heading', { level: 1 }).textContent ?? '';
    expect(head).toContain(n ? `${n} of ${items.length} lines` : 'No line');
    expect(screen.getByRole('list', { name: 'Requirements' }).querySelectorAll('li').length).toBe(items.length);
  });

  it('filtering by status lists only those lines, and a second click clears it', () => {
    render(<App />);
    const list = () => screen.getByRole('list', { name: 'Requirements' }).querySelectorAll('li');
    expect(list().length).toBe(irvineItems.length);
    const chip = VERDICT.CONFLICTS.chip;
    const kpi = screen.getAllByRole('button', { pressed: false }).find((b) => b.textContent?.startsWith(chip));
    if (!kpi) throw new Error('no conflicts filter');
    fireEvent.click(kpi);
    expect(list().length).toBe(countBy(irvineItems, 'CONFLICTS'));
    fireEvent.click(kpi);
    expect(list().length).toBe(irvineItems.length);
  });

  it('picking a requirement shows what the city wrote and a source with its checked date', () => {
    render(<App />);
    const target = irvineItems.find((it) => it.flags.some((f) => f.citations.length > 0));
    if (!target) throw new Error('need an item with a citation');
    const row = screen.getByRole('list', { name: 'Requirements' }).querySelectorAll('button')[irvineItems.indexOf(target)];
    if (!row) throw new Error('row missing');
    fireEvent.click(row);
    const detail = screen.getByText(`The source, open · line ${target.itemId}`).closest('aside');
    if (!detail) throw new Error('no detail pane');
    expect(within(detail).getAllByText(target.text).length).toBeGreaterThan(0);
    const cite = target.flags.flatMap((f) => f.citations)[0];
    if (!cite) throw new Error('no citation');
    expect(within(detail).getAllByText(citeMeta(cite)).length).toBeGreaterThan(0);
    expect(citeMeta(cite)).toMatch(/Checked [A-Z][a-z]{2} \d{1,2}, \d{4}/);
  });

  it('opens the letter sheet from the headline button', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Write the letter' })[0] as HTMLElement);
    expect(document.querySelector('.sheet')).not.toBeNull();
  });

  it('the paste check still flags the example text with its sources', () => {
    render(<App />);
    const box = screen.getByLabelText(/Paste a requirement/);
    expect((box as HTMLTextAreaElement).value.length).toBeGreaterThan(0);
    expect(screen.queryByText(/No rule matched/)).toBeNull();
    fireEvent.change(box, { target: { value: 'Quarterly paperwork about nothing.' } });
    expect(screen.getByText(/No rule matched/)).toBeTruthy();
  });
});
