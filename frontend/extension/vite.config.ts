import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'fs';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const outDir = resolve(__dirname, 'dist');

  return {
    root: resolve(__dirname, 'src'),
    base: './',
    publicDir: false,
    build: {
      outDir,
      emptyOutDir: true,
      minify: !isDev,
      sourcemap: isDev,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'src/popup/index.html'),
          content: resolve(__dirname, 'src/content/index.ts'),
          background: resolve(__dirname, 'src/background.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    plugins: [
      {
        name: 'copy-and-fix',
        closeBundle() {
          if (!existsSync(resolve(outDir, 'popup'))) {
            mkdirSync(resolve(outDir, 'popup'), { recursive: true });
          }

          const topFiles = readdirSync(outDir);
          const popupHtml = topFiles.find((f) => f.startsWith('popup') && f.endsWith('.html'));
          if (popupHtml) {
            const htmlPath = resolve(outDir, popupHtml);
            const htmlContent = readFileSync(htmlPath, 'utf-8');
            const fixed = htmlContent
              .replace(/src="\.\/assets\//g, 'src="./assets/')
              .replace(/href="\.\/assets\//g, 'href="./assets/');
            writeFileSync(resolve(outDir, 'popup/index.html'), fixed);
            rmSync(htmlPath);
          }

          copyFileSync(resolve(__dirname, 'manifest.json'), resolve(outDir, 'manifest.json'));
        },
      },
    ],
  };
});
