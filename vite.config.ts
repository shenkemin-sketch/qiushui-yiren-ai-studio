import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss()],
    define: {
      // Keys removed for security: handled by Vercel Function
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    // Production optimizations
    optimizeDeps: {
      include: ['react', 'react-dom', '@google/genai'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ai: ['@google/genai'],
          }
        }
      },
      sourcemap: false,
      minify: true,
    }
  };
});
