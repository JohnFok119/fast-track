// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { APP_URL } from '../../src/home/links';
import { Nav } from '../../src/home/sections/Nav';

describe('Nav', () => {
  it('links to the page sections and sends "Check your lot" to the app', () => {
    render(<Nav />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const links = [...nav.querySelectorAll('a')].map((a) => [a.textContent, a.getAttribute('href')]);
    expect(links).toEqual([
      ['How it works', '#how'],
      ['Sources', '#sources'],
      ['FAQ', '#faq'],
      ['Open source', '#free'],
    ]);
    expect(screen.getByRole('link', { name: 'Check your lot' }).getAttribute('href')).toBe(APP_URL);
    expect(screen.getByRole('link', { name: 'Fast Track' }).getAttribute('href')).toBe('#top');
  });

  it('turns into a pill once the page is scrolled past 40px, and back at the top', () => {
    render(<Nav />);
    const bar = screen.getByRole('banner');
    expect(bar.classList.contains('pill')).toBe(false);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 41, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(bar.classList.contains('pill')).toBe(true);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(bar.classList.contains('pill')).toBe(false);
  });
});
