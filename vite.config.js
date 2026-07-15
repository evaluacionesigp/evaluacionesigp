import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/evaluacionesigp/',
  // Por defecto Vite escucha solo en ::1 (IPv6 loopback); en algunas
  // configuraciones de Windows "localhost" resuelve a 127.0.0.1 primero y la
  // conexión no llega. host:true hace que escuche en IPv4 y IPv6 a la vez.
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        familiar: resolve(__dirname, 'familiar.html'),
      },
    },
  },
});
