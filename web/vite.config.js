/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import react from '@vitejs/plugin-react';
import { defineConfig, transformWithEsbuild } from 'vite';
import pkg from '@douyinfe/vite-plugin-semi';
import path from 'path';
import { codeInspectorPlugin } from 'code-inspector-plugin';
const { vitePluginSemi } = pkg;

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      // Deep path imports MUST come before the bare module alias
      { find: '@douyinfe/semi-ui/dist', replacement: path.resolve(__dirname, './node_modules/@douyinfe/semi-ui/dist') },
      { find: '@douyinfe/semi-ui/lib', replacement: path.resolve(__dirname, './node_modules/@douyinfe/semi-ui/lib') },
      // Phase 2: bare '@douyinfe/semi-ui' → compat layer
      { find: /^@douyinfe\/semi-ui$/, replacement: path.resolve(__dirname, './src/components/compat/index.js') },
      // Escape hatch for compat barrel to import real Semi
      { find: '@douyinfe/semi-ui__real', replacement: path.resolve(__dirname, './node_modules/@douyinfe/semi-ui') },
    ],
  },
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
    }),
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!/src\/.*\.js$/.test(id)) {
          return null;
        }

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
    vitePluginSemi({
      cssLayer: true,
    }),
  ],
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.json': 'json',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor: React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) {
            return 'react-core';
          }
          // Vendor: Semi Design (compat layer keeps importing the real package)
          if (id.includes('node_modules/@douyinfe/')) {
            return 'semi-ui';
          }
          // Vendor: Radix UI (shadcn primitives)
          if (id.includes('node_modules/@radix-ui/')) {
            return 'shadcn-ui';
          }
          // Vendor: Charts (VChart) — only loaded on Dashboard
          if (id.includes('node_modules/@visactor/')) {
            return 'charts';
          }
          // Vendor: LobeHub icons — 52MB source, split into own chunk for lazy pages
          if (id.includes('node_modules/@lobehub/icons')) {
            return 'lobe-icons';
          }
          // Vendor: Markdown rendering (mermaid, katex, rehype, remark)
          if (id.includes('node_modules/mermaid') || id.includes('node_modules/katex') || id.includes('node_modules/rehype-') || id.includes('node_modules/remark-') || id.includes('node_modules/react-markdown') || id.includes('node_modules/cytoscape')) {
            return 'markdown-vendor';
          }
          // Vendor: i18n
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n';
          }
          // Vendor: Utilities
          if (id.includes('node_modules/axios') || id.includes('node_modules/history') || id.includes('node_modules/marked') || id.includes('node_modules/dayjs')) {
            return 'tools';
          }
          // Vendor: Other React components
          if (id.includes('node_modules/react-dropzone') || id.includes('node_modules/react-fireworks') || id.includes('node_modules/react-telegram-login') || id.includes('node_modules/react-toastify') || id.includes('node_modules/react-turnstile') || id.includes('node_modules/qrcode.react') || id.includes('node_modules/sonner')) {
            return 'react-components';
          }
          // Vendor: Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }
          // Vendor: Form libraries
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform/') || id.includes('node_modules/zod')) {
            return 'form-libs';
          }
          // App: Compat layer (Semi bridge)
          if (id.includes('src/components/compat/')) {
            return 'compat-layer';
          }
          // App: Channel management (heaviest page — 13K+ lines)
          if (id.includes('src/components/table/channels/') || id.includes('src/hooks/channels/')) {
            return 'page-channels';
          }
          // App: Settings pages (13K+ lines)
          if (id.includes('src/pages/Setting/') || id.includes('src/components/settings/')) {
            return 'page-settings';
          }
          // App: Playground
          if (id.includes('src/components/playground/') || id.includes('src/hooks/playground/')) {
            return 'page-playground';
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/mj': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/pg': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
