/**
 * Webpack Configuration for RSC Client Bundle
 *
 * Phase 2 更新：构建 RSC 客户端 bundle
 * - 只包含 Client Components（Counter.client.tsx 等）
 * - 不包含 Server Components（减少 bundle 大小）
 * - 客户端会加载 rsc.json 重建组件树
 *
 * Key settings:
 * - target: 'web' - Build for browser environment
 * - entry: RSC client entry (client-rsc.tsx)
 * - output: dist/assets/client-rsc.js
 * - ts-loader: Compile TypeScript to JavaScript
 */

const path = require('path');

module.exports = {
  // Build for browser
  target: 'web',

  // Production mode for optimized output
  mode: 'development', // Use 'production' for smaller bundles

  // Entry point: RSC client (Phase 2)
  entry: './src/entries/client-rsc.tsx',

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist/assets'),
    filename: 'client-rsc.js', // Phase 2: renamed from client.js
    clean: true, // Clean the output directory before build
  },

  // Module resolution
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Loaders
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  // Development settings
  devtool: 'source-map', // Enable source maps for debugging

  // Performance hints
  performance: {
    hints: false, // Disable bundle size warnings for now
  },

  // Stats configuration
  stats: {
    colors: true,
    modules: false,
    children: false,
  },
};
