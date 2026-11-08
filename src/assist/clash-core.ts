// Pure logic for the clash summaries: group the engine's CONFLICTS flags, build the prompt, and check Claude's
// reply. The rule set decides what is a clash; Claude only puts it in plain words. No fs and no process here.
import type { City, CityRun, Flag, Pathway } from '../contract/types.ts';
import type { ClashSummary } from './clash-types.ts';
import { containsCitation, numbersIn } from './core.ts';

export interface ClashInput {
  city: City;
  cityName: string;
  pathway: Pathway;
  ruleId: string;
  itemIds: string[];
  /** The item texts for itemIds, in order. */
  cityLines: string[];
  /** The engine's reason (flag.why) for this rule. */
  why: string;
  note: string | null;
  /** The state source excerpt. */
  letter: { title: string; text: string };
  /** Legal deadlines (LAW phases, plus the clocks for ADU). */
  deadlines: { label: string; value: string }[];
  /** ASSUMPTION phases: the event brief's typical times. */
  typical: { label: string; value: string }[];
}

export const CLASH_SYSTEM_PROMPT = [
  "You put one clash between a California city's housing rule and state law into plain words for a property owner.",
  'A rules engine already decided this is a clash. You do not decide it; you only explain it.',
  'Use plain, everyday words a high-school student understands. Short sentences.',
  'Use only the text you are given. Do not add facts from memory.',
  'Never write a citation: no section numbers, no code or statute names, no "Section", no "§", no links.',
  'Never use the em dash character. Use commas or a plain hyphen instead.',
  'Reply with JSON only, no prose and no code fences.',
].join(' ');

const REPLY_SHAPE =
  '{"title": "...", "citySays": "...", "stateSays": "...", "clash": "...", "time": {"low": 1, "high": 2, "unit": "months", "basis": "..."}}';
const MAX_TEXT = 280;
const MAX_TITLE_CHARS = 40;
const MAX_TITLE_WORDS = 4;
const MAX_BY_UNIT = { months: 12, weeks: 52 } as const;

/** CONFLICTS flags grouped by rule, in order of first appearance. */
export function clashGroups(run: CityRun): { ruleId: string; flags: Flag[] }[] {
  const groups = new Map<string, Flag[]>();
  for (const f of run.flags) {
    if (f.status !== 'CONFLICTS' || f.ruleId === null) continue;
    groups.set(f.ruleId, [...(groups.get(f.ruleId) ?? []), f]);
  }
  return [...groups].map(([ruleId, flags]) => ({ ruleId, flags }));
}

/** The most cited hcd- source among the flags' citations, or null when there is none. */
export function letterSourceId(flags: Flag[]): string | null {
  const counts = new Map<string, number>();
  for (const c of flags.flatMap((f) => f.citations)) {
    if (c.sourceId.startsWith('hcd-')) counts.set(c.sourceId, (counts.get(c.sourceId) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [id, n] of counts) {
    if (n > bestCount) {
      best = id;
      bestCount = n;
    }
  }
  return best;
}

/** Everything from the "## Excerpts" heading up to the next "## " heading, or the end. */
export function excerptText(markdown: string): string {
  const start = markdown.search(/^## Excerpts\b/m);
  if (start === -1) return '';
  const rest = markdown.slice(start);
  const next = rest.slice(2).search(/^## /m);
  return next === -1 ? rest : rest.slice(0, next + 2);
}

/** Every number in the text Claude is given. A summary may use no other number. */
export function knownNumbers(input: ClashInput): Set<string> {
  const pairs = [...input.deadlines, ...input.typical].flatMap((p) => [p.label, p.value]);
  const texts = [...input.cityLines, input.why, input.note ?? '', input.letter.text, ...pairs];
  return new Set(texts.flatMap(numbersIn));
}

function pairs(list: { label: string; value: string }[]): string {
  return list.length > 0 ? list.map((p) => `- ${p.label}: ${p.value}`).join('\n') : '- (none)';
}

export function buildClashPrompt(input: ClashInput): string {
  return [
    `City: ${input.cityName}`,
    '',
    `What ${input.cityName} says (its own lines):`,
    ...input.cityLines.map((l) => `"${l}"`),
    '',
    `Why the rules engine flagged it: ${input.why}`,
    `Note: ${input.note ?? '(none)'}`,
    '',
    `State source: ${input.letter.title}`,
    input.letter.text,
    '',
    'Deadlines in state law:',
    pairs(input.deadlines),
    '',
    'Typical times, an estimate from the event brief, not measured:',
    pairs(input.typical),
    '',
    'Task: write these fields.',
    '- title: 2 to 4 words naming the city\'s rule, sentence case, no period (example: "Two unit cap").',
    '- citySays: one sentence: what the city requires.',
    '- stateSays: one or two sentences: what the state says about it.',
    '- clash: one sentence: why they clash and what it means for the owner.',
    '- time: the time the owner saves if this clash is cleared before they apply, instead of being fought after.',
    '  {"low": n, "high": n, "unit": "weeks" or "months", "basis": one sentence naming which of the given deadlines or typical times the estimate rests on}.',
    '  Whole numbers. Base it only on the deadlines and typical times given.',
    `Reply exactly in this shape: ${REPLY_SHAPE}`,
  ].join('\n');
}

type Check = { ok: true; value: string } | { ok: false; reason: string };

function text(v: unknown, field: string): Check {
  if (typeof v !== 'string' || v.trim() === '') return { ok: false, reason: `${field} is missing or empty` };
  return { ok: true, value: v.trim() };
}

function prose(v: unknown, field: string, known: Set<string>): Check {
  const t = text(v, field);
  if (!t.ok) return t;
  const s = t.value;
  if (s.length > MAX_TEXT) return { ok: false, reason: `${field} is over ${MAX_TEXT} characters` };
  if (/[–—]/.test(s)) return { ok: false, reason: `${field} has an em dash or en dash` };
  if (containsCitation(s)) return { ok: false, reason: `${field} has a citation` };
  const unknown = numbersIn(s).find((n) => !known.has(n));
  if (unknown !== undefined) return { ok: false, reason: `${field} uses the number ${unknown}, which the sources do not give` };
  return t;
}

function title(v: unknown): Check {
  const t = text(v, 'title');
  if (!t.ok) return t;
  const bad = t.value.split(/\s+/).length > MAX_TITLE_WORDS || t.value.length > MAX_TITLE_CHARS || t.value.endsWith('.');
  return bad ? { ok: false, reason: 'title must be at most 4 words and 40 characters, with no period' } : t;
}

function whole(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

function timeError(t: Record<string, unknown>): string | null {
  const { low, high, unit } = t;
  if (!whole(low) || !whole(high)) return 'time.low and time.high must be positive whole numbers';
  if (low > high) return 'time.low must not be above time.high';
  if (unit !== 'weeks' && unit !== 'months') return 'time.unit must be "weeks" or "months"';
  return high > MAX_BY_UNIT[unit] ? `time.high is over ${MAX_BY_UNIT[unit]} ${unit}` : null;
}

export function validateClash(raw: unknown, input: ClashInput): { ok: true; summary: ClashSummary } | { ok: false; reason: string } {
  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'reply is not a JSON object' };
  const o = raw as Record<string, unknown>;
  if (typeof o.time !== 'object' || o.time === null) return { ok: false, reason: 'time is missing' };
  const t = o.time as Record<string, unknown>;
  const known = knownNumbers(input);
  const checks = [
    title(o.title),
    prose(o.citySays, 'citySays', known),
    prose(o.stateSays, 'stateSays', known),
    prose(o.clash, 'clash', known),
    prose(t.basis, 'basis', known),
  ];
  const failed = checks.find((c) => !c.ok);
  if (failed && !failed.ok) return failed;
  const err = timeError(t);
  if (err !== null) return { ok: false, reason: err };
  const [ti, cs, ss, cl, basis] = checks.map((c) => (c.ok ? c.value : ''));
  return {
    ok: true,
    summary: {
      city: input.city,
      ruleId: input.ruleId,
      itemIds: input.itemIds,
      title: ti ?? '',
      citySays: cs ?? '',
      stateSays: ss ?? '',
      clash: cl ?? '',
      time: { low: t.low as number, high: t.high as number, unit: t.unit as 'weeks' | 'months', basis: basis ?? '' },
    },
  };
}
