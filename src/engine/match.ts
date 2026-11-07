import type { Rule } from './types';

export function matchesRule(text: string, rule: Rule): boolean {
  if (rule.kind === 'citation') return rule.oldPattern.test(text);
  if (!rule.allOf.every((p) => p.test(text))) return false;
  if (rule.anyOf.length > 0 && !rule.anyOf.some((p) => p.test(text))) return false;
  return !rule.noneOf.some((p) => p.test(text));
}
