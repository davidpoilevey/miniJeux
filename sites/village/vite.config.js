import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// `npm run build` produit dist/ (aperçu). `npm run publish` écrit directement dans ../../www,
// sans toucher au reste du site : seuls index.html, favicon.svg, seuil/ et village/ sont remplacés.
export default defineConfig({
  base: './',
  esbuild: { jsx: 'automatic' },
  build: {
    assetsDir: 'village',
    rollupOptions: {
      input: {
        village: fileURLToPath(new URL('./index.html', import.meta.url)),
        seuil: fileURLToPath(new URL('./seuil/index.html', import.meta.url)),
      },
    },
  },
});
