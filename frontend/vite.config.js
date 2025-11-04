import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Garante que o servidor Vite observe mudanças nos arquivos
    // (útil quando rodando em contêineres)
    watch: {
      usePolling: true,
    },
  },
})
