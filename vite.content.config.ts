import { defineConfig } from 'vite';
import path from 'path';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't clear the dist folder
    lib: {
      entry: resolve(__dirname, 'src/content/contentScript.ts'),
      name: 'contentScript',
      formats: ['iife'],
      fileName: () => 'content/content.js',
    },
    rollupOptions: {
      output: {
        // Ensure everything is bundled into one file
        inlineDynamicImports: true,
      },
    },
  },
});
