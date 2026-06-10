import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'images/login-bg.png': resolve(__dirname, 'src/test-stubs/login-bg.ts'),
      'images/logo.png': resolve(__dirname, 'src/test-stubs/logo.ts'),
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,js}'],
    exclude: [
      '**/old_frontend/**',
      '**/node_modules/**',
    ],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/env.d.ts', 'src/main.ts'],
    },
  },
})
