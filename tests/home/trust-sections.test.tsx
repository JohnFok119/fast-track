// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Faq } from '../../src/home/sections/Faq';
import { Free } from '../../src/home/sections/Free';
import { Sources } from '../../src/home/sections/Sources';
import { Trust } from '../../src/home/sections/Trust';
import { APP_URL } from '../../src/home/links';

describe('Faq', () => {
  it('opens and closes an item when its question is clicked', () => {
    render(<Faq />);
    const item = screen.getByText('Is this legal advice?').closest('details')!;
    expect(item.open).toBe(false);
    fireEvent.click(screen.getByText('Is this legal advice?'));
    expect(item.open).toBe(true);
    fireEvent.click(screen.getByText('Is this legal advice?'));
    expect(item.open).toBe(false);
  });

  it('shows the prototype banner and the first answer open with the data counts', () => {
    render(<Faq />);
    expect(screen.getByText('Prototype')).toBeTruthy();
    const first = screen.getByText('Is this the finished product?').closest('details')!;
    expect(first.open).toBe(true);
    expect(first.textContent).toContain('4 cities');
    expect(first.textContent).toContain('13 rules');
  });

  it("sets the event name in Claude's serif in the prototype banner", () => {
    render(<Faq />);
    expect(screen.getByText('Claude Impact Lab').classList.contains('claude-type')).toBe(true);
  });

  it('lists what is next', () => {
    render(<Faq />);
    const next = screen.getByText("What's next?").closest('details')!;
    expect(within(next).getAllByRole('listitem')).toHaveLength(6);
  });
});

describe('Sources', () => {
  it('shows each card title and the dates from the sources', () => {
    render(<Sources />);
    for (const t of ['HCD letters', 'ADU Handbook', 'Gov. Code', 'City pages']) expect(screen.getByText(t)).toBeTruthy();
    expect(screen.getByText('2025-03-27')).toBeTruthy();
    expect(screen.getByText('2023-04-17')).toBeTruthy();
    expect(screen.getByText('March 2026')).toBeTruthy();
    expect(screen.getByText('Nov 2025')).toBeTruthy();
    expect(screen.getByText('All checked 2026-11-07.')).toBeTruthy();
  });
});

describe('Trust', () => {
  it('names the three tiles', () => {
    render(<Trust />);
    for (const t of ['Grounded in the law', 'Never guesses', 'Sourced and dated']) expect(screen.getByText(t)).toBeTruthy();
    expect(screen.getByText(/Checked 2026-11-07/)).toBeTruthy();
  });
});

describe('Free', () => {
  it('sends Check your lot to the app', () => {
    render(<Free />);
    expect(screen.getByRole('link', { name: 'Check your lot' }).getAttribute('href')).toBe(APP_URL);
    expect(screen.getByText('MIT license')).toBeTruthy();
  });
});
