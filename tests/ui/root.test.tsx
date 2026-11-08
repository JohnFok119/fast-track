// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PATHS, RUNS } from '../../src/ui/data';
import { Root } from '../../src/ui/Root';
import { matchingQueries } from '../browser-fakes';

const SLOW = { timeout: 2000 };
const has = (text: string) => (name: string) => name.includes(text);

beforeEach(() => matchingQueries.add('(prefers-reduced-motion: reduce)'));
afterEach(() => matchingQueries.clear());

describe('switching between the two views', () => {
  it('carries the build and the city from the guided flow to the one-page view and back', async () => {
    const sb9 = PATHS.find((p) => p.pathway === 'SB9');
    const run = RUNS.find((r) => r.pathway === 'SB9');
    if (!sb9 || !run) throw new Error('need an SB 9 build with a saved check');
    render(<Root />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: has(sb9.label) }));
    await screen.findByRole('heading', { name: 'Where is the lot?' }, SLOW);
    fireEvent.click(screen.getByRole('button', { name: has(run.name) }));
    await screen.findByText(/Step 3 of 6/, undefined, SLOW);

    fireEvent.click(screen.getByRole('button', { name: 'See everything on one page' }));
    expect(screen.getByRole('button', { name: has(sb9.label) }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: has(run.name) }).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Guided view' }));
    expect(screen.getByText(`${run.name} · ${sb9.label}`)).toBeTruthy();
    expect(screen.getByText(/Step 3 of 6/)).toBeTruthy();
  });
});
