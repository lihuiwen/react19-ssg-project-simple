/**
 * Core SSG Builder - Phase 2 (RSC)
 *
 * 构建流程已升级为 RSC 模式：
 * 1. 读取路由配置
 * 2. 对每个路由：
 *    - 导入页面组件
 *    - 使用 RSC 序列化器生成 RSC payload
 *    - 使用 renderToString 生成初始 HTML（用于 SEO）
 *    - 保存 rsc.json 和 HTML
 *
 * Phase 1 vs Phase 2:
 * - Phase 1: renderToString → HTML + 客户端 hydrate 整个树
 * - Phase 2: RSC 序列化 → rsc.json + 客户端只 hydrate Client Components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRSCPayload } from './rsc-serializer.js';
import { rscPayloadToHTML } from './rsc-to-html.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Route {
  path: string;
  component: string;
}

/**
 * Create HTML template wrapper
 *
 * Phase 2 Update: 引用 client-rsc.js（RSC 客户端）
 * - 客户端会加载 rsc.json 重建组件树
 * - 只 hydrate Client Components，减少 bundle 大小
 */
function createHTMLTemplate(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="React 19 SSG Project - RSC Demo">
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

  <!-- Phase 2: RSC 客户端 JavaScript -->
  <!-- 加载 rsc.json，重建组件树，只 hydrate Client Components -->
  <script src="/assets/client-rsc.js"></script>
</body>
</html>`;
}

/**
 * Build a single page - Phase 2 (RSC)
 *
 * 生成两个文件：
 * 1. {path}.html - 包含初始 HTML（用于 SEO 和快速首屏）
 * 2. rsc.json - RSC payload（客户端用于重建组件树）
 */
async function buildPage(route: Route): Promise<void> {
  console.log(`📄 Building: ${route.path}.html (RSC mode)`);

  try {
    // Import the page component dynamically
    const pagePath = path.resolve(__dirname, `../pages/${route.component}.tsx`);
    const pageModule = await import(pagePath);
    const PageComponent = pageModule.default;

    if (!PageComponent) {
      throw new Error(`No default export found in ${route.component}.tsx`);
    }

    // Phase 2.5: 生成 RSC Payload（支持异步 Server Components）
    console.log(`  🔄 Serializing to RSC payload (async support)...`);
    const rscPayload = await createRSCPayload(PageComponent);

    // Phase 2.5: 从 RSC payload 生成初始 HTML
    // 这样即使页面包含 async 组件也能生成 SEO 友好的 HTML
    console.log(`  🎨 Generating HTML from RSC payload...`);
    const content = rscPayloadToHTML(rscPayload);

    // Wrap in complete HTML document
    const html = createHTMLTemplate(content, `${route.component} - React 19 RSC`);

    // Ensure dist directory exists
    const distDir = path.resolve(__dirname, '../../dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Write HTML file
    const htmlPath = path.join(distDir, `${route.path}.html`);
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`  ✅ HTML: ${route.path}.html (${Buffer.byteLength(html)} bytes)`);

    // Write RSC Payload
    const rscJson = JSON.stringify(rscPayload, null, 2);
    const rscPath = path.join(distDir, 'rsc.json');
    fs.writeFileSync(rscPath, rscJson, 'utf-8');
    console.log(`  ✅ RSC Payload: rsc.json (${Buffer.byteLength(rscJson)} bytes)`);
    console.log(`     - Tree nodes: ${rscPayload.tree.length}`);
    console.log(`     - Client Components: ${Object.keys(rscPayload.clientComponents).length}`);

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
