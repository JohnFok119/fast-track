import { describe, expect, it } from 'vitest';
import rulesRaw from '../../data/rules/adu.json';
import sourcesRaw from '../../data/sources/index.json';
import { loadRules, loadSources } from '../../src/engine/load';
import { checkItem } from '../../src/engine/run';

const sources = loadSources(sourcesRaw);
const rules = loadRules(rulesRaw, sources);
const ruleIds = (text: string) => checkItem({ itemId: 'x', text }, rules, sources).map((f) => f.ruleId);
const statusOf = (text: string) => checkItem({ itemId: 'x', text }, rules, sources)[0]?.status;

describe('adu-owner-occupancy (CONFLICTS, Handbook p. 32)', () => {
  it.each([
    'Owner must occupy the ADU or main house; owner-occupancy affidavit required.',
    'ADU requires a recorded owner-occupancy declaration.',
  ])('flags: %s', (text) => {
    expect(ruleIds(text)).toContain('adu-owner-occupancy');
  });

  it.each([
    'JADU owner-occupancy required when sanitation is shared.',
    'No owner-occupancy requirement for ADUs.',
    'Owner-occupancy required for an ADU sold separately to a qualified buyer under 66341.',
  ])('does not flag: %s', (text) => {
    expect(ruleIds(text)).not.toContain('adu-owner-occupancy');
  });
});

describe('adu-rental-30-days (OK, Gov 66315 via Handbook p. 21)', () => {
  it.each(['ADU may not be rented for terms shorter than 30 days.', 'ADU rental term of 30 days or longer.'])(
    'marks OK: %s',
    (text) => {
      expect(statusOf(text)).toBe('OK');
    },
  );

  it.each([
    'ADU rentals must be at least 6 months.',
    'ADU may not be rented.',
    'ADU rentals must be 90 days or longer.',
    'Short-term rentals of less than 30 days are prohibited and ADU rentals are banned.',
  ])('leaves alone: %s', (text) => {
    expect(ruleIds(text)).not.toContain('adu-rental-30-days');
  });
});

describe('adu-guest-parking (CONFLICTS, Handbook p. 33)', () => {
  it('flags a guest parking requirement for an ADU', () => {
    expect(ruleIds('ADU requires one guest parking space.')).toContain('adu-guest-parking');
  });

  it.each(['Guest parking not required for ADUs.', 'Guest parking required for the primary dwelling, not the ADU.'])(
    'does not flag: %s',
    (text) => {
      expect(ruleIds(text)).not.toContain('adu-guest-parking');
    },
  );
});

describe('adu-replacement-parking (CONFLICTS, Handbook p. 33)', () => {
  it('flags replacement parking for a garage converted to an ADU', () => {
    expect(ruleIds('Covered parking must be replaced if the garage is converted to an ADU.')).toContain(
      'adu-replacement-parking',
    );
  });

  it.each([
    'Replacement parking not required for ADU garage conversions.',
    'Replace roof tiles on the garage per the ADU plan.',
  ])('does not flag: %s', (text) => {
    expect(ruleIds(text)).not.toContain('adu-replacement-parking');
  });
});

describe('jadu-detached-townhouse needs a refusal', () => {
  it('does not flag a city that allows JADUs in detached townhouses', () => {
    expect(ruleIds('JADUs are allowed in a detached townhouse on its own lot.')).not.toContain(
      'jadu-detached-townhouse',
    );
  });
});
