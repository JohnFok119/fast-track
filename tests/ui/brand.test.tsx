// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppBrand } from '../../src/ui/Brand';

describe('AppBrand', () => {
  it('shows the sprout and the name, and goes back to the homepage', () => {
    const { container } = render(<AppBrand />);
    const link = screen.getByRole('link', { name: 'Fast Track home' });
    expect(link.getAttribute('href')).toBe('/');
    expect(link.textContent).toBe('Fast Track');
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
