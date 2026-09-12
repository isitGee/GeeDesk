import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // relative asset paths so the build works from any static host / subpath (e.g. GitHub Pages)
  plugins: [react(), tailwindcss()],
})
