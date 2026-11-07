// Usage: npm run check <irvine|anaheim>
import { CITIES } from '../src/contract/types';
import type { Citation, City, Flag } from '../src/contract/types';
import { runCheck } from '../src/engine/default';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection in check script:', reason);
  process.exit(1);
});

function formatCitation(c: Citation): string {
  const page = c.page ? ` (p. ${c.page})` : '';
  return `  - ${c.label}${page} ${c.url} checked ${c.checked}`;
}

function formatFlag(flag: Flag): string {
  const text = flag.itemText.length > 100 ? flag.itemText.slice(0, 100) : flag.itemText;
  const lines = [flag.status, `  item ${flag.itemId}: ${text}`, `  rule: ${flag.ruleId ?? 'none'}`];
  return [...lines, ...flag.citations.map(formatCitation)].join('\n');
}

const arg = process.argv[2];
if (!arg || !(CITIES as readonly string[]).includes(arg)) {
  console.error(`Usage: npm run check <${CITIES.join('|')}>`);
  process.exit(1);
}
console.log(runCheck(arg as City).flags.map(formatFlag).join('\n\n'));
