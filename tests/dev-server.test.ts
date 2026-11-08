import { describe, expect, it } from 'vitest';
import config from '../vite.config';

describe('dev server', () => {
  // Agent worktrees are whole checkouts inside the repo. When one is added or removed, its tsconfig.json
  // changes, and a watching dev server clears its cache, which left the app blank on 2026-11-08.
  it('does not watch the agent worktrees inside the repo', () => {
    expect(config.server?.watch?.ignored).toContain('**/.claude/worktrees/**');
  });
});
