import { defineConfig } from 'vite'
import { resolve } from 'path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), dts({ include: ['lib'] })],
  optimizeDeps: {
    include: ['xml2js', 'glob', 'fs-extra', 'graceful-fs'],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      fileName: 'main',
      formats: ['es'],
    },
    // rollupOptions: {
    //   external: ['react', 'react/jsx-runtime'],
    // },
  },
})
