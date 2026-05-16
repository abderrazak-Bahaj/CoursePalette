import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    // Code splitting configuration for better caching and parallel loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
          ],
          'vendor-charts': ['recharts'],
          'vendor-markdown': [
            'react-markdown',
            'remark-gfm',
            'rehype-sanitize',
          ],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-editor': [
            '@tiptap/react',
            '@tiptap/core',
            '@tiptap/starter-kit',
          ],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification using esbuild (built-in, no extra dependency needed)
    // esbuild is faster than terser and produces comparable output sizes.
    minify: 'esbuild',
    // Drop console.* calls in production builds to reduce bundle size and
    // avoid leaking debug information.
    esbuildOptions: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
}));
