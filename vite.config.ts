import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // zlibjs は strict mode で動かないため pako ベースのシムで置き換える
      'zlibjs/bin/gunzip.min.js': path.resolve('./src/utils/zlibjsShim.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
