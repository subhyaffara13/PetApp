import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetBackend = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      proxy: {
        '/auth': { target: targetBackend, changeOrigin: true },
        '/pet-profile': { target: targetBackend, changeOrigin: true },
        '/chat': { target: targetBackend, changeOrigin: true },
        '/community': { target: targetBackend, changeOrigin: true },
        '/marketplace': { target: targetBackend, changeOrigin: true },
        '/clinics': { target: targetBackend, changeOrigin: true },
        '/appointments': { target: targetBackend, changeOrigin: true },
        '/reminders': { target: targetBackend, changeOrigin: true },
        '/receipts': { target: targetBackend, changeOrigin: true },
        '/payments': { target: targetBackend, changeOrigin: true },
      },
    },
  };
});
