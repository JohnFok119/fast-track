// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SproutLogo } from '../../src/brand/Logo';

describe('SproutLogo', () => {
  it('draws the sprout at the asked size and hides it from screen readers', () => {
    const { container } = render(<SproutLogo size={20} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('20');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.querySelectorAll('path')).toHaveLength(4);
  });
});
