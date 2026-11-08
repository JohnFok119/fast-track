import { describe, expect, it } from 'vitest';
import { buildFaq, flatten } from '../../src/home/trust/faq';
import { HomeFacts } from '../../src/home/trust/facts';

const faq = buildFaq(HomeFacts.fromData());

describe('FAQ data', () => {
  it('has the prototype banner, the AI plan and the What is next list', () => {
    expect(flatten(faq.banner)).toMatch(/prototype/i);
    expect(flatten(faq.banner)).toMatch(/not legal advice/i);
    const finished = faq.items.find((i) => i.question === 'Is this the finished product?')!;
    expect(flatten(finished.answer!)).toMatch(/\bAI\b/);
    const next = faq.items.find((i) => i.question === "What's next?")!;
    expect(next.next!.map((n) => n.title)).toEqual([
      'Every California city',
      "Your city's comment letter",
      'A clock for every deadline',
      'Faster paths',
      'Day-one reminders',
      'Portfolio view',
    ]);
  });

  it('takes the city and rule counts from the data', () => {
    const finished = flatten(faq.items[0]!.answer!);
    expect(finished).toContain('4 cities');
    expect(finished).toContain('13 rules');
  });

  it('explains how the time a clash costs is estimated, right after the AI question', () => {
    const questions = faq.items.map((i) => i.question);
    const at = questions.indexOf('How do you estimate the time a clash costs?');
    expect(at).toBe(questions.indexOf("Does AI decide what's a clash?") + 1);
    expect(flatten(faq.items[at]!.answer!)).toMatch(/estimate/i);
  });

  it('keeps every answer short, plain, and free of the em dash', () => {
    for (const item of faq.items) {
      const texts = [item.answer ? flatten(item.answer) : '', ...(item.next ?? []).map((n) => n.text)];
      for (const t of texts.filter(Boolean)) {
        expect(t).not.toContain('\u2014');
        expect(t.split(/\s+/).length).toBeLessThanOrEqual(60);
        for (const sentence of t.split(/(?<=[.!?])\s+/)) expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(35);
        expect(t).toMatch(/[.!?]$/);
      }
    }
  });
});
