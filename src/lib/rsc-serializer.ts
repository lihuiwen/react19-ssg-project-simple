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

import { createElement, ReactElement, isValidElement } from 'react';
import type {
  RSCNode,
  RSCElement,
  RSCText,
  RSCClientPlaceholder,
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
 * 简化实现：
 * 1. 遍历 React 元素理解结构
 * 2. 通过遍历元素树构建 RSC 树
 * 3. 将 Client Components 替换为占位符
 */
export function serializeToRSC(
  element: ReactElement,
  context: RSCContext = {
    clientComponentCounter: 0,
    clientComponents: new Map(),
  }
): { tree: RSCNode[]; clientComponents: Record<string, string> } {
  const tree = serializeElement(element, context);

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
 */
function serializeElement(element: any, context: RSCContext): RSCNode | RSCNode[] {
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
    return element.flatMap(child => serializeElement(child, context));
  }

  // 处理 React 元素
  if (isValidElement(element)) {
    const { type, props } = element;

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

      // 是 Server Component - 执行它
      return serializeServerComponent(type, props, context);
    }
  }

  // 后备方案：转换为字符串
  console.warn('未知元素类型，转换为字符串:', element);
  return createTextNode(String(element));
}

/**
 * 序列化 HTML 元素（div, span 等）
 */
function serializeHTMLElement(
  tag: string,
  props: any,
  context: RSCContext
): RSCElement {
  const { children, ...restProps } = props;

  // 递归序列化子元素
  const serializedChildren = serializeChildren(children, context);

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
 * 执行组件函数并序列化其输出
 */
function serializeServerComponent(
  Component: any,
  props: any,
  context: RSCContext
): RSCNode | RSCNode[] {
  try {
    // 执行 Server Component 函数
    // 注意：Component 是函数，调用它会返回 ReactElement
    const result = Component(props);

    // 序列化结果
    return serializeElement(result, context);
  } catch (error) {
    console.error('渲染 Server Component 出错:', Component.name, error);
    return createTextNode(`[错误: ${Component.name}]`);
  }
}

/**
 * 序列化 Client Component
 *
 * 创建占位符而不执行组件
 */
function serializeClientComponent(
  Component: any,
  props: any,
  context: RSCContext
): RSCClientPlaceholder {
  const componentName = Component.displayName || Component.name || 'Unknown';

  // 生成唯一 ID
  const id = generateClientComponentId(context, componentName);

  // 确定组件路径（简化版 - 真实实现需要更好的路径追踪）
  const componentPath = Component.__componentPath ||
                        `src/components/${componentName}.tsx`;

  // 注册 Client Component
  context.clientComponents.set(id, componentPath);

  // 清理 props（移除函数等）
  const sanitizedProps = sanitizeProps(props);

  return {
    $$type: 'client-placeholder',
    id,
    componentPath,
    props: sanitizedProps,
  };
}

/**
 * 序列化子元素
 */
function serializeChildren(children: any, context: RSCContext): RSCNode[] {
  if (children == null) {
    return [];
  }

  if (Array.isArray(children)) {
    return children.flatMap(child => serializeElement(child, context));
  }

  const result = serializeElement(children, context);
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
 * 清理 props 以便序列化
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
    if (value && typeof value === 'object' && !Array.isArray(value)) {
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
 * 高级函数：序列化页面组件
 */
export function createRSCPayload(PageComponent: any, props: any = {}): RSCPayload {
  const context: RSCContext = {
    clientComponentCounter: 0,
    clientComponents: new Map(),
  };

  const element = createElement(PageComponent, props);
  const { tree, clientComponents } = serializeToRSC(element, context);

  return {
    version: '1.0',
    tree,
    clientComponents,
  };
}
