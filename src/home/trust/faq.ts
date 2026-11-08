// The FAQ as data. Counts, cities, deadlines and citations come from HomeFacts (the rule set and the sources);
// the rest is plain product copy. Answers are short plain sentences.
import type { Citation } from '../../contract/types';
import type { HomeFacts } from './facts';

/** Text with light emphasis: a plain string, an underlined word, a bold one, or a name set in Claude's serif. */
export type Seg = string | { u: string } | { b: string } | { claude: string };

export interface NextItem {
  title: string;
  text: string;
  /** Source line for items that state a law or a deadline. */
  cite?: string;
}

export interface FaqItem {
  question: string;
  answer?: Seg[];
  next?: NextItem[];
  note?: string;
  open?: boolean;
}

export interface Faq {
  banner: Seg[];
  items: FaqItem[];
}

export function flatten(segs: Seg[]): string {
  return segs.map((s) => (typeof s === 'string' ? s : 'u' in s ? s.u : 'b' in s ? s.b : s.claude)).join('');
}

function list(names: string[]): string {
  return names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function citeLine(c: Citation): string {
  const parts = [c.label, c.section ? `§ ${c.section}` : '', c.page ? `p. ${c.page}` : ''];
  return parts.filter(Boolean).join(' · ');
}

function nextItems(facts: HomeFacts): NextItem[] {
  const sixty = facts.fasterPaths.find((p) => p.id === 'sb9-60-days');
  const sections = [...new Set(facts.fasterPaths.flatMap((p) => p.citations.map((c) => c.section).filter(Boolean)))];
  return [
    { title: 'Every California city', text: "AI reads the code and HCD's letters. A person checks each rule." },
    { title: "Your city's comment letter", text: 'Upload the corrections you got back, and check each line.' },
    { title: 'A clock for every deadline', text: sixty?.text ?? 'Track each legal deadline.', cite: sixty?.citations[0] && citeLine(sixty.citations[0]) },
    {
      title: 'Faster paths',
      text: `${facts.fasterPaths.map((p) => p.title).join('. ')}.`,
      cite: sections.map((s) => `§ ${s}`).join(' · '),
    },
    { title: 'Day-one reminders', text: 'Start the slow steps early, like power and water.' },
    { title: 'Portfolio view', text: 'Track several lots at once.' },
  ];
}

export function buildFaq(facts: HomeFacts): Faq {
  const cities = `${facts.cityNames.length} cities`;
  const mirror = facts.hasMirror ? ' Some statutes were read on a mirror site and still need checking on leginfo.ca.gov.' : '';
  return {
    banner: [
      'Fast Track is a ', { u: 'prototype' }, ', built in one day at the ', { claude: 'Claude Impact Lab' }, '. It is ', { u: 'not legal advice' },
      '. Talk to a professional before you act.',
    ],
    items: [
      {
        question: 'Is this the finished product?',
        open: true,
        answer: [
          "No, it's a ", { u: 'prototype' }, `. Today it covers `, { b: cities }, ' with ', { b: `${facts.ruleCount} rules` },
          ' that we wrote and checked by hand. To make it work everywhere, we would use ',
          { b: "AI that reads each city's code and HCD's letters" },
          ' to propose new rules. A person would check every rule before it ships.',
        ],
      },
      { question: "What's next?", next: nextItems(facts), note: `Planned, not built.${mirror}` },
      { question: 'Is this legal advice?', answer: ['No. Fast Track is a prototype. Talk to a professional before you act.'] },
      {
        question: 'Where do the rules come from?',
        answer: ["California's Government Code and HCD's published letters and ADU Handbook. Each rule names its source, page and the date we checked it."],
      },
      {
        question: "Does AI decide what's a clash?",
        answer: ['No. A fixed rule set does. Claude wrote the plain-words summaries once, and a person checks them before they ship.'],
      },
      {
        question: 'How do you estimate the time a clash costs?',
        answer: [
          "Claude estimates it from the city's line, the state's answer and the review deadlines in state law, and every number is labeled an estimate. The more real permit timelines we gather, the closer the estimates get.",
        ],
      },
      { question: 'Which cities?', answer: [`${facts.cityNames.length} Orange County cities so far: ${list(facts.cityNames)}.`] },
      { question: 'Will it contact the city for me?', answer: ['No. It drafts a response. You review it and send it yourself.'] },
      { question: 'What does "unknown" mean?', answer: ['No rule covers that line yet, so Fast Track says so instead of guessing.'] },
    ],
  };
}
