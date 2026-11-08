// Shared test setup. Component tests opt into a browser-like DOM with a `// @vitest-environment jsdom` comment;
// for those, this adds the browser APIs jsdom lacks and unmounts what each test rendered.
import { afterEach } from 'vitest';

if (typeof window !== 'undefined') {
  const { installBrowserFakes } = await import('./browser-fakes');
  installBrowserFakes();
  const { cleanup } = await import('@testing-library/react');
  afterEach(() => cleanup());
}
