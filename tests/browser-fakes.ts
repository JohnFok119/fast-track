// Stand-ins for browser APIs that jsdom does not implement. Observers report every element as on screen at once,
// so reveal-on-scroll and start-when-reached code runs in tests. matchMedia answers "no" unless a test sets it.
type IoCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;

class FakeIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];
  private readonly callback: IoCallback;
  constructor(callback: IoCallback) {
    this.callback = callback;
  }
  observe(target: Element): void {
    const entry = { target, isIntersecting: true, intersectionRatio: 1 } as unknown as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class FakeResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

/** Media queries that should match, e.g. '(prefers-reduced-motion: reduce)'. Tests may add to it. */
export const matchingQueries = new Set<string>();

export function installBrowserFakes(): void {
  Object.assign(window, { IntersectionObserver: FakeIntersectionObserver, ResizeObserver: FakeResizeObserver });
  window.matchMedia = (query: string) =>
    ({
      matches: matchingQueries.has(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
  window.scrollTo = () => {};
}
