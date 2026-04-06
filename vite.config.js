import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/HKUdate/',
  plugins: [vue()],
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['4173-i0jm01p1rt13qfxxxuuk6-081ecca6.sg1.manus.computer'],
  },
})
