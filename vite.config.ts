import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-pdf': ['pdf-lib', 'pdfjs-dist'],
          'vendor-utils': ['qrcode', 'jszip', 'canvas-confetti'],
          'vendor-word': ['mammoth', 'docx'],
          'vendor-excel': ['xlsx'],
          'vendor-pptx': ['pptxgenjs'],
          'vendor-canvas': ['html2canvas'],
        },
      },
    },
    chunkSizeWarningLimit: 2500,
  },
});
