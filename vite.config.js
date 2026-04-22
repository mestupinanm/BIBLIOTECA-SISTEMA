import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['chrome >= 30', 'android >= 4.4', 'safari >= 8', 'ios >= 8'],
      additionalLegacyPolyfills: ['whatwg-fetch', 'core-js/proposals/global-this']
    })
  ]
});
