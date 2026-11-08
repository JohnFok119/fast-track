// Usage: npm run summaries [-- --dry-run]
// Has Claude put each clash the rule engine finds into plain words, checks every reply, and saves
// data/summaries/clashes.json. --dry-run prints the prompts and calls no model. Run it on a laptop logged in to claude.
import { readFile, writeFile } from 'node:fs/promises';
import { CITIES } from '../src/contract/types.ts';
import type { City } from '../src/contract/types.ts';
import { getTimeline, runCheck } from '../src/contract/api.ts';
import { parseCliEnvelope, parseModelJson } from '../src/assist/core.ts';
import { buildClashPrompt, CLASH_SYSTEM_PROMPT, clashGroups, excerptText, letterSourceId, validateClash } from '../src/assist/clash-core.ts';
import type { ClashInput } from '../src/assist/clash-core.ts';
import type { ClashSummaries, ClashSummary } from '../src/assist/clash-types.ts';
import { runClaude } from '../vite-plugins/claude-route.ts';

const OUT = 'data/summaries/clashes.json';
const TIMEOUT_MS = 120_000;
const RETRIES = 2;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection in write-clash-summaries:', reason);
  process.exit(1);
});

interface SourceEntry {
  id: string;
  title: string;
  file?: string;
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function buildInputs(): Promise<ClashInput[]> {
  const [sources, clocks] = await Promise.all([
    readJson<SourceEntry[]>('data/sources/index.json'),
    readJson<{ clocks: { label: string; value: string }[] }>('data/rules/clocks.json'),
  ]);
  const inputs: ClashInput[] = [];
  for (const city of CITIES) {
    const run = runCheck(city);
    const phases = getTimeline(run.pathway);
    const law = phases.filter((p) => p.kind === 'LAW').map((p) => ({ label: p.label, value: p.value }));
    const clockPairs = run.pathway === 'ADU' ? clocks.clocks.map((c) => ({ label: c.label, value: c.value })) : [];
    const typical = phases.filter((p) => p.kind === 'ASSUMPTION').map((p) => ({ label: p.label, value: p.value }));
    for (const g of clashGroups(run)) {
      const id = letterSourceId(g.flags);
      const entry = sources.find((s) => s.id === id);
      if (!id || !entry?.file) throw new Error(`${city} ${g.ruleId}: no state letter source with a file (found ${String(id)})`);
      const first = g.flags[0];
      inputs.push({
        city,
        cityName: run.name,
        pathway: run.pathway,
        ruleId: g.ruleId,
        itemIds: g.flags.map((f) => f.itemId),
        cityLines: g.flags.map((f) => f.itemText),
        why: first?.why ?? '',
        note: first?.note ?? null,
        letter: { title: entry.title, text: excerptText(await readFile(entry.file, 'utf8')) },
        deadlines: [...law, ...clockPairs],
        typical,
      });
    }
  }
  return inputs;
}

async function summarise(input: ClashInput): Promise<ClashSummary | null> {
  const base = buildClashPrompt(input);
  let prompt = base;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const text = parseCliEnvelope(await runClaude(prompt, CLASH_SYSTEM_PROMPT, TIMEOUT_MS));
    const res = text === null ? { ok: false as const, reason: 'claude returned an error result' } : validateClash(parseModelJson(text), input);
    if (res.ok) return res.summary;
    console.error(`Rejected ${input.city} ${input.ruleId} (attempt ${attempt + 1}): ${res.reason}`);
    prompt = `${base}\n\nYour last reply was rejected: ${res.reason}. Reply again, fixing that.`;
  }
  return null;
}

async function main(): Promise<void> {
  const inputs = await buildInputs();
  if (process.argv.includes('--dry-run')) {
    for (const i of inputs) console.log(`${i.city} ${i.ruleId}\n${buildClashPrompt(i).slice(0, 400)}\n---`);
    console.log(`${inputs.length} clash groups (dry run, no model called, nothing written)`);
    return;
  }
  const results = await Promise.all(inputs.map(summarise));
  const failed = inputs.filter((_, n) => results[n] === null);
  if (failed.length > 0) {
    console.error(`Failed after ${RETRIES + 1} tries: ${failed.map((i) => `${i.city} ${i.ruleId}`).join(', ')}. Nothing written.`);
    process.exit(1);
  }
  const clashes = results.filter((r): r is ClashSummary => r !== null);
  const order = (c: City): number => CITIES.indexOf(c);
  clashes.sort((a, b) => order(a.city) - order(b.city));
  const existing = await readJson<ClashSummaries>(OUT);
  const out: ClashSummaries = { about: existing.about, model: 'claude sonnet', written: new Date().toISOString().slice(0, 10), clashes };
  await writeFile(OUT, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Wrote ${clashes.length} summaries to ${OUT}`);
}

main().catch((e: unknown) => {
  console.error('write-clash-summaries failed:', e);
  process.exit(1);
});
