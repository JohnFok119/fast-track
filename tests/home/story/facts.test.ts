// Every law, number, quote and date in the story comes from the data, and the story's own wording is backed by it.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getFasterPaths, getPaths, getTimeline, runCheck } from '../../../src/contract/api';
import type { CityRun } from '../../../src/contract/types';
import { StoryFacts } from '../../../src/home/story/facts';

const run = runCheck('dana-point');
const facts = StoryFacts.load();
const flag = (ruleId: string) => run.flags.find((f) => f.ruleId === ruleId);

afterEach(() => vi.restoreAllMocks());

describe('StoryFacts', () => {
  it('names the city from the check run', () => {
    expect(facts.city).toBe('Dana Point');
  });

  it('takes the law name from the build paths, and the paths back the pill words', () => {
    expect(facts.lawName).toBe('SB 9');
    const sb9 = getPaths().find((p) => p.pathway === 'SB9');
    expect(sb9?.label).toMatch(/duplex/i);
    expect(sb9?.label).toMatch(/lot split/i);
    expect(getPaths().some((p) => p.pathway === 'ADU' && /backyard home/i.test(p.label))).toBe(true);
  });

  it('counts the clashes from the check run', () => {
    expect(facts.conflicts).toBe(run.flags.filter((f) => f.status === 'CONFLICTS').length);
    expect(facts.total).toBe(run.flags.length);
    expect([facts.conflicts, facts.total]).toEqual([6, 9]);
  });

  it('quotes the city code and the HCD letter word for word', () => {
    const floor = flag('sb9-dana-point-floor-area-cap');
    expect(floor?.itemText).toContain(facts.cityQuote.text);
    expect(facts.cityQuote.text).toBe('shall not exceed 800 square feet');
    expect(facts.cityQuote.strong).toBe('800 square feet');
    expect(floor?.why).toContain(facts.hcdQuote.text);
    expect(facts.hcdQuote.text).toBe('The City must remove these requirements.');
    expect(facts.hcdQuote.strong).toBe('must remove');
    expect(facts.floorCap).toBe('800');
  });

  it('backs the clash rows with the flags behind them', () => {
    const story = flag('sb9-dana-point-one-story');
    expect(story?.itemText).toContain(`limited to ${facts.oneStory}`);
    expect(story?.why).toMatch(/far below standard/);
    expect(story?.why).toContain(facts.usual);
    expect(facts.usual).toBe('28 feet and two stories');
    expect(flag('sb9-dana-point-floor-area-cap')?.why).toMatch(/must remove/);
  });

  it('cites the HCD letter with its date and page from the source index', () => {
    expect(facts.floorCite.text).toBe('HCD letter to Dana Point · 2023-04-17 · p. 4');
    expect(facts.floorCite.url).toMatch(/^https:\/\/www\.hcd\.ca\.gov\//);
    expect(facts.floorCite.title).toContain('checked 2026-11-07');
  });

  it('reads the clock, its law and its source from the timeline', () => {
    const review = getTimeline('SB9').find((p) => p.id === 'review');
    expect(review?.kind).toBe('LAW');
    expect(`${facts.clock.amount} ${facts.clock.unit}`).toBe(review?.value);
    expect(facts.clock.cite.text).toBe('HCD letter to Dana Point · 2025-09-15');
    expect(facts.clock.cite.title).toContain('65852.21(h)(1)');
    const faster = getFasterPaths('SB9').find((p) => p.id === 'sb9-60-days');
    expect(faster?.text).toMatch(/approve or deny/);
    expect(faster?.text).toMatch(/complete/);
    expect(faster?.text).toMatch(/deemed approved/);
  });

  it('says "unknown" and logs it, never guesses, when the data lacks a fact', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const empty: CityRun = { ...run, flags: [] };
    const thin = StoryFacts.from(empty, [], [], []);
    expect(thin.cityQuote.text).toBe('unknown');
    expect(thin.floorCap).toBe('unknown');
    expect(thin.clock.amount).toBe('unknown');
    expect(thin.lawName).toBe('unknown');
    expect(error).toHaveBeenCalledWith(expect.stringContaining('[story]'));
  });
});
