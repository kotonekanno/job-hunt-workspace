import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      ...Object.fromEntries(
        [
          '/auth',
          '/tasks',
          '/companies',
          '/documents',
          '/events',
          '/essay-groups',
          '/dashboard'
        ].map((route) => [
          route,
          {
            target:
              loadEnv(mode, process.cwd(), '').API_PROXY_TARGET ||
              loadEnv(mode, process.cwd(), '').VITE_API_BASE_URL,
            changeOrigin: true,
            // Page navigation shares paths with API endpoints.
            bypass: (req: import('node:http').IncomingMessage) =>
              req.headers.accept?.includes('text/html')
                ? '/index.html'
                : undefined,
          },
        ]),
      ),
    },
  },
}));
