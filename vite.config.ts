import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const ON_LIVE = env.VITE_ON_LIVE === 'true';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_BASE_URL': JSON.stringify(ON_LIVE ? "https://api.vidyasetudemo.in" : env.VITE_BASE_URL || "http://localhost:3032"),
      'import.meta.env.VITE_BASE_URL_IMAGE': JSON.stringify(ON_LIVE ? "https://api.vidyasetudemo.in/images" : env.VITE_BASE_URL_IMAGE || "http://localhost:3032/images"),
      'import.meta.env.VITE_SUB_DOMAIN': JSON.stringify(ON_LIVE ? "https://api.vidyasetudemo.in" : env.VITE_SUB_DOMAIN || "http://api.lvh.me:3032"),
      'import.meta.env.VITE_END_WITH_DOMAIN': JSON.stringify(ON_LIVE ? ".vidyasetudemo.in" : env.VITE_END_WITH_DOMAIN || ".lvh.me"),
      'import.meta.env.VITE_MAIN_URL': JSON.stringify(ON_LIVE ? "https://vidyasetudemo.in" : env.VITE_MAIN_URL || "http://localhost:5173"),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts: [
        '.lvh.me',
        'https://0cf9-171-61-167-248.ngrok-free.app/'
      ],
      proxy: {
        '/api': {
          target: ON_LIVE ? "https://api.vidyasetudemo.in" : env.VITE_BASE_URL || "http://localhost:3032",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})