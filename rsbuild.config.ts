import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [pluginReact()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  html: {
    template: './index.html',
  },
  tools: {
    postcss: (config) => {
      config.postcssOptions = {
        plugins: [
          require('@tailwindcss/postcss'),
          require('autoprefixer'),
        ],
      };
      return config;
    },
  },
});
