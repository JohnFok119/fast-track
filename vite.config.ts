import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { claudeRoute } from './vite-plugins/claude-route.ts';

export default defineConfig({
  plugins: [react(), tailwindcss(), claudeRoute()],
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
