// Picks the look. The default is the espresso and latte theme; ?theme=classic brings back the earlier white and blue.
export function applyThemeFromUrl(): void {
  const theme = new URLSearchParams(window.location.search).get('theme');
  if (theme === 'classic') document.documentElement.dataset.theme = 'classic';
}

/** True when the visitor asked for less motion. Animations then show their end state. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
