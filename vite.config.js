import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src'),

  base: '/submission-intermediate-web/',

  publicDir: resolve(__dirname, 'src', 'public'),

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
