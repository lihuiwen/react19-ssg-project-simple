# React Server Components (RSC) 架构设计

> 本文档记录我们手写简化版 RSC 的架构设计和实现思路

## 🎯 核心目标

**问题**：Phase 1 中，即使是纯展示的组件（如博客文章），也必须打包到客户端 JS 中。

**解决方案**：RSC 让组件可以"只在服务端运行"，输出序列化的结果，客户端只接收数据。

## 🏗️ RSC 核心概念

### 1. 两种组件类型

```typescript
// Server Component (默认)
// - 在构建时/服务端执行
// - 可以访问文件系统、数据库
// - 代码不发送到浏览器
export default function BlogPost({ id }) {
  const post = readFileSync(`posts/${id}.md`); // ✅ 可以
  return <article>{post}</article>;
}

// Client Component (标记 "use client")
// - 在浏览器执行
// - 可以使用 hooks、事件处理器
// - 代码发送到浏览器
"use client";
export default function Counter() {
  const [count, setCount] = useState(0); // ✅ 可以
  return <button onClick={...}>{count}</button>;
}
```

### 2. RSC 工作流程

#### Phase 1（当前）：
```
构建时：
  ServerComponent + ClientComponent → renderToString → HTML
  ClientComponent → webpack → client.js (包含所有组件代码)

浏览器：
  加载 HTML + client.js (1MB) → hydrateRoot(整个树)
```

**问题**：即使 ServerComponent 只显示静态内容，它的代码也在 client.js 里！

#### Phase 2（RSC）：
```
构建时：
  ServerComponent → 执行 → 序列化输出 (JSON) → rsc.json
  ClientComponent → webpack → client.js (只包含 Client 组件)

  合并 rsc.json + HTML → 完整页面

浏览器：
  加载 HTML + client.js + rsc.json
  读取 rsc.json → 重建组件树 → 只 hydrate ClientComponent
```

**优势**：
- client.js 更小（不包含 Server Component 代码）
- Server Component 可以用 async/await、fs、数据库
- 清晰的服务端/客户端边界

### 3. RSC Payload 格式（简化版）

真实的 RSC 使用复杂的流式协议，我们实现简化版：

```typescript
// RSC Payload 格式
interface RSCPayload {
  // 组件树结构
  tree: RSCNode[];

  // Client Component 映射
  clientComponents: {
    [id: string]: string; // id -> 模块路径
  };
}

// RSC 节点
type RSCNode =
  | { type: 'element'; tag: string; props: any; children: RSCNode[] }
  | { type: 'text'; content: string }
  | { type: 'client-placeholder'; id: string; props: any };

// 示例：
{
  "tree": [
    {
      "type": "element",
      "tag": "div",
      "props": { "className": "container" },
      "children": [
        { "type": "text", "content": "Hello from Server!" },
        {
          "type": "client-placeholder",
          "id": "Counter",
          "props": { "initialCount": 0 }
        }
      ]
    }
  ],
  "clientComponents": {
    "Counter": "src/components/Counter.client.tsx"
  }
}
```

## 🔄 我们的实现计划

### Step 1: 设计 RSC Payload 格式 ✅（上面已定义）

### Step 2: 实现组件树分析器

**目标**：遍历组件树，区分 Server/Client 组件

```typescript
// src/lib/rsc-analyzer.ts
function analyzeComponentTree(element: ReactElement): RSCPayload {
  // 1. 递归遍历组件树
  // 2. 检测 "use client" 指令
  // 3. Server Component → 执行并序列化
  // 4. Client Component → 生成 placeholder
}
```

### Step 3: Server 端序列化

**目标**：将 Server Component 渲染为 JSON

```typescript
// src/lib/rsc-renderer.ts
function renderServerComponent(Component): RSCNode[] {
  // 1. 执行组件函数
  // 2. 递归处理子元素
  // 3. 遇到 Client Component → 插入 placeholder
  // 4. 输出 JSON
}
```

### Step 4: Client 端反序列化

**目标**：从 RSC Payload 重建组件树

```typescript
// src/entries/client-rsc.tsx
function reconstructTree(payload: RSCPayload): ReactElement {
  // 1. 读取 payload.tree
  // 2. 重建 React 元素树
  // 3. 遇到 client-placeholder → 加载实际的 Client Component
  // 4. 调用 hydrateRoot()
}
```

### Step 5: 构建流程整合

```
1. webpack 打包 Client Components → client.js
2. 运行 RSC 分析器 → rsc.json
3. 生成 HTML（包含 rsc.json 引用）
4. 浏览器加载 → 重建树 → hydrate
```

## 🎯 验收标准

完成后应该实现：

1. ✅ Server Component 代码不在 client.js 中
2. ✅ Client Component 正常工作（Counter 可点击）
3. ✅ client.js 大小明显减小（至少 30%）
4. ✅ Server Component 可以使用 async/await
5. ✅ 生成的 rsc.json 正确描述组件树

## 🚧 简化点（vs 真实 RSC）

我们的简化版：
- ❌ 不支持 Streaming（流式传输）
- ❌ 不支持 Suspense
- ❌ 不支持 Server Actions
- ❌ 不支持动态导入
- ✅ 只做静态构建时的 RSC
- ✅ 用简单的 JSON 代替复杂的 Wire Format

## 📖 参考资料

- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [React Server Components Demo](https://github.com/reactjs/server-components-demo)
- [Dan Abramov - RSC from Scratch](https://github.com/reactwg/server-components/discussions)

---

**下一步**：开始实现组件树分析器
