// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Faq } from '../../src/home/sections/Faq';

const first = 'Is this the finished product?';

describe('Faq', () => {
  it('starts with only the first item open', () => {
    render(<Faq />);
    expect(screen.getByRole('button', { name: first }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Is this legal advice?' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles aria-expanded when a question is clicked, and closes it again', () => {
    render(<Faq />);
    const q = screen.getByRole('button', { name: 'Which cities?' });
    fireEvent.click(q);
    expect(q.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(q);
    expect(q.getAttribute('aria-expanded')).toBe('false');
  });

  it('lets several items stay open at once', () => {
    render(<Faq />);
    fireEvent.click(screen.getByRole('button', { name: 'Which cities?' }));
    expect(screen.getByRole('button', { name: first }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Which cities?' }).getAttribute('aria-expanded')).toBe('true');
  });

  it('wires the button to a labelled answer region that is inert while closed', () => {
    render(<Faq />);
    const q = screen.getByRole('button', { name: 'Which cities?' });
    const region = document.getElementById(q.getAttribute('aria-controls')!)!;
    expect(region.getAttribute('aria-labelledby')).toBe(q.id);
    expect(region.hasAttribute('inert')).toBe(true);
    fireEvent.click(q);
    expect(region.hasAttribute('inert')).toBe(false);
  });
});
