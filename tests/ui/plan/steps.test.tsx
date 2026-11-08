// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CityRun } from '../../../src/contract/types';
import { getBaseline, getTimeline } from '../../../src/contract/api';
import { ESCALATION, PATHS, RUNS } from '../../../src/ui/data';
import { ContactStep, TimelineStep } from '../../../src/ui/guided/PlanSteps';
import { Summary } from '../../../src/ui/guided/Summary';
import { groupItems } from '../../../src/ui/model';
import { LetterSheet } from '../../../src/ui/LetterSheet';

afterEach(cleanup);
const run0 = (): CityRun => {
  const r = RUNS[0];
  if (!r) throw new Error('no runs');
  return r;
};
const noop = () => undefined;

describe('TimelineStep, SB 9', () => {
  const view = () => render(<TimelineStep phases={getTimeline('SB9')} baseline={getBaseline()} onNext={noop} onBack={noop} />);

  it('shows the 60 day review with its HCD citation and date, never an unknown review time', () => {
    const { container } = view();
    const ring = container.querySelector('.fp-ring') as HTMLElement;
    expect(ring.textContent).toContain('City review: 60 days');
    const link = within(ring).getByRole('link');
    expect(link.getAttribute('href')).toMatch(/^https:\/\/www\.hcd\.ca\.gov\//);
    expect(ring.textContent).toContain('p. 2');
    expect(link.textContent).toMatch(/Dana Point/);
    expect(ring.textContent).toMatch(/checked \d{4}-\d{2}-\d{2}/);
    expect(container.textContent).not.toMatch(/unknown review time/i);
  });

  it('does not repeat the step number, the card bar says it', () => {
    const { container } = view();
    expect(container.textContent).not.toMatch(/Step \d of 6/);
  });

  it('lists the SB 9 faster path with its source', () => {
    view();
    const panel = screen.getByRole('region', { name: 'Faster paths' });
    expect(within(panel).getAllByRole('link').length).toBeGreaterThan(0);
  });
});

describe('TimelineStep, ADU', () => {
  it('lists the ADU faster paths with sources, and the unconfirmed one shows its caveat', () => {
    render(<TimelineStep phases={getTimeline('ADU')} baseline={getBaseline()} onNext={noop} onBack={noop} />);
    const panel = screen.getByRole('region', { name: 'Faster paths' });
    for (const li of within(panel).getAllByRole('listitem')) expect(within(li).getAllByRole('link').length).toBeGreaterThan(0);
    const note = within(panel).getByText(/Not confirmed yet:/).closest('[role="note"]') as HTMLElement;
    expect(note.textContent).toMatch(/not yet on leginfo/);
  });
});

describe('ContactStep', () => {
  it('has no repeated step number', () => {
    const { container } = render(<ContactStep run={run0()} escalation={ESCALATION} onNext={noop} onBack={noop} />);
    expect(container.textContent).not.toMatch(/Step \d of 6/);
    expect(screen.getByText('Who to contact')).toBeTruthy();
  });
});

describe('Summary', () => {
  it('shows the SB 9 deadline and faster paths, with no repeated step number', () => {
    const path = PATHS.find((p) => p.pathway === 'SB9');
    const run = RUNS.find((r) => r.pathway === 'SB9');
    if (!path || !run) throw new Error('need an SB 9 path and run');
    const { container } = render(<Summary path={path} run={run} items={groupItems(run)} phases={getTimeline('SB9')} baseline={getBaseline()} escalation={ESCALATION} onBack={noop} onRestart={noop} />);
    expect(container.textContent).not.toMatch(/Step \d of 6/);
    expect(container.textContent).not.toMatch(/unknown review time/i);
    expect(container.querySelector('.fp-ring')?.textContent).toContain('60 days');
    expect(screen.getByRole('region', { name: 'Faster paths' })).toBeTruthy();
  });
});

describe('LetterSheet', () => {
  it('copies the draft, says the applicant sends it, and has no send button', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<LetterSheet run={run0()} escalation={ESCALATION} onClose={noop} />);
    expect(screen.getByText('You review it and send it yourself. Fast Track sends nothing.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /send|submit|email/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Copy the text' }));
    await screen.findByRole('button', { name: 'Copied' });
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0]?.[0]).toBe(document.querySelector('pre')?.textContent);
  });
});
