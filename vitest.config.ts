import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@tauri-apps/plugin-store': path.resolve(__dirname, 'src/test/mocks/tauri-store.ts'),
      '@tauri-apps/plugin-opener': path.resolve(__dirname, 'src/test/mocks/tauri-opener.ts'),
      '@tauri-apps/plugin-dialog': path.resolve(__dirname, 'src/test/mocks/tauri-dialog.ts'),
      '@tauri-apps/api/core': path.resolve(__dirname, 'src/test/mocks/tauri-core.ts'),
      '@tauri-apps/api/event': path.resolve(__dirname, 'src/test/mocks/tauri-event.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'src-tauri'],
  },
})
