/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  // Caminhos relativos: funciona em https://<usuario>.github.io/rotina-magica/ e em qualquer subpasta.
  base: './',
  plugins: [react()],
  build: { manifest: 'assets-manifest.json' },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
