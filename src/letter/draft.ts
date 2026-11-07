// Draft letters the applicant reviews and sends themselves. Pure text: no I/O, no network, no clock.
// Every law, section and date in a draft comes from the flags and citations passed in.
import type { Citation, CityRun, Contact, Flag } from '../contract/types';
import { VERDICT } from './verdict';

export interface AttentionItem {
  itemId: string;
  text: string;
  flags: Flag[];
}

const DRAFT_LINE = 'DRAFT. Review before sending. Not legal advice. Fast Track sends nothing.';
const SIGNATURE = ['[Your name]', '[Phone or email]'];
const MAX_QUOTE = 200;

/** Items with at least one CONFLICTS or OUTDATED_CITATION flag, in city order. UNKNOWN flags are left out. */
export function itemsNeedingAttention(run: CityRun): AttentionItem[] {
  const groups = new Map<string, AttentionItem>();
  for (const flag of run.flags) {
    const group = groups.get(flag.itemId) ?? { itemId: flag.itemId, text: flag.itemText, flags: [] };
    group.flags.push(flag);
    groups.set(flag.itemId, group);
  }
  const items: AttentionItem[] = [];
  for (const group of groups.values()) {
    const needs = group.flags.some((f) => f.status === 'CONFLICTS' || f.status === 'OUTDATED_CITATION');
    if (needs) items.push({ ...group, flags: group.flags.filter((f) => f.status !== 'UNKNOWN') });
  }
  return items;
}

function quote(raw: string): string {
  // Saved city text that opens with its own quote (sometimes followed by a section reference) keeps its quote marks.
  const text = raw.trim();
  if (text.startsWith('"')) {
    if (text.length <= MAX_QUOTE) return text;
    // End at the closing quote when the quote fits; otherwise cut inside it and close it.
    const close = text.indexOf('"', 1);
    return close !== -1 && close < MAX_QUOTE ? text.slice(0, close + 1) : `${text.slice(0, MAX_QUOTE)}..."`;
  }
  const short = text.length > MAX_QUOTE ? `${text.slice(0, MAX_QUOTE)}...` : text;
  return `"${short}"`;
}

function sourceLine(c: Citation): string {
  const section = c.section ? `, section ${c.section}` : '';
  const page = c.page ? `, p. ${c.page}` : '';
  return `   Source: ${c.label}${section}${page}. ${c.url} (checked ${c.checked})`;
}

function flagLines(flag: Flag): string[] {
  const lines = [`   ${VERDICT[flag.status].letter}.`, ...flag.citations.map(sourceLine)];
  const m = flag.mapping;
  if (m) {
    const exact = m.exactSection ? ` (exact: ${m.exactSection})` : ' (no single replacement section)';
    lines.push(`   Old section ${m.old}, now ${m.now}${exact}.`);
  }
  return lines;
}

function itemList(items: AttentionItem[]): string[] {
  return items.flatMap((item, i) => [`${i + 1}. ${quote(item.text)}`, ...item.flags.flatMap(flagLines), '']);
}

function noItemsDraft(header: string[], body = 'Fast Track found no line in these requirements that needs a response.'): string {
  return [...header, '', DRAFT_LINE, '', body, '', ...SIGNATURE].join('\n');
}

/** Items with a CONFLICTS flag, keeping only those flags. An old law number alone is not a matter for HCD. */
export function conflictItems(run: CityRun): AttentionItem[] {
  return itemsNeedingAttention(run)
    .map((item) => ({ ...item, flags: item.flags.filter((f) => f.status === 'CONFLICTS') }))
    .filter((item) => item.flags.length > 0);
}

/** A reply to the city asking it to remove or update the requirements that need attention. */
export function draftCityReply(run: CityRun): string {
  const office = run.contacts[0]?.office ?? 'The permit desk';
  const header = [`To: ${office}, City of ${run.name}`, 'Re: [Application number], [Project address]'];
  const items = itemsNeedingAttention(run);
  if (items.length === 0) return noItemsDraft(header);
  return [
    ...header,
    '',
    DRAFT_LINE,
    '',
    'Please review the following requirements for my application.',
    '',
    ...itemList(items),
    'I ask the city to remove or update these requirements, citing the sources above.',
    '',
    ...SIGNATURE,
  ].join('\n');
}

/** A request to HCD for technical assistance on the requirements that need attention. */
export function draftHcdRequest(run: CityRun, escalation: Contact): string {
  const header = [`To: ${escalation.office}`, `Re: Request for technical assistance, City of ${run.name}`];
  const items = conflictItems(run);
  if (items.length === 0) {
    return noItemsDraft(header, 'Fast Track found no line in these requirements that the state says a city cannot require, so there is no line to raise with HCD.');
  }
  return [
    ...header,
    '',
    DRAFT_LINE,
    '',
    `I ask HCD for technical assistance on the following requirements from the City of ${run.name}.`,
    '',
    ...itemList(items),
    `Source for this route: ${escalation.citation.label}. ${escalation.citation.url}`,
    '',
    ...SIGNATURE,
  ].join('\n');
}
