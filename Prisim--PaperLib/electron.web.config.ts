/**
 * Web 调试专用 Vite 配置
 * 别名从 tsconfig.json 读取
 */
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: resolve(__dirname, 'apps/client'),
  plugins: [
    vue(),
    tailwindcss(),
    tsconfigPaths({
      root: __dirname,
      loose: true
    })
  ],
  server: {
    port: 5173,
    open: true
  }
})
