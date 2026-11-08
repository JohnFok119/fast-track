// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { APP_URL } from '../../src/home/links';
import { StickyCta } from '../../src/home/sections/StickyCta';

function scrollTo(y: number, pageHeight = 9000) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true });
  Object.defineProperty(document.body, 'scrollHeight', { value: pageHeight, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

describe('StickyCta', () => {
  it('goes to the app and shows only in the middle of the page', () => {
    scrollTo(0);
    const { container } = render(<StickyCta />);
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(APP_URL);
    expect(link.classList.contains('show')).toBe(false);
    scrollTo(3000);
    expect(link.classList.contains('show')).toBe(true);
    expect(screen.getByRole('link', { name: /Check your lot/ })).toBeTruthy();
    scrollTo(8000);
    expect(link.classList.contains('show')).toBe(false);
  });
});
