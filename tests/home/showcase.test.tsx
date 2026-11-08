// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { runCheck } from '../../src/contract/api';
import { APP_URL } from '../../src/home/links';
import { Showcase } from '../../src/home/sections/Showcase';

const run = runCheck('dana-point');
const conflicts = run.flags.filter((f) => f.status === 'CONFLICTS').length;

describe('Showcase', () => {
  it('keeps the id the nav links to and says it is a prototype', () => {
    const { container } = render(<Showcase />);
    expect(container.querySelector('section#app')).not.toBeNull();
    expect(screen.getByText('Prototype · not legal advice')).toBeTruthy();
  });

  it('shows the counts and the title of the real run', () => {
    render(<Showcase />);
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(`${conflicts} lines the state says Dana Point can't require`);
    expect(screen.getByText(`✕ ${conflicts} conflict`)).toBeTruthy();
    expect(screen.getByText('? 3 unknown')).toBeTruthy();
  });

  it('opens the first row at the start, with its source and date', () => {
    render(<Showcase />);
    const rows = screen.getAllByRole('button', { expanded: true });
    expect(rows).toHaveLength(1);
    expect(screen.getByText(/HCD letter to the City of Dana Point, 2023-04-17 · p\. 2 · checked 2026-11-07/)).toBeTruthy();
  });

  it('opens a row on click and shows the exact wording, section, page, date and a link to the source', async () => {
    render(<Showcase />);
    const row = screen.getAllByRole('button', { expanded: false }).find((b) => /800 square feet/.test(b.textContent ?? ''));
    expect(row).toBeTruthy();
    await userEvent.click(row!);
    expect(row!.getAttribute('aria-expanded')).toBe('true');
    const detail = document.getElementById(row!.getAttribute('aria-controls')!)!;
    expect(within(detail).getByText('Sec. 9.72.004 (I); Sec 7.37.004 (K)')).toBeTruthy();
    expect(within(detail).getByText('The City must remove these requirements.').tagName).toBe('MARK');
    expect(within(detail).getByText(/p\. 4 · checked 2026-11-07/)).toBeTruthy();
    expect(within(detail).getByRole('link', { name: 'Open the source' }).getAttribute('href')).toMatch(/hcd\.ca\.gov/);
    expect(within(detail).getByText(/shall not exceed 800 square feet/, { exact: false })).toBeTruthy();
  });

  it('closes an open row on a second click', async () => {
    render(<Showcase />);
    const open = screen.getAllByRole('button', { expanded: true })[0]!;
    const detailId = open.getAttribute('aria-controls')!;
    await userEvent.click(open);
    expect(open.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById(detailId)).toBeNull();
  });

  it('works from the keyboard: Enter and Space open a focused row', async () => {
    render(<Showcase />);
    const closed = screen.getAllByRole('button', { expanded: false });
    closed[0]!.focus();
    await userEvent.keyboard('{Enter}');
    expect(closed[0]!.getAttribute('aria-expanded')).toBe('true');
    closed[1]!.focus();
    await userEvent.keyboard(' ');
    expect(closed[1]!.getAttribute('aria-expanded')).toBe('true');
  });

  it('sends "Draft a response" to the app', () => {
    render(<Showcase />);
    expect(screen.getByRole('link', { name: /Draft a response/ }).getAttribute('href')).toBe(APP_URL);
  });

  it('redraws the link line on resize without errors', async () => {
    render(<Showcase />);
    fireEvent(window, new Event('resize'));
    expect(document.querySelectorAll('.zoom .ft-link').length).toBe(1);
  });
});
