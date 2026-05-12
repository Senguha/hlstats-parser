import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/

process.env.VITE_APP_URL = (process.env.VERCEL_ENV==="production") ? (`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) : (`https://${process.env.VERCEL_URL}`)

export default defineConfig({
   plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
