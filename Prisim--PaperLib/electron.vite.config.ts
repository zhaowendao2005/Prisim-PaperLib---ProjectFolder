import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const rootDir = __dirname

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), tsconfigPaths()],
    build: {
      outDir: resolve(rootDir, 'electron.dist/main'),
      rollupOptions: {
        input: resolve(rootDir, 'apps/electron/main/index.ts')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin(), tsconfigPaths()],
    build: {
      outDir: resolve(rootDir, 'electron.dist/preload'),
      rollupOptions: {
        input: resolve(rootDir, 'apps/electron/preload/index.ts')
      }
    }
  },
  renderer: {
    root: resolve(rootDir, 'apps/client'),
    build: {
      outDir: resolve(rootDir, 'electron.dist/renderer'),
      rollupOptions: {
        input: resolve(rootDir, 'apps/client/index.html')
      }
    },
    plugins: [
      vue(),
      tailwindcss(),
      tsconfigPaths({
        root: rootDir,
        loose: true
      })
    ]
  }
})
