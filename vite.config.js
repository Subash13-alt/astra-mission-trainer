import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * In development, requests to /api/nasa/* and /api/osdr/* are forwarded to NASA
 * by the Vite dev server. The NASA key is read from NASA_API_KEY (no VITE_ prefix),
 * so it stays on the server side and is never bundled into browser code.
 * In production the same paths are served by the functions in /api (Vercel).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.NASA_API_KEY || 'DEMO_KEY';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api/nasa': {
          target: 'https://api.nasa.gov',
          changeOrigin: true,
          rewrite: (path) => {
            const p = path.replace(/^\/api\/nasa/, '');
            return p + (p.includes('?') ? '&' : '?') + 'api_key=' + encodeURIComponent(apiKey);
          },
        },
        '/api/osdr': {
          target: 'https://osdr.nasa.gov',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/osdr/, '/osdr/data'),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 900,
    },
  };
});
