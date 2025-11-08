/**
 * Core SSG Builder
 *
 * This script is the heart of our Static Site Generation system.
 * It reads route configurations, renders React components to HTML strings,
 * and writes static HTML files to the dist/ directory.
 *
 * Flow:
 * 1. Read routes from routes.config.ts
 * 2. For each route:
 *    - Import the page component
 *    - Render it to HTML string using React's renderToString
 *    - Wrap in HTML template
 *    - Write to dist/{path}.html
 */

import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Route {
  path: string;
  component: string;
}

/**
 * Create HTML template wrapper
 * This wraps the React-rendered content in a complete HTML document
 */
function createHTMLTemplate(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="React 19 SSG Project - Static Site Generation Demo">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #ffffff;
    }
  </style>
</head>
<body>
  <div id="root">${content}</div>
  <!-- Phase 0: No client-side JavaScript yet -->
  <!-- Phase 1 will add: <script src="/assets/client.js"></script> -->
</body>
</html>`;
}

/**
 * Build a single page
 */
async function buildPage(route: Route): Promise<void> {
  console.log(`📄 Building: ${route.path}.html`);

  try {
    // Import the page component dynamically
    const pagePath = path.resolve(__dirname, `../pages/${route.component}.tsx`);
    const pageModule = await import(pagePath);
    const PageComponent = pageModule.default;

    if (!PageComponent) {
      throw new Error(`No default export found in ${route.component}.tsx`);
    }

    // Render React component to HTML string
    const content = renderToString(createElement(PageComponent));

    // Wrap in complete HTML document
    const html = createHTMLTemplate(content, `${route.component} - React 19 SSG`);

    // Ensure dist directory exists
    const distDir = path.resolve(__dirname, '../../dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Write HTML file
    const outputPath = path.join(distDir, `${route.path}.html`);
    fs.writeFileSync(outputPath, html, 'utf-8');

    console.log(`✅ Built: ${route.path}.html`);
  } catch (error) {
    console.error(`❌ Failed to build ${route.path}:`, error);
    throw error;
  }
}

/**
 * Main build function
 */
async function build(): Promise<void> {
  console.log('🚀 Starting SSG build...\n');

  const startTime = Date.now();

  try {
    // Import routes configuration
    const routesPath = path.resolve(__dirname, '../routes.config.ts');
    const routesModule = await import(routesPath);
    const routes: Route[] = routesModule.default;

    console.log(`📋 Found ${routes.length} route(s) to build\n`);

    // Build all pages
    for (const route of routes) {
      await buildPage(route);
    }

    const duration = Date.now() - startTime;
    console.log(`\n✨ Build completed in ${duration}ms`);
    console.log(`📁 Output directory: dist/`);
    console.log(`\n🎉 Success! Open dist/index.html in your browser to see the result.`);
  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
build();
