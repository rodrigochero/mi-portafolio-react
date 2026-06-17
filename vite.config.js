import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 Ajustado a '/' para que Vercel encuentre tus rutas e imágenes al instante
})