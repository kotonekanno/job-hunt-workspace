import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: '../openapi/dist/openapi.yaml',
    },
    output: {
      target: './src/api/generated/api.ts',
      schemas: './src/api/generated/models',
      client: 'fetch',
    },
  },
});
