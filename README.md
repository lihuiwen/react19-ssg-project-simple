# React 19 SSG Project

> 从零手写 React 19 渲染架构演进：SSG → RSC → ISR → SSR

## 🎯 项目目标

通过手写实现深入学习现代前端渲染架构的演进过程，从最简单的静态站点生成（SSG）开始，逐步演进到 React Server Components（RSC）、增量静态再生（ISR）和服务端渲染（SSR）。

## 📊 当前状态

✅ **MVP-Phase 1 已完成**：Client 岛屿 + Hydration

### 已实现功能

- ✅ React 19 RC 服务端渲染（`renderToString`）
- ✅ TypeScript 支持
- ✅ 静态 HTML 生成
- ✅ 路由配置系统
- ✅ **客户端 Hydration（`hydrateRoot`）** ⬅️ 新增！
- ✅ **交互式组件（Counter）** ⬅️ 新增！
- ✅ **Webpack 打包客户端代码** ⬅️ 新增！
- ✅ **双入口构建系统（server + client）** ⬅️ 新增！

### 技术栈

- **React**: 19.0.0-rc.1
- **构建工具**: Webpack 5（Phase 1 将使用）
- **TypeScript**: 5.9.3
- **运行时**: tsx（用于执行构建脚本）
- **包管理**: pnpm

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 构建静态站点

```bash
pnpm build
```

这将生成 `dist/index.html`

### 预览结果（推荐）

```bash
pnpm preview
```

然后在浏览器打开 `http://localhost:3000`

**为什么需要本地服务器？**
- Phase 1 添加了客户端 JavaScript
- 浏览器安全策略要求通过 HTTP 协议加载脚本
- 直接打开 HTML 文件无法加载 `/assets/client.js`

### 其他命令

```bash
pnpm build:client  # 只构建客户端 JS bundle
pnpm build:html    # 只构建静态 HTML
pnpm clean         # 清理 dist 目录
pnpm rebuild       # 清理并重新构建
```

## 📁 项目结构

```
react19-ssg-project-simple/
├── src/
│   ├── pages/                    # 页面组件
│   │   └── index.tsx             # 首页（Server Component）
│   ├── components/               # 共享组件
│   │   └── Counter.client.tsx   # 交互式计数器（Client Component）
│   ├── entries/                  # 构建入口
│   │   └── client.tsx            # 客户端 hydration 入口
│   ├── lib/
│   │   └── builder.ts            # 核心 SSG 构建脚本
│   └── routes.config.ts          # 路由配置
├── dist/                         # 构建输出（git ignored）
│   ├── index.html                # 服务端渲染的 HTML
│   └── assets/
│       ├── client.js             # 客户端 JS bundle (1MB)
│       └── client.js.map         # Source map
├── docs/
│   └── Roadmap.md                # 完整的演进规划
├── webpack.config.cjs            # Webpack 配置（客户端打包）
├── tsconfig.json                 # TypeScript 配置
├── package.json
├── CLAUDE.md                     # AI 编程助手指南
└── README.md
```

## 🔍 核心原理

### Phase 1: SSG + Hydration 工作流程

#### 构建时（Build Time）

1. **Webpack 打包客户端代码**：
   ```bash
   webpack → dist/assets/client.js  # 浏览器端代码
   ```

2. **SSG 生成 HTML**：
   ```typescript
   // src/lib/builder.ts
   const content = renderToString(<PageComponent />);  // Server 渲染
   const html = createHTMLTemplate(content);           // 注入 <script>
   fs.writeFileSync('dist/index.html', html);
   ```

#### 运行时（Browser Runtime）

1. **浏览器加载 HTML**：
   - 用户看到完整的静态内容（服务端渲染）
   - HTML 中包含 `<script src="/assets/client.js"></script>`

2. **客户端 Hydration**：
   ```typescript
   // src/entries/client.tsx
   import { hydrateRoot } from 'react-dom/client';

   hydrateRoot(document.getElementById('root'), <HomePage />);
   // React "激活"现有 DOM，附加事件监听器
   ```

3. **页面变为可交互**：
   - Counter 按钮可以点击
   - State 变化触发重新渲染

### 关键概念

**Server Component vs Client Component**：
- **Server Component** (index.tsx): 只在构建时运行，不发送到浏览器
- **Client Component** (Counter.client.tsx): 标记 `"use client"`，在浏览器中 hydrate

**Hydration vs Rendering**：
- **Rendering**: `createRoot()` - 从空 div 创建整个 DOM
- **Hydration**: `hydrateRoot()` - 复用服务端 HTML，只附加交互逻辑

## 📖 学习路径

### ✅ Phase 0: 最小 SSG（已完成）

- 理解 `renderToString()` 的工作原理
- 构建时渲染 vs 运行时渲染
- 静态 HTML 生成

### ✅ Phase 1: Client 岛屿 + Hydration（已完成）

**目标**: 理解服务端/客户端渲染边界

**已完成**:
- ✅ 创建交互组件（`"use client"` 标记）
- ✅ 配置 Webpack 双入口（server + client）
- ✅ 实现 `hydrateRoot()` 客户端激活
- ✅ HTML 中注入 `<script>` 标签
- ✅ 构建双产物系统（HTML + JS bundle）

**关键学习点**:
- Server Component 和 Client Component 的区别
- Hydration 的工作原理
- 如何最小化客户端 JavaScript

### 🔮 Phase 2: 简化版 RSC（未来）

**目标**: 手写 React Server Components 实现

**核心概念**:
- Server Components 在构建时执行
- Client Components 在浏览器执行
- 序列化 RSC Payload

**预计时间**: 3-5 天（高难度）

### 🔮 Phase 3-4: ISR & SSR（未来）

暂时跳过，建议先完成 Phase 0-2 后再考虑

## 📚 学习资源

### 项目文档

- **`docs/Roadmap.md`**: 详细的演进规划和 TODO 清单
- **`CLAUDE.md`**: AI 编程助手使用指南

### 关键概念

1. **SSG（Static Site Generation）**: 构建时生成静态 HTML
2. **Hydration**: 让静态 HTML 变成可交互的 React 应用
3. **Server Components**: 只在服务端运行的 React 组件
4. **Client Components**: 在浏览器运行的 React 组件

## 🎓 学到了什么？

完成 Phase 0-1 后，你应该理解：

### Phase 0 学习成果
- ✅ React 的 `renderToString()` API
- ✅ 静态站点生成的基本原理
- ✅ 构建时渲染 vs 客户端渲染的区别
- ✅ 如何用 TypeScript 编写构建脚本

### Phase 1 学习成果
- ✅ React 19 的 `hydrateRoot()` API
- ✅ Server Component 和 Client Component 的区别
- ✅ Hydration（激活）的工作原理
- ✅ Webpack 配置和模块打包
- ✅ 双入口构建系统（构建时 + 运行时）
- ✅ 如何最小化发送到浏览器的 JavaScript
- ✅ `"use client"` 指令的作用

### 关键理解
- **为什么需要 Hydration？** 让服务端渲染的静态 HTML 变得可交互
- **为什么区分 Server/Client Component？** 减少客户端 JS 体积，提升性能
- **什么时候用 `"use client"`？** 只在需要 hooks (useState, useEffect) 或事件处理器时

## 🔄 下一步

1. **验证 Hydration 工作** ⭐ 立即尝试：
   ```bash
   pnpm build          # 构建
   pnpm preview        # 启动本地服务器
   # 打开 http://localhost:3000
   # 点击 Counter 按钮，应该能看到数字变化！
   # 打开浏览器控制台，查看 hydration 日志
   ```

2. **性能分析**:
   ```bash
   # 查看 bundle 大小
   ls -lh dist/assets/client.js        # ~1MB (开发模式)

   # 对比 HTML 文件
   cat dist/index.html | grep Counter  # 能看到服务端渲染的 Counter
   ```

3. **实验练习**:
   - 创建更多客户端组件（表单、模态框、Tabs等）
   - 尝试在 Server Component 中使用 `useState`（会报错，理解为什么）
   - 思考：如何优化 1MB 的 bundle size？（提示：生产模式构建）

4. **开始 Phase 2**: 参考 `docs/Roadmap.md` 中的 MVP-Phase 2 指南（手写简化 RSC）

## 💡 Phase 1 关键提示

- **必须使用本地服务器**: 客户端 JS 需要通过 HTTP 协议加载
- **查看 Network 面板**: 能看到 `client.js` 的加载（1MB）
- **查看 Console**: 应该看到 "🎯 Starting client-side hydration..." 日志
- **测试交互**: Counter 按钮点击后数字变化，证明 hydration 成功
- **理解权衡**: 为了交互性，我们增加了 1MB 的 JavaScript（后续可优化）

## 🤝 贡献

这是一个学习项目，欢迎：
- 提出问题和改进建议
- 分享学习心得
- 贡献文档和示例

## 📄 License

ISC
