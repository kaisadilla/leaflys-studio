import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    alias: {
      "@test": path.resolve(__dirname, "test/"),
    },
  },
  plugins: [
    react(),
    svgr(),
    tsconfigPaths(),
  ],
});
