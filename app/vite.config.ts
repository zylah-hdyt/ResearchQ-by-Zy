import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: { manualChunks: { exceljs: ['exceljs'] } },
    },
  },
  // Module workers so the export worker can lazy-load ExcelJS.
  worker: { format: 'es' },
  test: { environment: 'node' },
} as never);
