// When the sticky "Check your lot" button shows: after the first screen, and not near the bottom where the
// closing section already has its own button.

export interface ScrollState {
  scrollY: number;
  innerHeight: number;
  scrollHeight: number;
}

export function shouldShowSticky({ scrollY, innerHeight, scrollHeight }: ScrollState): boolean {
  return scrollY > innerHeight * 0.8 && scrollY < scrollHeight - innerHeight * 1.6;
}
