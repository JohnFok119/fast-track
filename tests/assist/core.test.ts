import { describe, expect, it } from 'vitest';
import { runCheck } from '../../src/contract/api';
import { buildPrompt, containsCitation, parseCliEnvelope, parseModelJson, ruleIdsFor, validate } from '../../src/assist/core';

const irvine = runCheck('irvine');
const flagged = irvine.flags.find((f) => f.ruleId !== null);
if (!flagged) throw new Error('expected at least one matched Irvine flag');
const itemId = flagged.itemId;
const allowed = ruleIdsFor(irvine.flags, itemId);

describe('containsCitation', () => {
  it.each(['See Gov Code 66315.', 'Under 65852.2 the city', '§ 66317', 'per Section 4', 'https://hcd.ca.gov', 'Government Code'])(
    'rejects %s',
    (t) => expect(containsCitation(t)).toBe(true),
  );
  it('accepts plain advice with small numbers', () => {
    expect(containsCitation('Ask the city to drop the covenant. Units up to 800 square feet are fine.')).toBe(false);
  });
});

describe('ruleIdsFor', () => {
  it('returns only engine rule IDs for the item', () => {
    expect(allowed.length).toBeGreaterThan(0);
    expect(allowed).toContain(flagged.ruleId);
  });
  it('is empty for an item where every flag is UNKNOWN', () => {
    const unknown = irvine.flags.find((f) => f.status === 'UNKNOWN');
    if (unknown) expect(ruleIdsFor(irvine.flags, unknown.itemId)).toEqual([]);
  });
});

describe('validate', () => {
  const rule = allowed[0] as string;
  it('keeps points tied to an engine rule ID', () => {
    const res = validate({ itemId, points: [{ ruleId: rule, text: 'Ask the city to remove this.' }] }, itemId, allowed);
    expect(res).toEqual({ fallback: false, itemId, points: [{ ruleId: rule, text: 'Ask the city to remove this.' }] });
  });
  it('drops invented rule IDs and points that cite law', () => {
    const res = validate(
      {
        itemId,
        points: [
          { ruleId: 'made-up-rule', text: 'Something.' },
          { ruleId: rule, text: 'Gov Code 66315 says so.' },
          { ruleId: rule, text: 'Bring a site plan.' },
        ],
      },
      itemId,
      allowed,
    );
    expect(res).toEqual({ fallback: false, itemId, points: [{ ruleId: rule, text: 'Bring a site plan.' }] });
  });
  it('falls back when nothing valid is left, the item is wrong, or the shape is wrong', () => {
    expect(validate({ itemId, points: [{ ruleId: 'x', text: 'y' }] }, itemId, allowed)).toEqual({ fallback: true });
    expect(validate({ itemId: 'other', points: [{ ruleId: rule, text: 'ok' }] }, itemId, allowed)).toEqual({ fallback: true });
    expect(validate(null, itemId, allowed)).toEqual({ fallback: true });
  });
});

describe('parsing', () => {
  it('reads the CLI envelope and rejects error results', () => {
    expect(parseCliEnvelope(JSON.stringify({ is_error: false, result: 'hi' }))).toBe('hi');
    expect(parseCliEnvelope(JSON.stringify({ is_error: true, result: 'boom' }))).toBeNull();
    expect(parseCliEnvelope('not json')).toBeNull();
  });
  it('tolerates a code fence around the model JSON', () => {
    expect(parseModelJson('```json\n{"itemId":"a","points":[]}\n```')).toEqual({ itemId: 'a', points: [] });
    expect(parseModelJson('no json here')).toBeNull();
  });
});

describe('buildPrompt', () => {
  it('names the allowed rule IDs and includes the excerpts', () => {
    const p = buildPrompt({ cityName: irvine.name, itemId, flags: irvine.flags, excerpts: { src: 'EXCERPT TEXT' } });
    for (const r of allowed) expect(p).toContain(`"${r}"`);
    expect(p).toContain('EXCERPT TEXT');
    expect(p).toContain(flagged.itemText);
  });
});
