// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { APP_URL } from '../../src/home/links';
import { Final } from '../../src/home/sections/Final';

afterEach(() => vi.restoreAllMocks());

describe('Final', () => {
  it('shows the closing line and a button to the app', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<Final />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Clear the way.Then build.');
    expect(screen.getByRole('link', { name: /Check your lot/ }).getAttribute('href')).toBe(APP_URL);
    expect(container.querySelector('.street')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('logs and leaves the street empty when WebGL is missing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<Final />);
    await waitFor(() => expect(error).toHaveBeenCalled());
    await waitFor(() => expect(error.mock.calls.some((c) => String(c[0]).includes('[street]'))).toBe(true));
    expect(container.querySelector('.street canvas')).toBeNull();
    expect(screen.getByRole('link', { name: /Check your lot/ })).toBeTruthy();
  });
});
