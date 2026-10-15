import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: Object.fromEntries(
      [
        '/auth',
        '/companies',
        '/tasks',
        '/events',
        '/documents',
        '/essay-groups',
      ].map((prefix) => [
        prefix,
        {
          target: 'http://localhost:8080',
          changeOrigin: true,
          bypass: (request: import('node:http').IncomingMessage) => {
            if (
              ['/companies', '/tasks', '/documents'].includes(prefix) &&
              request.headers.accept?.includes('text/html')
            )
              return '/index.html';
          },
        },
      ]),
    ),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
