import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'fs';
import pkg from './package.json';

import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
  base: './',
  mode: 'production',
  publicDir: process.env.DEV_CONFIG ? './dev' : null,
  build: {
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: ['public/*'],
          dest: 'assets/'
        }
      ]
    }),
    createHtmlPlugin({
      minify: true,
      template: 'index.html',
      inject: {
        data: {
          loader: fs.readFileSync('./includes/loader.html', 'utf-8'),
          provider: fs.readFileSync('./includes/provider.html', 'utf-8'),
        }
      },
    }),
    {
      name: 'homeDash-manifest',
      writeBundle: (_, bundle) => {
        const viteManFile = bundle['.vite/manifest.json'];
        const viteMan = JSON.parse(viteManFile.source);
        const files = fs.readdirSync('public');

        const manifest = {
          version: pkg.version,
          index: "index.html",
          assets: 
          [
            ...Object.values(viteMan).flatMap(({css, js, file}) => ([
              ...css || [],
              ...js || [],
              file
            ])),
            ...files.map(item => 'assets/' + item)
          ]
        };

        return fs.promises.writeFile('./dist/manifest.json', JSON.stringify(manifest, null, 2));
      }
    },
    splitVendorChunkPlugin()
  ]
})