import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Si VITE_API_BASE_URL tiene valor, el cliente NO usa este proxy (llama directo al backend).
  // Si está vacío: /api → DEV_PROXY_TARGET (por defecto Spring Boot local).
  const proxyTarget =
    (env.DEV_PROXY_TARGET && env.DEV_PROXY_TARGET.trim()) || 'http://127.0.0.1:8080';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
