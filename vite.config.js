import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  base: './',
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'sw.js') {
            return 'sw.js';
          }
          if (assetInfo.name === 'app.webmanifest') {
            return 'app.webmanifest';
          }
          if (assetInfo.name.endsWith('.png') && assetInfo.name.includes('icon-')) {
            return 'icons/[name][extname]';
          }
          if (assetInfo.name === 'index.css') {
            return 'assets/index.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'copy-assets',
      writeBundle() {
        // Copy service worker
        fs.copyFileSync(
          resolve(__dirname, 'src/public/sw.js'),
          resolve(__dirname, 'dist/sw.js')
        );

        // Ensure icons directory exists
        const iconsDir = resolve(__dirname, 'dist/icons');
        if (!fs.existsSync(iconsDir)) {
          fs.mkdirSync(iconsDir, { recursive: true });
        }

        // Copy icons
        const iconSizes = ['72', '96', '128', '144', '152', '192', '384', '512'];
        iconSizes.forEach(size => {
          const iconPath = resolve(__dirname, `src/public/icons/icon-${size}x${size}.png`);
          if (fs.existsSync(iconPath)) {
            fs.copyFileSync(
              iconPath,
              resolve(__dirname, `dist/icons/icon-${size}x${size}.png`)
            );
          }
        });
      },
    },
  ],
});
