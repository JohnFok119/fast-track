// Pure logic for the "Explain in plain words" feature: build the prompt, parse Claude's reply and validate it.
// The rules engine decides every flag. Claude only explains, and every point it makes must hang on a rule ID the
// engine already matched for that item. Claude never writes a citation; the UI shows the engine's citations.
import type { Flag } from '../contract/types.ts';
import type { ExplainPoint, ExplainResponse } from './types.ts';

/** Longest excerpt, in characters, sent to Claude per source. */
export const MAX_EXCERPT_CHARS = 16_000;

/** Section numbers, statute names, section signs and links. Point text matching this is dropped. */
const CITATION_PATTERN = /\b\d{5}(?:\.\d+)?\b|\b65852\.\d+|gov(?:ernment)?\.?\s*code|§|\bsection\b|https?:\/\/|www\./i;

export function containsCitation(text: string): boolean {
  return CITATION_PATTERN.test(text);
}

/** Every number written in the text, commas removed. */
export function numbersIn(text: string): string[] {
  return (text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, ''));
}

/** Rule IDs the engine matched for one item. Empty when every flag on the item is UNKNOWN. */
export function ruleIdsFor(flags: Flag[], itemId: string): string[] {
  const ids = flags.filter((f) => f.itemId === itemId && f.ruleId !== null).map((f) => f.ruleId as string);
  return [...new Set(ids)];
}

export interface PromptInput {
  cityName: string;
  itemId: string;
  flags: Flag[];
  /** Source excerpt text keyed by sourceId. */
  excerpts: Record<string, string>;
}

export const SYSTEM_PROMPT = [
  'You explain California housing permit requirements to a property owner who wants to go from permit to tenants fast.',
  'You do not decide whether a requirement is allowed. A rules engine already decided; you only explain its result.',
  'Use plain, everyday words a high-school student understands. Short sentences.',
  'Use only the source excerpts you are given. Do not add facts from memory.',
  'Never write a citation: no section numbers, no statute or code names, no "Section", no "§", no links.',
  'Reply with JSON only, no prose and no code fences.',
].join(' ');

export function buildPrompt(input: PromptInput): string {
  const item = input.flags.filter((f) => f.itemId === input.itemId);
  const first = item[0];
  const ruleIds = ruleIdsFor(input.flags, input.itemId);
  const results = item
    .filter((f) => f.ruleId !== null)
    .map((f) => `- ruleId "${f.ruleId}": result ${f.status}. Engine reason: ${f.why ?? '(none)'}`)
    .join('\n');
  const sources = Object.entries(input.excerpts)
    .map(([id, text]) => `<source id="${id}">\n${text.slice(0, MAX_EXCERPT_CHARS)}\n</source>`)
    .join('\n\n');
  return [
    `City: ${input.cityName}`,
    `Requirement (item ${input.itemId}): ${first?.itemText ?? ''}`,
    '',
    'What the rules engine decided:',
    results,
    '',
    'Source excerpts:',
    sources,
    '',
    'Task: for each ruleId above, write 1 to 3 short points for the owner covering:',
    'what this result means for them, what to do next, and how to save time (what to prepare up front, what to ask the city).',
    `Each point's ruleId must be one of: ${ruleIds.map((r) => `"${r}"`).join(', ')}.`,
    `Reply exactly in this shape: {"itemId": "${input.itemId}", "points": [{"ruleId": "...", "text": "..."}]}`,
  ].join('\n');
}

/** Pulls the model's text out of `claude -p --output-format json` stdout. Returns null on an error result. */
export function parseCliEnvelope(stdout: string): string | null {
  try {
    const env = JSON.parse(stdout) as { is_error?: boolean; result?: unknown };
    if (env.is_error || typeof env.result !== 'string') return null;
    return env.result;
  } catch {
    return null;
  }
}

/** Parses Claude's JSON reply, tolerating a code fence or stray text around the object. */
export function parseModelJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Keeps only points tied to an engine rule ID for this item, free of citations, and with no number that is not
 * already in the engine's data for the item. With no known numbers given, any point with a number is dropped. */
export function validate(
  raw: unknown,
  itemId: string,
  allowedRuleIds: string[],
  knownNumbers: Set<string> = new Set(),
): ExplainResponse {
  if (typeof raw !== 'object' || raw === null) return { fallback: true };
  const obj = raw as { itemId?: unknown; points?: unknown };
  if (obj.itemId !== itemId || !Array.isArray(obj.points)) return { fallback: true };
  const allowed = new Set(allowedRuleIds);
  const points: ExplainPoint[] = [];
  for (const p of obj.points as unknown[]) {
    if (typeof p !== 'object' || p === null) continue;
    const { ruleId, text } = p as { ruleId?: unknown; text?: unknown };
    if (typeof ruleId !== 'string' || typeof text !== 'string') continue;
    const trimmed = text.trim();
    if (!allowed.has(ruleId) || trimmed === '' || containsCitation(trimmed)) continue;
    if (!numbersIn(trimmed).every((n) => knownNumbers.has(n))) continue;
    points.push({ ruleId, text: trimmed });
  }
  return points.length > 0 ? { fallback: false, itemId, points } : { fallback: true };
}
