import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // zlibjs は strict mode で動かないため pako ベースのシムで置き換える
      'zlibjs/bin/gunzip.min.js': path.resolve('./src/utils/zlibjsShim.js'),
    },
  },
})
