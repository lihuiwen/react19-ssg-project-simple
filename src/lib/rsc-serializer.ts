/**
 * RSC 序列化器
 *
 * 将 React 组件树序列化为 RSC payload 格式。
 *
 * 核心职责：
 * 1. 遍历组件树
 * 2. 检测 Client Components（*.client.tsx 命名约定）
 * 3. 将 Server Components 序列化为 JSON
 * 4. 为 Client Components 插入占位符
 *
 * 简化实现方案：
 * - 直接遍历 React 元素树
 * - 通过文件命名约定识别 Client Components
 * - 序列化为简单的 JSON 结构
 */

import { createElement, ReactElement, isValidElement, Fragment } from 'react';
import type {
  RSCNode,
  RSCElement,
  RSCText,
  RSCClientPlaceholder,
  RSCFragment,
  RSCPayload,
  RSCContext,
} from './rsc-types';

/**
 * 检查组件是否为 Client Component
 *
 * 简化检测：检查组件源文件是否以 .client.tsx 结尾
 * 完整实现中应该解析源代码查找 "use client" 指令
 */
function isClientComponent(Component: any): boolean {
  // 检查组件的显示名称或文件路径
  const displayName = Component.displayName || Component.name || '';

  // 约定：*.client.tsx 文件是 Client Components
  return displayName.includes('client') ||
         (Component.__componentPath && Component.__componentPath.includes('.client.'));
}

/**
 * 为 Client Component 生成唯一 ID
 */
function generateClientComponentId(context: RSCContext, componentName: string): string {
  const id = `${componentName}_${context.clientComponentCounter++}`;
  return id;
}

/**
 * 将 React 元素树序列化为 RSC 格式
 *
 * Phase 2.5 Update: 支持异步 Server Components
 * - 可以处理 async 函数组件
 * - 在构建时等待所有异步操作完成
 */
export async function serializeToRSC(
  element: ReactElement,
  context: RSCContext = {
    clientComponentCounter: 0,
    clientComponents: new Map(),
  }
): Promise<{ tree: RSCNode[]; clientComponents: Record<string, string> }> {
  const tree = await serializeElement(element, context);

  // 将 Map 转换为普通对象以便 JSON 序列化
  const clientComponents: Record<string, string> = {};
  context.clientComponents.forEach((path, id) => {
    clientComponents[id] = path;
  });

  return {
    tree: Array.isArray(tree) ? tree : [tree],
    clientComponents,
  };
}

/**
 * 序列化单个 React 元素
 *
 * Phase 2.5 Update: 支持异步处理
 */
async function serializeElement(element: any, context: RSCContext): Promise<RSCNode | RSCNode[]> {
  // 处理 null/undefined
  if (element == null) {
    return [];
  }

  // 处理文本/数字
  if (typeof element === 'string' || typeof element === 'number') {
    return createTextNode(String(element));
  }

  // 处理布尔值（不渲染）
  if (typeof element === 'boolean') {
    return [];
  }

  // 处理数组
  if (Array.isArray(element)) {
    const results = await Promise.all(
      element.map(child => serializeElement(child, context))
    );
    return results.flat();
  }

  // 处理 React 元素
  if (isValidElement(element)) {
    const { type, props } = element;

    // Phase 2.5: 处理 Fragment（React.Fragment 或 <>...</>）
    if (type === Fragment) {
      return serializeFragment(props, context);
    }

    // 处理字符串标签（div, span 等）
    if (typeof type === 'string') {
      return serializeHTMLElement(type, props, context);
    }

    // 处理函数组件
    if (typeof type === 'function') {
      // 检查是否为 Client Component
      if (isClientComponent(type)) {
        return serializeClientComponent(type, props, context);
      }

      // 是 Server Component - 执行它（可能是异步的）
      return serializeServerComponent(type, props, context);
    }
  }

  // 后备方案：转换为字符串
  console.warn('未知元素类型，转换为字符串:', element);
  return createTextNode(String(element));
}

/**
 * 序列化 Fragment
 *
 * Phase 2.5: Fragment 不渲染 DOM，只包含子节点
 */
async function serializeFragment(
  props: any,
  context: RSCContext
): Promise<RSCFragment> {
  const { children } = props;

  // 序列化子元素
  const serializedChildren = await serializeChildren(children, context);

  return {
    $$type: 'fragment',
    children: serializedChildren,
  };
}

/**
 * 序列化 HTML 元素（div, span 等）
 *
 * Phase 2.5 Update: 支持异步子元素
 */
async function serializeHTMLElement(
  tag: string,
  props: any,
  context: RSCContext
): Promise<RSCElement> {
  const { children, ...restProps } = props;

  // 递归序列化子元素（可能包含异步组件）
  const serializedChildren = await serializeChildren(children, context);

  return {
    $$type: 'element',
    tag,
    props: sanitizeProps(restProps),
    children: serializedChildren,
  };
}

/**
 * 序列化 Server Component
 *
 * Phase 2.5 Update: 支持异步 Server Components
 * - 可以使用 async/await
 * - 可以进行数据获取（fetch、fs.readFile 等）
 * - 构建时会等待所有异步操作完成
 */
async function serializeServerComponent(
  Component: any,
  props: any,
  context: RSCContext
): Promise<RSCNode | RSCNode[]> {
  try {
    // 执行 Server Component 函数
    // Phase 2.5: Component 可能是 async 函数
    const result = Component(props);

    // 检查是否为 Promise（async 函数的返回值）
    const resolvedResult = result instanceof Promise ? await result : result;

    // 序列化结果（可能包含更多异步组件）
    return await serializeElement(resolvedResult, context);
  } catch (error) {
    console.error('渲染 Server Component 出错:', Component.name, error);
    return createTextNode(`[错误: ${Component.name}]`);
  }
}

/**
 * 序列化 Client Component
 *
 * Phase 2.5 Update: 支持嵌套 Client Components
 * - 创建占位符而不执行组件
 * - 如果 children 包含其他组件，递归序列化它们
 */
async function serializeClientComponent(
  Component: any,
  props: any,
  context: RSCContext
): Promise<RSCClientPlaceholder> {
  const componentName = Component.displayName || Component.name || 'Unknown';

  // 生成唯一 ID
  const id = generateClientComponentId(context, componentName);

  // 确定组件路径（简化版 - 真实实现需要更好的路径追踪）
  const componentPath = Component.__componentPath ||
                        `src/components/${componentName}.tsx`;

  // 注册 Client Component
  context.clientComponents.set(id, componentPath);

  // Phase 2.5: 序列化 props 和 children（支持嵌套组件）
  const sanitizedProps = await sanitizePropsWithChildren(props, context);

  return {
    $$type: 'client-placeholder',
    id,
    componentPath,
    props: sanitizedProps,
  };
}

/**
 * 序列化子元素
 *
 * Phase 2.5 Update: 支持异步子元素
 */
async function serializeChildren(children: any, context: RSCContext): Promise<RSCNode[]> {
  if (children == null) {
    return [];
  }

  if (Array.isArray(children)) {
    const results = await Promise.all(
      children.map(child => serializeElement(child, context))
    );
    return results.flat();
  }

  const result = await serializeElement(children, context);
  return Array.isArray(result) ? result : [result];
}

/**
 * 创建文本节点
 */
function createTextNode(content: string): RSCText {
  return {
    $$type: 'text',
    content,
  };
}

/**
 * 清理 props 以便序列化（同步版本）
 *
 * 移除函数、symbols 和其他不可序列化的值
 */
function sanitizeProps(props: any): Record<string, any> {
  if (!props || typeof props !== 'object') {
    return {};
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    // 跳过特殊 props
    if (key === 'children' || key === 'key' || key === 'ref') {
      continue;
    }

    // 跳过函数
    if (typeof value === 'function') {
      continue;
    }

    // 跳过 symbols
    if (typeof value === 'symbol') {
      continue;
    }

    // 递归处理对象（用于 style 等）
    if (value && typeof value === 'object' && !Array.isArray(value) && !isValidElement(value)) {
      sanitized[key] = sanitizeProps(value);
      continue;
    }

    // 包含基本类型值和数组
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * 清理 props 并处理 children
 *
 * Phase 2.5: 支持嵌套 Client Components
 * - 序列化 children 中的 React 元素（可能包含其他 Client Components）
 */
async function sanitizePropsWithChildren(props: any, context: RSCContext): Promise<Record<string, any>> {
  if (!props || typeof props !== 'object') {
    return {};
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    // 跳过特殊 props
    if (key === 'key' || key === 'ref') {
      continue;
    }

    // Phase 2.5: 特殊处理 children - 可能包含嵌套的 Client Components
    if (key === 'children') {
      // 序列化 children（递归处理嵌套组件）
      const serializedChildren = await serializeChildren(value, context);

      // 如果 children 有内容，保存序列化后的结果
      if (serializedChildren.length > 0) {
        sanitized[key] = serializedChildren;
      }
      continue;
    }

    // 跳过函数
    if (typeof value === 'function') {
      continue;
    }

    // 跳过 symbols
    if (typeof value === 'symbol') {
      continue;
    }

    // 递归处理对象（用于 style 等）
    if (value && typeof value === 'object' && !Array.isArray(value) && !isValidElement(value)) {
      sanitized[key] = sanitizeProps(value);
      continue;
    }

    // 包含基本类型值和数组
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * 创建 RSC Payload
 *
 * Phase 2.5 Update: 支持异步页面组件
 * 高级函数：序列化页面组件（构建时等待所有异步操作）
 */
export async function createRSCPayload(PageComponent: any, props: any = {}): Promise<RSCPayload> {
  const context: RSCContext = {
    clientComponentCounter: 0,
    clientComponents: new Map(),
  };

  const element = createElement(PageComponent, props);
  const { tree, clientComponents } = await serializeToRSC(element, context);

  return {
    version: '1.0',
    tree,
    clientComponents,
  };
}
