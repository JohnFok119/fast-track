// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '../../src/home/sections/Footer';

describe('Footer', () => {
  it('shows the brand, the not-legal-advice notice and the event credit', () => {
    const { container } = render(<Footer />);
    expect(screen.getByRole('link', { name: 'Fast Track' }).getAttribute('href')).toBe('#top');
    expect(screen.getByText(/Prototype, not legal advice\. Talk to a professional before you act\./)).toBeTruthy();
    const credit = container.querySelector('.claude-type');
    expect(credit?.textContent).toBe('Claude Impact Lab');
    expect(credit?.parentElement?.textContent).toBe(
      'Built at Claude Impact Lab: UCI x SoCal Affordable Housing, an independent Claude Community event.',
    );
  });

  it('does not name the sponsor organization', () => {
    const { container } = render(<Footer />);
    expect(container.textContent).not.toMatch(/Habitat/i);
  });
});
