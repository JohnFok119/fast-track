// The app has two looks: latte (default) and classic white and blue (?theme=classic). These tests keep classic whole:
// every color token gets a classic value, and the app's stylesheets take every color from a token.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/index.css', 'utf8');
/** Type tokens are shared by both looks on purpose (classic swaps only the fonts it names). */
const TYPE = /^--(font-|sans$|mono$|display$|dw$|dvar$)/;

function block(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no ${selector} block in src/index.css`);
  const body = css.slice(start, css.indexOf('}', start));
  return new Map([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1] as string, (m[2] as string).trim()]));
}

function stylesheets(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return stylesheets(path);
    return e.name.endsWith('.css') ? [path] : [];
  });
}

describe('the classic theme', () => {
  it('gives every color token its own classic value, or aliases tokens that have one', () => {
    const latte = block(':root');
    const classic = block(':root[data-theme="classic"]');
    const missing = [...latte].filter(([name, value]) => {
      if (TYPE.test(name) || classic.has(name)) return false;
      const aliases = [...value.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1] as string);
      return aliases.length === 0 || aliases.some((a) => !classic.has(a));
    });
    expect(missing.map(([name]) => name)).toEqual([]);
  });

  it("keeps raw colors out of the app's stylesheets, so classic reaches every one", () => {
    const raw = stylesheets('src/ui').flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, i) => [...line.matchAll(/#[0-9a-f]{3,8}\b|rgba?\(\s*\d/gi)].map((m) => `${file}:${i + 1} ${m[0]}`)),
    );
    expect(raw).toEqual([]);
  });
});
