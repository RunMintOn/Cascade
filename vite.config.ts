import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import manifest from './manifest.config'

export default defineConfig({
  base: './', // 使用相对路径，适用于 Chrome 扩展
  plugins: [
    tailwindcss(),
    react(),
    crx({ manifest }),
  ],
})
