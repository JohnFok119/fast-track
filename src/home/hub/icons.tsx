// Small line icons for the hub's source cards and the step 1 lot card.
import type { FeedKind } from './HubModel';

export function FeedIcon({ kind }: { kind: FeedKind }) {
  if (kind === 'law') return <>§</>;
  const path: Record<Exclude<FeedKind, 'law'>, string> = {
    city: 'M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6',
    letter: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h5',
    book: 'M4 5c3-1.5 5.5-1.5 8 0v15c-2.5-1.5-5-1.5-8 0z M12 5c2.5-1.5 5-1.5 8 0v15c-3-1.5-5.5-1.5-8 0',
  };
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={path[kind]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="#9e542f" />
      <circle cx="12" cy="9" r="2.6" fill="#faf8f6" />
    </svg>
  );
}
