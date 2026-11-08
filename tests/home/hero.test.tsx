// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCheck } from '../../src/contract/api';
import { APP_URL } from '../../src/home/links';
import { Hero } from '../../src/home/sections/Hero';
import { matchingQueries } from '../browser-fakes';

const dana = runCheck('dana-point');

describe('Hero', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    matchingQueries.clear();
  });

  it('says what Fast Track is, flags it as a prototype, and sends "Check your lot" to the app', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Get homes built on the fast track.');
    expect(screen.getByText('Not legal advice. Talk to a professional.', { exact: false })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Check your lot' }).getAttribute('href')).toBe(APP_URL);
  });

  it('shows the counts from the engine run in the window', () => {
    const { container } = render(<Hero />);
    const clashes = dana.flags.filter((f) => f.status === 'CONFLICTS').length;
    expect(container.querySelector('.win-sub')?.textContent).toContain(`read ${dana.flags.length} lines. ${clashes} clash`);
    expect(container.querySelectorAll('.todo')).toHaveLength(3);
  });

  it('plays the loop: documents first, then the window with its rows ticked', () => {
    const { container } = render(<Hero />);
    const stage = container.querySelector('.stage') as HTMLElement;
    act(() => void vi.advanceTimersByTime(100));
    expect(stage.classList.contains('p1')).toBe(true);
    act(() => void vi.advanceTimersByTime(13000));
    expect(stage.classList.contains('p4')).toBe(true);
    expect(container.querySelectorAll('.todo.done')).toHaveLength(3);
    act(() => void vi.advanceTimersByTime(300 + 100));
    expect(stage.classList.contains('p5')).toBe(true);
  });

  it('shows the finished window straight away when the visitor prefers reduced motion', () => {
    matchingQueries.add('(prefers-reduced-motion: reduce)');
    const { container } = render(<Hero />);
    expect(container.querySelector('.stage')?.classList.contains('p4')).toBe(true);
    expect(container.querySelectorAll('.todo.done')).toHaveLength(3);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops every timer when it leaves the page', () => {
    const { unmount } = render(<Hero />);
    act(() => void vi.advanceTimersByTime(7400));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
