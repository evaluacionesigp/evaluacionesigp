import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/evaluacionesigp/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        familiar: resolve(__dirname, 'familiar.html'),
      },
    },
  },
});
