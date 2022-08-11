import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.SLIDE_BASE || '/'
})
