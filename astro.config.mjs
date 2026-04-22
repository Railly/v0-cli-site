// @ts-check
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://v0-cli.crafter.run',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
})
