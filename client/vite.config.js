import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

  ],
   optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'  // Correct polyfill for 'global'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        }),
        NodeModulesPolyfillPlugin()  // Required for `stream`, `crypto`, etc.
      ]
    }
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      events: 'events/'
    }
  },
  define: {
    global: "window" // Critical fix for `global is not defined`
  }
})
