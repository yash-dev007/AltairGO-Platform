import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const bypassForHtml = (req) => {
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') return;
  if (req.headers.accept?.includes('text/html')) return req.url;
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000',
      '/auth': 'http://127.0.0.1:5000',
      '/generate-itinerary': 'http://127.0.0.1:5000',
      '/get-itinerary-status': 'http://127.0.0.1:5000',
      '/get-trip': 'http://127.0.0.1:5000',
      '/countries': 'http://127.0.0.1:5000',
      '/health': 'http://127.0.0.1:5000',
      '/destinations': { target: 'http://127.0.0.1:5000', bypass: bypassForHtml },
      '/blogs': { target: 'http://127.0.0.1:5000', bypass: bypassForHtml },
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('react-hot-toast')) return 'ui-vendor';
            if (id.includes('recharts') || id.includes('d3')) return 'chart-vendor';
            if (id.includes('@dnd-kit')) return 'dnd-vendor';
          }
        }
      }
    }
  }
})
