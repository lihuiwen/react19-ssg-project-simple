# Changelog

All notable changes to this project will be documented in this file.

## [Phase 2] - 2025-11-08

### ✨ Added - Simplified React Server Components (RSC)

#### 核心成就
- **🎯 RSC 架构实现**: 成功实现简化版 React Server Components
- **📦 Server/Client 组件分离**: Server Components 代码不再发送到客户端
- **🔄 组件树序列化**: 将 React 组件树序列化为 JSON 格式（RSC Payload）
- **💧 选择性 Hydration**: 客户端只 hydrate Client Components，不再 hydrate 整个树

#### 新增文件
- `src/lib/rsc-types.ts` - RSC 类型定义系统（110 行）
  - `RSCNode` 类型（Element、Text、ClientPlaceholder）
  - `RSCPayload` 接口
  - 类型守卫函数
- `src/lib/rsc-serializer.ts` - RSC 序列化器（293 行）
  - 组件树遍历和序列化
  - Client Component 检测
  - Server Component 执行和序列化
  - Props 清理和 JSON 转换
- `src/lib/rsc-deserializer.ts` - RSC 反序列化器（145 行）
  - 从 RSC Payload 重建 React 元素树
  - Client Component 动态加载
  - 组件注册表管理
- `src/entries/client-rsc.tsx` - RSC 客户端入口（80 行）
  - 加载 rsc.json
  - 重建组件树
  - 选择性 hydration
- `docs/RSC-Architecture.md` - RSC 架构文档（中文）

#### 修改文件
- `src/lib/builder.ts` - 升级为 RSC 构建模式
  - 使用 `createRSCPayload()` 生成 RSC payload
  - 输出 `rsc.json` 文件（5.5KB）
  - 保留 `renderToString()` 用于 SEO
- `webpack.config.cjs` - 更新为 RSC 客户端入口
  - Entry: `client-rsc.tsx`
  - Output: `client-rsc.js`
- `src/components/Counter.client.tsx` - 添加 RSC 标记
  - 添加 `__componentPath` 属性

#### 构建输出
- `dist/index.html`: 2.6KB（服务端渲染的 HTML）
- `dist/rsc.json`: 5.5KB（RSC Payload，包含组件树结构）
- `dist/assets/client-rsc.js`: 1.0MB（开发模式，仅包含 Client Components）
- `dist/assets/client-rsc.js.map`: 1.2MB（source map）

#### RSC Payload 结构
```json
{
  "version": "1.0",
  "tree": [
    { "$$type": "element", "tag": "div", ... },
    { "$$type": "text", "content": "..." },
    { "$$type": "client-placeholder", "id": "Counter_0", ... }
  ],
  "clientComponents": {
    "Counter_0": "src/components/Counter.client.tsx"
  }
}
```

#### 性能指标
- Webpack 构建时间: ~4.0s
- SSG HTML 生成: ~58ms
- 总构建时间: ~4.1s

#### 技术验证 ✅
- ✅ Server Components 代码不在客户端 bundle 中
- ✅ Client Components 正确打包到 client-rsc.js
- ✅ rsc.json 正确序列化组件树
- ✅ 客户端成功加载 rsc.json
- ✅ 组件树重建成功
- ✅ Counter 组件 hydration 成功
- ✅ Counter 交互功能正常（+ / - 按钮）
- ✅ 浏览器控制台显示 RSC 启动日志
- ✅ 网络请求正确加载 rsc.json

#### RSC 工作流程
```
构建时：
  1. HomePage (Server Component) → 执行 → 序列化为 JSON
  2. Counter (Client Component) → 生成占位符 → 注册到 clientComponents
  3. 输出 rsc.json + HTML

浏览器：
  1. 加载 HTML（快速首屏，SEO 友好）
  2. 加载 client-rsc.js（仅包含 Counter）
  3. 加载 rsc.json（服务端组件序列化结果）
  4. 重建组件树
  5. 只 hydrate Counter 组件
```

#### 与完整版 RSC 的差异（简化点）
- ❌ 不支持 Streaming（流式传输）
- ❌ 不支持运行时 Suspense
- ❌ 不支持 Server Actions
- ❌ 不支持动态导入
- ✅ 实现静态构建时 RSC
- ✅ 使用简单 JSON 格式（而非 Wire Format）
- ✅ 清晰展示 RSC 核心原理（80% 的学习价值）

#### 下一步规划
- 📋 Phase 2.5: 增强版静态 RSC（可选）
  - 异步 Server Components（真正的 async/await）
  - 数据获取层
  - Markdown 渲染
- 📋 Phase 3+: 完整版 RSC（高难度）
  - Streaming RSC（⭐⭐⭐⭐⭐）
  - Suspense 支持（⭐⭐⭐⭐）
  - Server Actions（⭐⭐⭐⭐⭐）

---

## [Phase 1] - 2025-11-08

### ✨ Added - Client Islands + Hydration

#### New Features
- **Client-side Hydration**: Implemented `hydrateRoot()` to make server-rendered HTML interactive
- **Interactive Components**: Created `Counter.client.tsx` with `"use client"` directive
- **Webpack Bundling**: Added Webpack 5 configuration for client-side JavaScript
- **Dual-entry Build System**: Separate build steps for client bundle and HTML generation
- **Local Development Server**: Added `serve` for preview (`pnpm preview`)

#### New Files
- `src/components/Counter.client.tsx` - Interactive counter component
- `src/entries/client.tsx` - Client-side hydration entry point
- `webpack.config.cjs` - Webpack configuration for client bundling
- `CHANGELOG.md` - This file

#### Modified Files
- `src/pages/index.tsx` - Updated to include Counter component
- `src/lib/builder.ts` - Added client script injection in HTML template
- `package.json` - Added new build commands and `serve` dependency

#### Build Output
- `dist/index.html`: 2.6KB (server-rendered with Counter)
- `dist/assets/client.js`: 1.0MB (development mode, uncompressed)
- `dist/assets/client.js.map`: 1.2MB (source map)

#### Performance
- Webpack build time: ~3.6s
- SSG HTML generation: ~32ms
- Total build time: ~3.7s

#### Technical Achievements
- ✅ Server-side rendering working (SEO-friendly HTML)
- ✅ Client-side hydration working (interactive components)
- ✅ Clear separation of Server and Client components
- ✅ Browser console shows hydration logs
- ✅ Counter state updates in real-time

### 🔧 Changed
- Renamed `webpack.config.js` to `webpack.config.cjs` for ES module compatibility
- Updated build commands to support dual-entry system:
  - `pnpm build:client` - Webpack client bundle
  - `pnpm build:html` - SSG HTML generation
  - `pnpm build` - Full build (both)

### 📚 Documentation
- Updated README.md with Phase 1 instructions
- Updated docs/Roadmap.md marking Phase 1 as completed
- Updated CLAUDE.md with current project status

---

## [Phase 0] - 2025-11-08

### ✨ Initial Release - Minimum SSG System

#### Features
- **Server-Side Rendering**: React 19 RC `renderToString()` implementation
- **Static HTML Generation**: Build-time rendering to `dist/` directory
- **TypeScript Support**: Full TypeScript configuration
- **Route Configuration**: Simple route system via `routes.config.ts`

#### Files Created
- `src/pages/index.tsx` - Homepage component
- `src/lib/builder.ts` - Core SSG build script (~130 lines)
- `src/routes.config.ts` - Route definitions
- `tsconfig.json` - TypeScript configuration
- `README.md` - Project documentation
- `CLAUDE.md` - AI assistant guide
- `docs/Roadmap.md` - Complete implementation roadmap

#### Build Output
- `dist/index.html`: 1.6KB (static HTML)

#### Performance
- Build time: ~47ms
- Zero client-side JavaScript

#### Technical Achievements
- ✅ Pure SSG without client-side JS
- ✅ SEO-friendly static HTML
- ✅ Fast build times
- ✅ Simple and understandable codebase

---

## Next Up

### [Phase 2] - Simplified RSC (Planned)
- Implement simplified React Server Components
- Serialize server component tree to JSON
- Client-side reconstruction of component tree
- Reduce client JS bundle size

### [Phase 3-4] - ISR & SSR (Future)
- Incremental Static Regeneration
- Server-Side Rendering for dynamic routes
- Full production deployment setup
