import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      proxy: env.VITE_DEV_PROXY_TARGET
        ? {
            '/api': { target: env.VITE_DEV_PROXY_TARGET, changeOrigin: true },
            '/media': { target: env.VITE_DEV_PROXY_TARGET, changeOrigin: true },
          }
        : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
  };
});
