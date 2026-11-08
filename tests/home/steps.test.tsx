// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Steps } from '../../src/home/sections/Steps';

describe('Steps', () => {
  it('shows the three steps in order', () => {
    render(<Steps />);
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Pick what you're building.", 'We read both sides.', 'See every clash.']);
  });

  it('lists the real paths and marks the duplex path as chosen, for the city found', () => {
    render(<Steps />);
    expect(screen.getByText('Backyard home to rent')).toBeTruthy();
    expect(screen.getByText('Duplex or lot split (SB 9)').className).toContain('sel');
    expect(screen.getByText('Dana Point')).toBeTruthy();
  });

  it('shows the clash from the real run: the city words next to the sentence where HCD says remove it', () => {
    render(<Steps />);
    expect(screen.getAllByText('shall not exceed 800 square feet').length).toBeGreaterThan(0);
    expect(screen.getAllByText('The City must remove these requirements.').length).toBeGreaterThan(0);
  });
});
