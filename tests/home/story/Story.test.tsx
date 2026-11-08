// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_URL } from '../../../src/home/links';
import { Story } from '../../../src/home/story/Story';

// The 3D scene needs WebGL, which jsdom lacks: stand in for it to see how the story drives it.
const scene = vi.hoisted(() => ({ fail: false, built: 0, stages: [] as number[], disposed: 0 }));
vi.mock('../../../src/home/story/house/HouseScene', () => ({
  HouseScene: class {
    constructor() {
      if (scene.fail) throw new Error('no GPU');
      scene.built += 1;
    }
    setStage(n: number) {
      scene.stages.push(n);
    }
    dispose() {
      scene.disposed += 1;
    }
  },
}));

const stage = (container: HTMLElement) => container.querySelector('.st-stage') as HTMLElement;
const fakeWebGL = () => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => null } as never);

// By default the browser has no WebGL, like jsdom itself (stubbed so jsdom does not print its own warning).
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(scene, { fail: false, built: 0, stages: [], disposed: 0 });
});

describe('Story', () => {
  it('tells the six steps, with the city, the count, the quotes and the sources from the data', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Story />);
    expect(screen.getByRole('heading', { level: 2, name: 'From soil to keys.' })).toBeTruthy();
    const steps = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(steps).toEqual([
      'It starts with a lot you already have.',
      'Pick what you\'re building.',
      'The city\'s rules, next to state law.',
      'Every line the state says the city can\'t require.',
      'A draft you send yourself.',
      'Hold the city to its clock.',
    ]);
    expect(screen.getByText('Dana Point')).toBeTruthy();
    expect(screen.getByText('Duplex (SB 9)')).toBeTruthy();
    expect(screen.getByText(/6 of 9 lines/)).toBeTruthy();
    expect(screen.getByText('800 square feet').closest('.q')?.textContent).toBe('"shall not exceed 800 square feet"');
    expect(screen.getByText('HCD letter to Dana Point · 2023-04-17 · p. 4').getAttribute('href')).toMatch(/hcd\.ca\.gov/);
    expect(screen.getByText('HCD letter to Dana Point · 2025-09-15')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Check your lot →' }).getAttribute('href')).toBe(APP_URL);
  });

  it('falls back to the flat drawing, and says why in the console, when WebGL is missing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<Story />);
    await waitFor(() => expect(stage(container).dataset.house).toBe('flat'));
    expect(error).toHaveBeenCalledWith(expect.stringContaining('[story] WebGL is not available'));
    expect(screen.getByRole('img', { name: /A house being built in stages/ })).toBeTruthy();
    expect(scene.built).toBe(0);
  });

  it('falls back to the flat drawing when building the 3D house fails', async () => {
    fakeWebGL();
    scene.fail = true;
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<Story />);
    await waitFor(() => expect(stage(container).dataset.house).toBe('flat'));
    expect(error).toHaveBeenCalledWith(expect.stringContaining('[story] could not build the 3D house'), expect.any(Error));
  });

  it('builds the 3D house when WebGL works and hands it each stage the reader reaches', async () => {
    fakeWebGL();
    const { container, unmount } = render(<Story />);
    await waitFor(() => expect(scene.built).toBe(1));
    expect(stage(container).dataset.house).toBe('real');
    // Test observers report every step on screen at once, so the reader is at the last stage.
    expect(scene.stages.at(-1)).toBe(5);
    unmount();
    expect(scene.disposed).toBe(1);
  });

  it('keeps every reached step solid and marks the current one on the rail', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<Story />);
    const articles = [...container.querySelectorAll('.st-step')];
    expect(articles).toHaveLength(6);
    expect(articles.every((a) => a.classList.contains('on'))).toBe(true);
    const rail = [...container.querySelectorAll('.rail span')];
    expect(rail.map((r) => r.textContent)).toEqual(['Lot', 'Build', 'Read', 'Clash', 'Fix', 'Keys']);
    expect(rail[5]?.classList.contains('cur')).toBe(true);
    expect(rail.slice(0, 5).every((r) => r.classList.contains('done'))).toBe(true);
  });
});
