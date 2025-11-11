# Phase 3: ISR (Incremental Static Regeneration) 实施规划

> 使用 Koa 服务器实现增量静态再生
> 预计时间：3-5 天

## 🎯 Phase 3 目标

实现 ISR 机制，支持内容更新而无需重新构建整个站点：

1. **Koa 服务器** - 提供 HTTP 服务，处理请求
2. **SWR 缓存策略** - stale-while-revalidate 机制
3. **后台再生** - 在后台异步更新过期页面
4. **Webhook 触发** - 支持手动触发页面更新
5. **并发控制** - 防止同一页面并发再生

## 📐 架构设计

### 整体架构

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────┐
│        Koa Server               │
│  ┌───────────────────────────┐  │
│  │   ISR Middleware          │  │
│  │  - 检查缓存是否过期       │  │
│  │  - 返回 stale 内容        │  │
│  │  - 触发后台再生           │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Cache Manager           │  │
│  │  - 读取缓存               │  │
│  │  - 写入缓存               │  │
│  │  - 缓存元数据管理         │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Revalidation Queue      │  │
│  │  - 再生任务队列           │  │
│  │  - 并发锁                 │  │
│  │  - 重试逻辑               │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
       │
       ▼ Regenerate
┌─────────────────────────────────┐
│   RSC Build Pipeline            │
│  - createRSCPayload()           │
│  - rscPayloadToHTML()           │
│  - 写入缓存                     │
└─────────────────────────────────┘
```

### 数据流

```
1. 请求到达
   → 检查缓存是否存在
   → 检查是否过期

2. 缓存命中且未过期
   → 直接返回

3. 缓存命中但过期（stale）
   → 立即返回 stale 内容（不阻塞）
   → 后台触发再生

4. 缓存未命中
   → 同步生成页面（阻塞）
   → 写入缓存
   → 返回内容

5. 后台再生
   → 加锁（防止并发）
   → 执行 RSC 构建
   → 原子性替换缓存
   → 释放锁
```

## 🗂️ 目录结构

```
react19-ssg-project-simple/
├── src/
│   ├── server/                          # Phase 3 新增：服务端代码
│   │   ├── index.ts                     # Koa 服务器入口
│   │   ├── middleware/
│   │   │   ├── isr.ts                   # ISR 中间件
│   │   │   ├── cache.ts                 # 缓存中间件
│   │   │   └── error.ts                 # 错误处理
│   │   ├── cache/
│   │   │   ├── manager.ts               # 缓存管理器
│   │   │   ├── metadata.ts              # 缓存元数据
│   │   │   └── storage.ts               # 存储接口（内存/文件系统）
│   │   ├── revalidation/
│   │   │   ├── queue.ts                 # 再生队列
│   │   │   ├── worker.ts                # 再生工作器
│   │   │   └── lock.ts                  # 并发锁
│   │   ├── routes/
│   │   │   ├── pages.ts                 # 页面路由
│   │   │   └── webhook.ts               # Webhook 路由
│   │   └── utils/
│   │       ├── logger.ts                # 日志工具
│   │       └── metrics.ts               # 性能指标
│   ├── lib/
│   │   └── regenerate.ts                # Phase 3 新增：页面再生逻辑
│   └── routes.config.ts                 # 更新：添加 revalidate 配置
├── cache/                               # Phase 3 新增：缓存目录（git ignored）
│   ├── pages/
│   │   └── index.html
│   └── metadata/
│       └── index.json
└── server.config.ts                     # Phase 3 新增：服务器配置
```

## 📦 依赖安装

```bash
# Koa 核心
pnpm add koa koa-router koa-bodyparser koa-static

# 类型定义
pnpm add -D @types/koa @types/koa-router @types/koa-bodyparser @types/koa-static

# 工具库
pnpm add lru-cache                       # LRU 缓存（可选，用于内存缓存）
pnpm add p-queue                         # 异步队列（可选，用于任务队列）

# 日志和监控（可选）
pnpm add pino pino-pretty                # 高性能日志
```

## 🛠️ 核心实现

### 1. 路由配置更新

```typescript
// src/routes.config.ts
export interface RouteConfig {
  path: string;
  component: string;
  mode: 'static' | 'isr' | 'ssr';        // Phase 3: 添加 mode
  revalidate?: number;                    // Phase 3: 再生间隔（秒）
  cacheTags?: string[];                   // Phase 3: 缓存标签（用于精确失效）
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: 'index',
    mode: 'isr',                          // ISR 模式
    revalidate: 60,                       // 60 秒后过期
    cacheTags: ['homepage'],
  },
  {
    path: '/about',
    component: 'about',
    mode: 'static',                       // 纯静态，不再生
  },
];
```

### 2. 缓存管理器

```typescript
// src/server/cache/manager.ts
export interface CacheEntry {
  html: string;
  rscPayload: any;
  metadata: {
    createdAt: number;
    expiresAt: number;
    revalidate: number;
    tags: string[];
  };
}

export class CacheManager {
  private storage: Map<string, CacheEntry>;  // 简化版：内存存储

  async get(key: string): Promise<CacheEntry | null> {
    // 从缓存读取
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    // 写入缓存
  }

  isStale(entry: CacheEntry): boolean {
    // 检查是否过期
    return Date.now() > entry.metadata.expiresAt;
  }

  async invalidate(tags: string[]): Promise<void> {
    // 根据 tags 失效缓存
  }
}
```

### 3. ISR 中间件

```typescript
// src/server/middleware/isr.ts
import type { Context, Next } from 'koa';

export function isrMiddleware(cacheManager: CacheManager, revalidationQueue: RevalidationQueue) {
  return async (ctx: Context, next: Next) => {
    const path = ctx.path;
    const routeConfig = findRouteConfig(path);

    if (!routeConfig || routeConfig.mode !== 'isr') {
      return next();
    }

    // 1. 尝试从缓存获取
    const cached = await cacheManager.get(path);

    if (!cached) {
      // 缓存未命中 - 同步生成
      const page = await generatePage(path, routeConfig);
      await cacheManager.set(path, page);
      ctx.body = page.html;
      ctx.set('X-Cache', 'MISS');
      return;
    }

    // 2. 检查是否过期
    const isStale = cacheManager.isStale(cached);

    if (!isStale) {
      // 缓存新鲜 - 直接返回
      ctx.body = cached.html;
      ctx.set('X-Cache', 'HIT');
      return;
    }

    // 3. 缓存过期但存在 - SWR 策略
    // 立即返回 stale 内容
    ctx.body = cached.html;
    ctx.set('X-Cache', 'STALE');

    // 后台触发再生（不阻塞响应）
    revalidationQueue.enqueue({
      path,
      routeConfig,
      priority: 'normal',
    });
  };
}
```

### 4. 再生队列

```typescript
// src/server/revalidation/queue.ts
export interface RevalidationTask {
  path: string;
  routeConfig: RouteConfig;
  priority: 'high' | 'normal' | 'low';
}

export class RevalidationQueue {
  private queue: RevalidationTask[] = [];
  private processing = new Set<string>();  // 正在处理的路径
  private locks = new Map<string, Promise<void>>();  // 路径锁

  async enqueue(task: RevalidationTask): Promise<void> {
    // 防止重复入队
    if (this.processing.has(task.path)) {
      console.log(`⏭️  Skip: ${task.path} already in queue`);
      return;
    }

    this.queue.push(task);
    this.processQueue();  // 异步处理
  }

  private async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;

      // 检查并发锁
      if (this.locks.has(task.path)) {
        await this.locks.get(task.path);
        continue;
      }

      // 加锁并处理
      const lockPromise = this.processTask(task);
      this.locks.set(task.path, lockPromise);

      try {
        await lockPromise;
      } finally {
        this.locks.delete(task.path);
        this.processing.delete(task.path);
      }
    }
  }

  private async processTask(task: RevalidationTask): Promise<void> {
    this.processing.add(task.path);
    console.log(`🔄 Revalidating: ${task.path}`);

    try {
      const startTime = Date.now();

      // 执行再生
      const page = await generatePage(task.path, task.routeConfig);

      // 更新缓存
      await cacheManager.set(task.path, page);

      const duration = Date.now() - startTime;
      console.log(`✅ Revalidated: ${task.path} (${duration}ms)`);
    } catch (error) {
      console.error(`❌ Revalidation failed: ${task.path}`, error);
      // 可以实现重试逻辑
    }
  }
}
```

### 5. 页面生成函数

```typescript
// src/lib/regenerate.ts
import { createRSCPayload } from './rsc-serializer.js';
import { rscPayloadToHTML } from './rsc-to-html.js';
import type { RouteConfig } from '../routes.config.js';

export async function generatePage(
  path: string,
  routeConfig: RouteConfig
): Promise<{ html: string; rscPayload: any }> {
  console.log(`📄 Generating page: ${path}`);

  // 1. 导入页面组件
  const PageComponent = await import(`../pages/${routeConfig.component}.tsx`);

  // 2. 生成 RSC Payload
  const rscPayload = await createRSCPayload(PageComponent.default);

  // 3. 生成 HTML
  const content = rscPayloadToHTML(rscPayload);
  const html = createHTMLTemplate(content, routeConfig.component);

  return { html, rscPayload };
}

function createHTMLTemplate(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - React 19 ISR</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="root">${content}</div>
  <script src="/assets/client-rsc.js"></script>
</body>
</html>`;
}
```

### 6. Koa 服务器入口

```typescript
// src/server/index.ts
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import path from 'path';
import { isrMiddleware } from './middleware/isr.js';
import { CacheManager } from './cache/manager.js';
import { RevalidationQueue } from './revalidation/queue.js';

const app = new Koa();
const router = new Router();

// 初始化
const cacheManager = new CacheManager();
const revalidationQueue = new RevalidationQueue(cacheManager);

// 中间件
app.use(bodyParser());
app.use(serve(path.join(__dirname, '../../dist')));  // 静态资源

// ISR 中间件
app.use(isrMiddleware(cacheManager, revalidationQueue));

// Webhook 路由（用于手动触发再生）
router.post('/api/revalidate', async (ctx) => {
  const { path, secret } = ctx.request.body;

  // 验证密钥
  if (secret !== process.env.REVALIDATE_SECRET) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid secret' };
    return;
  }

  // 触发再生
  const routeConfig = findRouteConfig(path);
  if (routeConfig) {
    await revalidationQueue.enqueue({
      path,
      routeConfig,
      priority: 'high',
    });
    ctx.body = { revalidated: true };
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Route not found' };
  }
});

app.use(router.routes());

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ISR Server running on http://localhost:${PORT}`);
});
```

## 📋 实施步骤

### Phase 3.1: 基础服务器（1天）

- [ ] 安装 Koa 依赖
- [ ] 创建基础 Koa 服务器
- [ ] 实现静态文件服务
- [ ] 测试基本的 HTTP 服务

**验收标准**：
```bash
pnpm dev:server
curl http://localhost:3000/  # 返回页面
```

### Phase 3.2: 缓存系统（1天）

- [ ] 实现 CacheManager
- [ ] 内存缓存实现
- [ ] 缓存元数据管理
- [ ] 缓存读写测试

**验收标准**：
- 能够缓存和读取页面
- 正确判断缓存是否过期

### Phase 3.3: ISR 中间件（1天）

- [ ] 实现 ISR 中间件
- [ ] SWR 逻辑
- [ ] 同步生成逻辑（缓存未命中）
- [ ] 响应头设置（X-Cache）

**验收标准**：
- 首次请求：生成并缓存
- 再次请求（未过期）：直接返回
- 过期请求：返回 stale + 后台再生

### Phase 3.4: 再生队列（1天）

- [ ] 实现 RevalidationQueue
- [ ] 并发锁机制
- [ ] 后台异步处理
- [ ] 错误处理和重试

**验收标准**：
- 同一路径不会并发再生
- 再生失败有日志
- 多个任务按序处理

### Phase 3.5: Webhook 和监控（1天）

- [ ] Webhook 路由
- [ ] 手动触发再生
- [ ] 日志系统
- [ ] 性能指标收集

**验收标准**：
```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"path": "/", "secret": "xxx"}'
# 返回 {"revalidated": true}
```

## 🎯 验收标准

### 功能测试

1. **缓存命中**：
   ```bash
   curl -I http://localhost:3000/
   # X-Cache: HIT
   ```

2. **缓存过期（SWR）**：
   - 等待 revalidate 时间过期
   - 再次请求应立即返回（stale）
   - 后台触发再生

3. **手动触发**：
   ```bash
   curl -X POST http://localhost:3000/api/revalidate \
     -d '{"path": "/", "secret": "secret"}'
   ```

4. **并发控制**：
   - 同时发送多个过期请求
   - 只触发一次再生

### 性能指标

- **缓存命中响应时间**：< 10ms
- **Stale 响应时间**：< 50ms
- **再生时间**：< 500ms
- **并发处理**：100+ req/s

## 📝 配置文件

```typescript
// server.config.ts
export default {
  port: 3000,
  cache: {
    type: 'memory',  // 'memory' | 'filesystem'
    maxSize: 100,    // 最大缓存条目数
  },
  revalidation: {
    concurrency: 3,  // 最大并发再生数
    retryAttempts: 3,
    retryDelay: 1000,
  },
  webhook: {
    secret: process.env.REVALIDATE_SECRET || 'dev-secret',
  },
};
```

## 🔧 package.json 脚本

```json
{
  "scripts": {
    "build": "pnpm build:client && pnpm build:html",
    "build:client": "webpack --config webpack.config.cjs",
    "build:html": "tsx src/lib/builder.ts",
    "dev:server": "tsx watch src/server/index.ts",
    "start": "NODE_ENV=production tsx src/server/index.ts",
    "preview": "serve dist -p 3000"
  }
}
```

## 📚 学习目标

完成 Phase 3 后，你将理解：

- ✅ ISR 的工作原理
- ✅ SWR (stale-while-revalidate) 策略
- ✅ 缓存失效和再生机制
- ✅ 并发控制和锁机制
- ✅ 后台任务队列
- ✅ Koa 服务器开发
- ✅ 如何构建可扩展的 ISR 系统

## 🔮 Phase 4 预览

完成 ISR 后，Phase 4 将添加：
- 完整的 SSR 支持
- 动态路由参数
- 按需渲染
- CDN 集成

---

**准备好开始了吗？** 让我知道，我会帮你逐步实现！
