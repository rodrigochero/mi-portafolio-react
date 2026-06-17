import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mi-portafolio-react/', // 👈 Esto le dice a Vite que el proyecto se ejecutará en tu subcarpeta de GitHub
})