import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { claudeRoute } from './vite-plugins/claude-route.ts';

export default defineConfig({
  plugins: [react(), tailwindcss(), claudeRoute()],
  // Agent worktrees are whole checkouts inside the repo: adding or removing one must not clear the dev server's cache.
  server: { watch: { ignored: ['**/.claude/worktrees/**'] } },
  // Two pages: the homepage at / and the working app at /app/.
  build: {
    // three.js's renderer (about 570 kB) loads only when a 3D scene nears the screen, never on first paint.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        app: fileURLToPath(new URL('./app/index.html', import.meta.url)),
      },
    },
  },
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['tests/setup.ts'],
  },
});
