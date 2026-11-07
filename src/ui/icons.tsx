// Small line icons, drawn in currentColor.
import type { JSX } from 'react';
const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export function KeyIcon() {
  return (
    <svg {...base}>
      <path d="M3 21h18M5 21V10l7-5 7 5v11" />
      <circle cx="12" cy="13" r="2" />
      <path d="M12 15v3" />
    </svg>
  );
}

export function TagIcon() {
  return (
    <svg {...base}>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

export function SplitIcon() {
  return (
    <svg {...base}>
      <rect x="3" y="6" width="18" height="13" />
      <path d="M12 6v13" strokeDasharray="2 2" />
      <path d="M6 12h3M15 12h3" />
    </svg>
  );
}

export function BuildingIcon() {
  return (
    <svg {...base} width={18} height={18}>
      <path d="M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01" />
    </svg>
  );
}

export function StateIcon() {
  return (
    <svg {...base} width={18} height={18}>
      <path d="M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 21h18" />
    </svg>
  );
}

export const PATH_ICONS: Record<string, () => JSX.Element> = { 'adu-rent': KeyIcon, 'adu-sell': TagIcon, sb9: SplitIcon };
