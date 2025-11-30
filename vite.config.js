import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-files',
      closeBundle() {
        // Copy Google verification file (NEW FILE)
        try {
          copyFileSync('public/google07575644814a48bc.html', 'dist/google07575644814a48bc.html');
          console.log('✅ Copied google verification file');
        } catch (e) {
          console.log('⚠️ Google verification file not found (ok if not needed)');
        }
        // Copy robots.txt and sitemap.xml
        copyFileSync('public/robots.txt', 'dist/robots.txt');
        copyFileSync('public/sitemap.xml', 'dist/sitemap.xml');
        console.log('✅ Copied robots.txt and sitemap.xml');
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      assets: path.resolve('src/assets/'),
      components: path.resolve('src/components/'),
      context: path.resolve('src/context/'),
      db: path.resolve('src/db/'),
      helpers: path.resolve('src/helpers/'),
      hooks: path.resolve('src/hooks/'),
      data: path.resolve('src/data/'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/variables.scss";`,
      },
    },
  },
});
