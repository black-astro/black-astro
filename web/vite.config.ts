import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 프로필 저장소(black-astro/black-astro)의 프로젝트 페이지로 배포되므로
// base 경로는 /black-astro/ 하위. (black-astro.github.io/black-astro)
export default defineConfig({
  base: '/black-astro/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 800,
  },
})
