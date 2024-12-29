import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {  // 소문자로 수정
    port: 8010, // 원하는 포트 번호로 설정
    strictPort: true, // 포트 충돌 시 다른 포트로 변경되지 않음
    proxy: {
      '/api': {
        target: 'http://localhost:80', // Spring Boot 서버 주소
        changeOrigin: true,
        // pathRewrite: { '^/api': '' }, // '/api'를 지우고 Spring Boot로 요청
      },
    },
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
