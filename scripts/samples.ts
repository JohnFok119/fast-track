// Usage: npm run samples. Writes the labelled SAMPLE runs the UI can load before the engine is wired in.
import { writeFileSync } from 'node:fs';
import { CITIES } from '../src/contract/types';
import { runCheck } from '../src/engine/default';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection in samples script:', reason);
  process.exit(1);
});

for (const city of CITIES) {
  const run = runCheck(city);
  const sample = { ...run, sample: true, sourceLabel: `SAMPLE. ${run.sourceLabel}` };
  const path = `data/samples/${city}-run.json`;
  writeFileSync(path, `${JSON.stringify(sample, null, 2)}\n`);
  console.log(`Wrote ${path} (${sample.flags.length} flags)`);
}
