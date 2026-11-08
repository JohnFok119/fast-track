// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PATHS, RUNS } from '../../../src/ui/data';
import { Guided } from '../../../src/ui/guided/Guided';
import { matchingQueries } from '../../browser-fakes';

const NOTICE = /Not legal advice/;
const SLOW = { timeout: 2000 };
const path = PATHS[0]!;
const run = RUNS.find((r) => r.pathway === path.pathway)!;

function setup() {
  const onSeeAll = vi.fn();
  render(<Guided onSeeAll={onSeeAll} />);
  return { onSeeAll };
}

async function pickBuild() {
  fireEvent.click(screen.getByRole('button', { name: 'Start' }));
  fireEvent.click(screen.getByRole('button', { name: new RegExp(path.label) }));
  await screen.findByRole('heading', { name: 'Where is the lot?' }, SLOW);
}

describe('guided shell', () => {
  it('links the brand to the homepage and shows the prototype notice on the first card', () => {
    setup();
    expect(screen.getByRole('link', { name: 'Fast Track home' }).getAttribute('href')).toBe('/');
    expect(screen.getByText(NOTICE)).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Steps' })).toBeNull();
  });

  it('hands off to the one-page view', () => {
    const { onSeeAll } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'See everything on one page' }));
    expect(onSeeAll).toHaveBeenCalledOnce();
  });

  it('moves to the where card after a build is picked, and shows the notice and the step count', async () => {
    setup();
    await pickBuild();
    expect(screen.getByText(NOTICE)).toBeTruthy();
    expect(screen.getByText(/Step 2 of 6/, { selector: '.gd-bar *' })).toBeTruthy();
  });

  it('moves on after a city is picked and names the lot and the build in the card bar', async () => {
    setup();
    await pickBuild();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(run.name) }));
    await screen.findByText(/Step 3 of 6/, { selector: '.gd-bar *' }, SLOW);
    const bar = document.querySelector('.gd-bar') as HTMLElement;
    expect(bar.textContent).toContain(run.name);
    expect(bar.textContent).toContain(path.label);
    expect(screen.getByText(NOTICE)).toBeTruthy();
  });

  it('opens the letter draft from the contact step, and closes it again', async () => {
    setup();
    await pickBuild();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(run.name) }));
    await screen.findByText(/Step 3 of 6/, { selector: '.gd-bar *' }, SLOW);
    const rail = screen.getByRole('navigation', { name: 'Steps' });
    fireEvent.click(within(rail).getAllByRole('button')[4]!);
    fireEvent.click(await screen.findByRole('button', { name: 'Write the letter' }));
    const sheet = screen.getByRole('dialog', { name: 'Letter drafts' });
    expect(within(sheet).getByRole('heading', { name: `Letter, ${run.name}` })).toBeTruthy();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog', { name: 'Letter drafts' })).toBeNull();
  });

  it('jumps to the top of the next card without gliding when the visitor asks for less motion', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo');
    matchingQueries.add('(prefers-reduced-motion: reduce)');
    try {
      setup();
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' });
    } finally {
      matchingQueries.clear();
      scrollTo.mockRestore();
    }
  });

  it('lets the rail jump back only to steps already reached', async () => {
    setup();
    await pickBuild();
    const rail = screen.getByRole('navigation', { name: 'Steps' });
    const buttons = within(rail).getAllByRole('button') as HTMLButtonElement[];
    expect(buttons.map((b) => b.disabled)).toEqual([false, false, true, true, true, true]);
    fireEvent.click(buttons[0]!);
    expect(await screen.findByRole('heading', { name: 'What do you want to build?' })).toBeTruthy();
  });

  it('Start over returns to the first card and forgets the answers', async () => {
    setup();
    await pickBuild();
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Steps' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    const pressed = screen.queryAllByRole('button', { pressed: true });
    expect(pressed).toHaveLength(0);
  });
});
