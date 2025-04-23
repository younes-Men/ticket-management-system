import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(), // Added react plugin to the plugins array
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: false, // permet d'éviter les erreurs de chemin avec %20
    },
    hmr: {
      overlay: false, // tu peux le mettre à false si tu veux désactiver l'overlay
    },
  },
})




