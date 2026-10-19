import { defineConfig } from 'orval';
import { loadEnv } from 'vite';

// Local development uses Vite's proxy; production calls Render directly.
const production = process.env.NODE_ENV === 'production';
const env = loadEnv('production', process.cwd(), 'VITE_');
const baseUrl = production
  ? (process.env.VITE_API_BASE_URL ?? env.VITE_API_BASE_URL ?? '')
      .trim()
      .replace(/\/+$/, '')
  : '';

if (production) {
  const url = baseUrl ? new URL(baseUrl) : null;
  if (!url || url.protocol !== 'https:' || url.origin !== baseUrl) {
    throw new Error(
      'VITE_API_BASE_URL must be the HTTPS Render origin, e.g. https://your-api.onrender.com (no path).',
    );
  }
}

export default defineConfig({
  api: {
    input: {
      target: '../openapi/dist/openapi.yaml',
    },
    output: {
      target: './src/api/generated/api.ts',
      schemas: './src/api/generated/models',
      client: 'fetch',
      baseUrl,
    },
  },
});
