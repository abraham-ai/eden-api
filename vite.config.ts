import { defineConfig } from 'vite'
import { resolve } from 'path';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup/mongo-memory-server.ts'],
  },
  resolve: {
    alias: {
        '@': resolve(__dirname, './src'),
    },
},
})