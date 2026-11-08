import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/home/sections/hero.css', 'utf8');
const rule = (selector: string) => new RegExp(`^${selector.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`, 'm').exec(css)?.[1] ?? '';

describe('hero fade', () => {
  // The hero is at least a screen tall. A fade that only follows the content leaves a dark band under it on a tall screen.
  it('sits on the bottom edge of the hero, so the hero always ends in the page tone', () => {
    const fade = rule('.hero .fade');
    expect(fade).toMatch(/position: absolute/);
    expect(fade).toMatch(/bottom: 0/);
    expect(fade).toMatch(/height: 280px/);
  });

  it('keeps room under the content for the fade', () => {
    expect(rule('.hero')).toMatch(/padding: 170px 0 320px/);
  });
});
