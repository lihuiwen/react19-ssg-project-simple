/**
 * Webpack Configuration for Client Bundle
 *
 * This configuration builds the client-side JavaScript bundle that will
 * run in the browser to hydrate the server-rendered HTML.
 *
 * Key settings:
 * - target: 'web' - Build for browser environment
 * - entry: Client entry point (hydration code)
 * - output: dist/assets/client.js
 * - ts-loader: Compile TypeScript to JavaScript
 */

const path = require('path');

module.exports = {
  // Build for browser
  target: 'web',

  // Production mode for optimized output
  mode: 'development', // Use 'production' for smaller bundles

  // Entry point: our client hydration code
  entry: './src/entries/client.tsx',

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist/assets'),
    filename: 'client.js',
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
