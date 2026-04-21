/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})*/



// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  json: {
    namedExports: true,
  },
  server: {
    hmr: {
      overlay: false, // Désactive l'overlay d'erreur pour éviter les erreurs visuelles sur le navigateur
    },
  },
});
