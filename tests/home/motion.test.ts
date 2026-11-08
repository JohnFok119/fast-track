import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('homepage motion', () => {
  it('glides to an anchor only when the visitor has not asked for less motion', () => {
    const css = readFileSync('src/home/home.css', 'utf8');
    expect(css.match(/scroll-behavior:\s*smooth/g)).toHaveLength(1);
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*html \{ scroll-behavior: smooth; \}\s*\}/);
  });
});
