// Pure logic for the whole-city plan: one Claude pass over a city's flags, steps, timeline and contacts that returns
// an ordered action plan, who to ask about each unchecked line, and the time the legal clocks protect.
// Claude only orders and explains. Every entry must point at something the engine already produced, every citation
// shown comes from the engine, and any number Claude writes must already appear in the data it was given.
import type { Citation, CityRun, Contact, Phase, Step } from '../contract/types';
import { containsCitation, MAX_EXCERPT_CHARS } from './core';
import type { PlanAction, PlanGap, PlanResponse, PlanTime } from './types';

export interface PlanInput {
  run: CityRun;
  steps: Step[];
  timeline: Phase[];
  /** HCD, the place to go when the city will not fix a requirement. Always the last contact. */
  escalation: Contact;
  excerpts: Record<string, string>;
}

export const PLAN_SYSTEM_PROMPT = [
  'You help a property owner who has bought a lot in California and wants to go from permit to tenants fast.',
  'A rules engine has already checked the city\'s requirements against state law. You do not decide anything new.',
  'You order and explain what the engine found, in plain words a high-school student understands. Short sentences.',
  'Use only the data and source excerpts you are given. Never add facts or numbers from memory.',
  'Never write a citation: no section numbers, no statute or code names, no "Section", no "§", no links.',
  'Reply with JSON only, no prose and no code fences.',
].join(' ');

export function contactsFor(input: Pick<PlanInput, 'run' | 'escalation'>): Contact[] {
  return [...input.run.contacts, input.escalation];
}

/** Item IDs where every flag is UNKNOWN: the gaps the owner must ask someone about. */
export function unknownItems(run: CityRun): string[] {
  const ids = [...new Set(run.flags.map((f) => f.itemId))];
  return ids.filter((id) => run.flags.filter((f) => f.itemId === id).every((f) => f.status === 'UNKNOWN'));
}

function list<T>(items: T[], fmt: (t: T, i: number) => string): string {
  return items.length === 0 ? '(none)' : items.map(fmt).join('\n');
}

export function buildPlanPrompt(input: PlanInput): string {
  const { run, steps, timeline, excerpts } = input;
  const contacts = contactsFor(input);
  const unknown = new Set(unknownItems(run));
  const matched = run.flags.filter((f) => f.ruleId !== null);
  const sources = Object.entries(excerpts)
    .map(([id, text]) => `<source id="${id}">\n${text.slice(0, MAX_EXCERPT_CHARS)}\n</source>`)
    .join('\n\n');
  return [
    `City: ${run.name}. Project type: ${run.pathway}.`,
    '',
    'Requirements the engine matched to a rule (ref "rule:<ruleId>"):',
    list(matched, (f) => `- rule:${f.ruleId} on item ${f.itemId} "${f.itemText}": ${f.status}. ${f.why ?? ''}`),
    '',
    'Requirements no rule covers (gaps; use their itemId):',
    list(run.flags.filter((f) => unknown.has(f.itemId)), (f) => `- ${f.itemId}: "${f.itemText}"`),
    '',
    'Recommended steps (ref "step:<n>"):',
    list(steps, (s, i) => `- step:${i} (${s.kind}): ${s.text}`),
    '',
    'Contacts (use the number):',
    list(contacts, (c, i) => `- ${i}: ${c.office}, handles ${c.handles}`),
    '',
    'Timeline phases (ref "phase:<id>"; LAW is a legal deadline, ASSUMPTION is an estimate and must be called one):',
    list(timeline, (p) => `- phase:${p.id} ${p.label}: ${p.value} (${p.kind})${p.note ? `. ${p.note}` : ''}`),
    '',
    'Source excerpts:',
    sources,
    '',
    'Task, for the owner:',
    '1. "actions": the fast-track plan, in the order to do things, 4 to 8 entries. Each has a "ref" from above and "text".',
    '2. "gaps": one entry per gap item: {"itemId", "contact": <contact number best placed to answer>, "text": what to ask}.',
    '3. "time": 1 to 4 entries {"phase": "<id>", "text"}: how each legal deadline protects their time. Say "estimate" for ASSUMPTION.',
    `Reply exactly: {"city": "${run.city}", "actions": [...], "gaps": [...], "time": [...]}`,
  ].join('\n');
}

/** Every number written anywhere in the data Claude was given. */
export function knownNumbers(input: PlanInput): Set<string> {
  const text = JSON.stringify([input.run, input.steps, input.timeline, input.escalation]);
  return new Set((text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, '')));
}

function cleanText(raw: unknown, numbers: Set<string>): string | null {
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  if (text === '' || containsCitation(text)) return null;
  const nums = (text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, ''));
  return nums.every((n) => numbers.has(n)) ? text : null;
}

function resolveRef(ref: string, input: PlanInput, contacts: Contact[]): Citation[] | null {
  const [kind, id = ''] = ref.split(':');
  if (kind === 'rule') {
    const flags = input.run.flags.filter((f) => f.ruleId === id);
    return flags.length > 0 ? flags.flatMap((f) => f.citations) : null;
  }
  const n = Number(id);
  if (kind === 'step') {
    const step = Number.isInteger(n) ? input.steps[n] : undefined;
    return step ? (step.citation ? [step.citation] : []) : null;
  }
  if (kind === 'contact') {
    const c = Number.isInteger(n) ? contacts[n] : undefined;
    return c ? [c.citation] : null;
  }
  if (kind === 'phase') {
    const p = input.timeline.find((x) => x.id === id);
    return p ? (p.citation ? [p.citation] : []) : null;
  }
  return null;
}

function asArray(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null) : [];
}

/** Keeps only entries that point at engine data and carry no citation or invented number. Citations are attached
 * from the engine, never from Claude. */
export function validatePlan(raw: unknown, input: PlanInput): PlanResponse {
  if (typeof raw !== 'object' || raw === null) return { fallback: true };
  const obj = raw as Record<string, unknown>;
  if (obj.city !== input.run.city) return { fallback: true };
  const contacts = contactsFor(input);
  const numbers = knownNumbers(input);
  const gapIds = new Set(unknownItems(input.run));

  const actions: PlanAction[] = [];
  for (const a of asArray(obj.actions)) {
    const text = cleanText(a.text, numbers);
    const citations = typeof a.ref === 'string' ? resolveRef(a.ref, input, contacts) : null;
    if (text && citations) actions.push({ ref: a.ref as string, text, citations });
  }

  const gaps: PlanGap[] = [];
  for (const g of asArray(obj.gaps)) {
    const text = cleanText(g.text, numbers);
    const n = typeof g.contact === 'string' ? Number(g.contact.replace(/^contact:/, '')) : g.contact;
    const contact = typeof n === 'number' && Number.isInteger(n) ? contacts[n] : undefined;
    if (text && contact && typeof g.itemId === 'string' && gapIds.has(g.itemId)) {
      gaps.push({ itemId: g.itemId, text, contact });
    }
  }

  const time: PlanTime[] = [];
  for (const t of asArray(obj.time)) {
    const text = cleanText(t.text, numbers);
    const id = typeof t.phase === 'string' ? t.phase.replace(/^phase:/, '') : null;
    const phase = input.timeline.find((p) => p.id === id);
    if (text && phase) time.push({ phase, text });
  }

  if (actions.length === 0) return { fallback: true };
  return { fallback: false, city: input.run.city, actions, gaps, time };
}
