# React 19 SSG Project

> 从零手写 React 19 渲染架构演进：SSG → RSC → ISR → SSR

## 🎯 项目目标

通过手写实现深入学习现代前端渲染架构的演进过程，从最简单的静态站点生成（SSG）开始，逐步演进到 React Server Components（RSC）、增量静态再生（ISR）和服务端渲染（SSR）。

## 📊 当前状态

🎉 **MVP-Phase 2.5 已完成**：增强版 RSC（Async + Fragment + 嵌套）

### 已实现功能

- ✅ React 19 RC 服务端渲染（从 RSC payload 生成 HTML）
- ✅ TypeScript 支持
- ✅ 静态 HTML 生成
- ✅ 路由配置系统
- ✅ 客户端 Hydration（`hydrateRoot`）
- ✅ 交互式组件（Counter）
- ✅ Webpack 打包客户端代码
- ✅ 双入口构建系统（server + client）
- ✅ **RSC 组件树序列化** (Phase 2)
- ✅ **Server/Client 组件分离** (Phase 2)
- ✅ **RSC Payload 生成（rsc.json）** (Phase 2)
- ✅ **客户端组件树重建** (Phase 2)
- ✅ **选择性 Hydration** (Phase 2)
- ✅ **Async Server Components** ⬅️ Phase 2.5 新增！
- ✅ **Fragment 支持（React.Fragment / <>...</>）** ⬅️ Phase 2.5 新增！
- ✅ **嵌套 Client Components** ⬅️ Phase 2.5 新增！
- ✅ **RSC Payload 到 HTML 转换** ⬅️ Phase 2.5 新增！

### 技术栈

- **React**: 19.0.0-rc.1
- **构建工具**: Webpack 5
- **TypeScript**: 5.9.3
- **运行时**: tsx（用于执行构建脚本）
- **包管理**: pnpm
- **RSC**: 手写增强实现（异步序列化 + Fragment + 嵌套组件）

### 构建产物

- `index.html`: 3.7KB（从 RSC payload 生成）
- `rsc.json`: 21KB（包含异步数据的完整组件树）
- `client-rsc.js`: 1.03MB（开发模式，仅包含 Client Components）
- 构建时间：~149ms（HTML 生成），~4.8s（webpack）

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
- Phase 2/2.5 需要加载客户端 JavaScript 和 rsc.json
- 浏览器安全策略要求通过 HTTP 协议加载脚本和 JSON
- 直接打开 HTML 文件无法加载 `/assets/client-rsc.js` 和 `/rsc.json`

**页面展示的内容（Phase 2.5）：**
1. **Async Server Component** - 显示构建时异步获取的数据
2. **Fragment Demo** - 演示 Fragment 的使用，无额外 DOM 包裹
3. **Interactive Counter** - 可交互的计数器组件
4. **Nested Components** - 可折叠的 InteractiveCard 包含嵌套的 Counter

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
│   ├── pages/                           # 页面组件
│   │   └── index.tsx                    # 首页（Server Component）
│   ├── components/                      # 共享组件
│   │   ├── Counter.client.tsx           # 交互式计数器（Client Component）
│   │   ├── AsyncData.server.tsx         # Phase 2.5: Async Server Component ⬅️ 新增！
│   │   ├── FragmentList.tsx             # Phase 2.5: Fragment 示例 ⬅️ 新增！
│   │   └── InteractiveCard.client.tsx   # Phase 2.5: 嵌套 Client Component ⬅️ 新增！
│   ├── entries/                         # 构建入口
│   │   ├── client.tsx                   # Phase 1: 客户端 hydration 入口
│   │   └── client-rsc.tsx               # Phase 2/2.5: RSC 客户端入口
│   ├── lib/
│   │   ├── builder.ts                   # 核心 SSG 构建脚本（Phase 2.5 升级）
│   │   ├── rsc-types.ts                 # Phase 2/2.5: RSC 类型定义（增加 Fragment）
│   │   ├── rsc-serializer.ts            # Phase 2/2.5: RSC 序列化器（支持 async）
│   │   ├── rsc-deserializer.ts          # Phase 2/2.5: RSC 反序列化器（支持嵌套）
│   │   └── rsc-to-html.ts               # Phase 2.5: RSC Payload 到 HTML ⬅️ 新增！
│   └── routes.config.ts           # 路由配置
├── dist/                               # 构建输出（git ignored）
│   ├── index.html                      # 从 RSC payload 生成的 HTML (3.7KB)
│   ├── rsc.json                        # RSC Payload (21KB，包含异步数据)
│   └── assets/
│       ├── client-rsc.js               # RSC 客户端 bundle (1MB dev)
│       └── client-rsc.js.map           # Source map
├── docs/
│   ├── Roadmap.md                      # 完整的演进规划（已更新 Phase 2.5）
│   ├── RSC-Architecture.md             # RSC 架构文档
│   └── Phase-2.5-Summary.md            # Phase 2.5 完成总结 ⬅️ 新增！
├── webpack.config.cjs             # Webpack 配置（RSC 客户端打包）
├── tsconfig.json                  # TypeScript 配置
├── package.json
├── CLAUDE.md                      # AI 编程助手指南
├── CHANGELOG.md                   # 变更日志
└── README.md
```

## 🔍 核心原理

### Phase 2.5: Enhanced RSC 工作流程 ⭐ 当前

#### 构建时（Build Time）

1. **Webpack 打包 Client Components**：
   ```bash
   webpack → dist/assets/client-rsc.js  # 只包含 Client Components
   ```

2. **RSC 序列化 + HTML 生成**（Phase 2.5 增强）：
   ```typescript
   // src/lib/builder.ts
   import { createRSCPayload } from './rsc-serializer';
   import { rscPayloadToHTML } from './rsc-to-html';

   // 1. 序列化组件树为 RSC Payload（支持 async）
   const rscPayload = await createRSCPayload(PageComponent);
   fs.writeFileSync('dist/rsc.json', JSON.stringify(rscPayload));

   // 2. 从 RSC payload 生成 HTML（Phase 2.5 新方法）
   // 解决了 renderToString 不支持 async 组件的问题
   const html = rscPayloadToHTML(rscPayload);
   fs.writeFileSync('dist/index.html', createHTMLTemplate(html));
   ```

3. **RSC Payload 结构**（Phase 2.5 扩展）：
   ```json
   {
     "version": "1.0",
     "tree": [
       { "$$type": "element", "tag": "div", "props": {...}, "children": [...] },
       { "$$type": "fragment", "children": [...] },  // Phase 2.5: Fragment 支持
       { "$$type": "text", "content": "Hello" },
       {
         "$$type": "client-placeholder",
         "id": "Counter_0",
         "props": {
           "children": [...]  // Phase 2.5: 支持嵌套组件
         }
       }
     ],
     "clientComponents": {
       "Counter_0": "src/components/Counter.client.tsx",
       "InteractiveCard_0": "src/components/InteractiveCard.client.tsx"
     }
   }
   ```

#### 运行时（Browser Runtime）

1. **浏览器加载 HTML**：
   - 用户立即看到完整内容（服务端渲染）
   - HTML 中包含 `<script src="/assets/client-rsc.js"></script>`

2. **RSC 客户端启动**：
   ```typescript
   // src/entries/client-rsc.tsx
   import { deserializeFromRSC, fetchRSCPayload } from '../lib/rsc-deserializer';

   // 1. 加载 rsc.json
   const payload = await fetchRSCPayload('/rsc.json');

   // 2. 注册 Client Components
   const registry = { 'Counter_0': Counter, ... };

   // 3. 重建组件树
   const tree = deserializeFromRSC(payload, registry);

   // 4. 只 hydrate Client Components
   hydrateRoot(document.getElementById('root'), tree);
   ```

3. **关键优势**：
   - ✅ Server Components (HomePage) 的代码**不在** client-rsc.js 中
   - ✅ 客户端 bundle 只包含 Counter.client.tsx
   - ✅ 组件树结构通过 rsc.json 传输（5.5KB）
   - ✅ 选择性 hydration - 只激活 Client Components

#### Phase 1 vs Phase 2 对比

| 特性 | Phase 1 | Phase 2 (RSC) |
|------|---------|---------------|
| Server Component 代码 | ❌ 包含在 client.js 中 | ✅ 不在客户端 bundle |
| Client Component 代码 | ✅ 包含在 client.js 中 | ✅ 包含在 client-rsc.js 中 |
| Hydration | hydrate 整个树 | 只 hydrate Client Components |
| 组件树传输 | 无（硬编码在 JS 中） | rsc.json (5.5KB) |
| Bundle 优化潜力 | 低 | 高（Server 代码完全排除） |

---

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

### ✅ Phase 2: 简化版 RSC（已完成）⭐

**目标**: 手写 React Server Components 实现

**已完成**:
- ✅ 定义 RSC 类型系统（`rsc-types.ts`，110 行）
- ✅ 实现 RSC 序列化器（`rsc-serializer.ts`，293 行）
- ✅ 实现 RSC 反序列化器（`rsc-deserializer.ts`，145 行）
- ✅ 创建 RSC 客户端入口（`client-rsc.tsx`，80 行）
- ✅ 集成到构建流程（`builder.ts` 升级）
- ✅ 验证 Server/Client 组件分离
- ✅ 验证 RSC Payload 生成和加载
- ✅ 验证选择性 Hydration

**关键学习点**:
- ✅ RSC 组件树序列化原理
- ✅ Client Component 检测和占位符生成
- ✅ Server Component 代码如何排除在客户端 bundle 之外
- ✅ 组件树反序列化和重建
- ✅ 选择性 Hydration vs 全树 Hydration
- ✅ RSC Payload 格式设计（Element、Text、ClientPlaceholder）

**完成时间**: 2025-11-08（1 天实现）

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

完成 Phase 0-2 后，你应该理解：

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

### Phase 2 学习成果 ⭐
- ✅ RSC (React Server Components) 核心原理
- ✅ 组件树序列化和反序列化
- ✅ Server/Client 组件边界划分
- ✅ RSC Payload 格式设计（JSON）
- ✅ 选择性 Hydration 实现
- ✅ 如何完全排除 Server Component 代码在客户端
- ✅ Client Component 检测和占位符生成
- ✅ 组件注册表和动态加载
- ✅ 简化版 vs 完整版 RSC 的区别
- ✅ 为什么 RSC 能减少客户端 bundle 大小

### 关键理解
- **为什么需要 Hydration？** 让服务端渲染的静态 HTML 变得可交互
- **为什么区分 Server/Client Component？** 减少客户端 JS 体积，提升性能
- **什么时候用 `"use client"`？** 只在需要 hooks (useState, useEffect) 或事件处理器时
- **RSC 如何工作？** Server Components 在构建时执行并序列化为 JSON，Client Components 在浏览器中 hydrate
- **RSC 的核心优势是什么？** Server Component 代码完全不发送到浏览器，显著减少 bundle 大小

## 🔄 下一步

### 1. 验证 RSC 工作 ⭐ 已完成

```bash
pnpm build          # 构建（生成 rsc.json + HTML + client-rsc.js）
pnpm preview        # 启动本地服务器
# 打开 http://localhost:3000
# ✅ Counter 按钮能点击
# ✅ 浏览器控制台显示 RSC 启动日志
# ✅ Network 面板能看到 rsc.json 加载
```

### 2. 深入理解 RSC

```bash
# 查看 RSC Payload
cat dist/rsc.json   # 查看组件树序列化结果

# 验证 Server Component 不在客户端 bundle
grep -q "Hello from React 19 SSG" dist/assets/client-rsc.js && echo "❌ 包含" || echo "✅ 不包含"

# 查看 bundle 大小
ls -lh dist/assets/client-rsc.js  # ~1MB (开发模式)
ls -lh dist/rsc.json               # ~5.5KB
```

### 3. 实验练习

- **添加更多 Server Components**: 创建博客文章、数据展示等纯展示组件
- **添加更多 Client Components**: 表单、模态框、Tabs 等交互组件
- **观察 Bundle 变化**: 注意 Server Components 不会增加 client-rsc.js 大小
- **生产模式构建**: 修改 webpack.config.cjs 的 mode 为 'production'，观察 bundle 大小变化

### 4. 后续方向

参考 `docs/Roadmap.md` 和 `CHANGELOG.md`:

- **Phase 2.5 (可选)**: 增强版静态 RSC
  - 异步 Server Components（真正的 async/await）
  - 数据获取层（从文件/API 获取数据）
  - Markdown 渲染

- **Phase 3+ (高难度)**: 完整版 RSC
  - Streaming RSC（流式传输）⭐⭐⭐⭐⭐
  - Suspense 支持 ⭐⭐⭐⭐
  - Server Actions ⭐⭐⭐⭐⭐

## 💡 Phase 2 关键提示

- **RSC Payload**: 组件树序列化为 JSON（5.5KB），包含 Element、Text、ClientPlaceholder 三种节点类型
- **查看 Network 面板**: 应该看到 `client-rsc.js` (1MB) 和 `rsc.json` (5.5KB) 两个请求
- **查看 Console**: 应该看到完整的 RSC 启动流程日志（🚀 启动 → 📦 注册 → 📥 加载 → 🌳 重建 → ✨ 完成）
- **验证分离**: HomePage 的代码（"Hello from React 19 SSG" 等文本）不在 client-rsc.js 中
- **选择性 Hydration**: 只有 Counter 组件被 hydrate，HomePage 保持静态
- **理解简化点**: 我们的实现是静态 RSC（构建时），真实 RSC 支持运行时 Streaming 和 Suspense

## 🤝 贡献

这是一个学习项目，欢迎：
- 提出问题和改进建议
- 分享学习心得
- 贡献文档和示例

## 📄 License

ISC
