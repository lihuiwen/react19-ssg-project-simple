/**
 * RSC (React Server Components) 类型定义
 *
 * 本文件定义了简化版 RSC payload 格式，用于序列化 Server Components
 * 并在客户端重建组件树。
 *
 * 简化版 vs 完整版 RSC：
 * - ✅ 组件树序列化
 * - ✅ Server/Client 组件边界
 * - ❌ 不支持流式传输（仅静态 JSON）
 * - ❌ 不支持 Suspense
 * - ❌ 不支持 Server Actions
 */

/**
 * RSC 节点类型
 *
 * Phase 2.5 Update: 扩展节点类型
 * - HTML 元素（div、span 等）
 * - 文本节点
 * - Client Component 占位符
 * - Fragment（React.Fragment / <>...</>）
 */
export type RSCNode =
  | RSCElement
  | RSCText
  | RSCClientPlaceholder
  | RSCFragment;

/**
 * 普通 HTML/React 元素
 *
 * 表示服务端渲染的 HTML 元素
 */
export interface RSCElement {
  $$type: 'element';              // 类型标记（用于类型区分）
  tag: string;                    // 标签名：'div', 'span', 'h1' 等
  props: Record<string, any>;     // 属性：{ className: 'foo', style: {...} }
  children: RSCNode[];            // 子节点
}

/**
 * 文本内容
 *
 * 表示纯文本节点
 */
export interface RSCText {
  $$type: 'text';
  content: string;
}

/**
 * Client Component 占位符
 *
 * 不在服务端渲染 Client Component，而是插入一个占位符
 * 告诉客户端："在这里加载组件 X，传入这些 props，并进行 hydration"
 */
export interface RSCClientPlaceholder {
  $$type: 'client-placeholder';
  id: string;                     // 该 Client Component 实例的唯一 ID
  componentPath: string;          // 组件文件路径
  props: Record<string, any>;     // 传递给组件的 props
}

/**
 * Fragment 节点
 *
 * Phase 2.5: 支持 React.Fragment 和 <>...</>
 * Fragment 本身不渲染 DOM，只包含子节点
 */
export interface RSCFragment {
  $$type: 'fragment';
  children: RSCNode[];
}

/**
 * 完整的 RSC Payload
 *
 * 这是序列化到 rsc.json 并发送到客户端的数据结构
 */
export interface RSCPayload {
  // 版本号（用于未来兼容性）
  version: string;

  // 序列化的组件树
  tree: RSCNode[];

  // Client Component ID 到模块路径的映射
  // 允许客户端动态导入实际的组件
  // 示例：{ "Counter_0": "src/components/Counter.client.tsx" }
  clientComponents: Record<string, string>;
}

/**
 * 组件元数据
 *
 * 组件分析期间的信息
 */
export interface ComponentMetadata {
  // 是否为 Client Component（包含 "use client" 指令）
  isClientComponent: boolean;

  // 组件文件路径
  componentPath: string;

  // 显示名称（用于调试）
  displayName: string;
}

/**
 * RSC 序列化上下文
 *
 * 在序列化过程中维护状态
 */
export interface RSCContext {
  // 用于生成唯一 Client Component ID 的计数器
  clientComponentCounter: number;

  // 已发现的 Client Components 注册表
  // 映射：组件路径 → ID
  clientComponents: Map<string, string>;
}

/**
 * 辅助类型守卫
 */
export function isRSCElement(node: RSCNode): node is RSCElement {
  return node.$$type === 'element';
}

export function isRSCText(node: RSCNode): node is RSCText {
  return node.$$type === 'text';
}

export function isRSCClientPlaceholder(node: RSCNode): node is RSCClientPlaceholder {
  return node.$$type === 'client-placeholder';
}

export function isRSCFragment(node: RSCNode): node is RSCFragment {
  return node.$$type === 'fragment';
}
