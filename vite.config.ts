import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` MUST match the GitHub Pages project path, e.g. for
// https://<user>.github.io/<repo>/ set base to '/<repo>/'.
// Rename this when you scaffold a new app from the starter.
export default defineConfig({
  base: '/vibe-stack/',
  plugins: [react()],
})
