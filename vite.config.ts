import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
// import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),

      /*
      obfuscatorPlugin({
        apply: 'build',
        options: {
          compact: true,

          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,

          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,

          identifierNamesGenerator: 'hexadecimal',
          renameGlobals: false,

          selfDefending: true,

          stringArray: true,
          stringArrayCallsTransform: true,
          stringArrayEncoding: ['base64'],
          stringArrayRotate: true,
          stringArrayShuffle: true,

          stringArrayWrappersCount: 2,
          stringArrayWrappersType: 'function',

          splitStrings: true,
          splitStringsChunkLength: 8,

          transformObjectKeys: true,
          unicodeEscapeSequence: false,
        },
      }),
      */
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      allowedHosts: ['.trycloudflare.com'],
    },

    build: {
      sourcemap: false,
      minify: true,
    },
  };
});