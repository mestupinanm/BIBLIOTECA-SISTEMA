import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['chrome >= 44'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ]
});
