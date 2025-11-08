/**
 * RSC 反序列化器
 *
 * 将 RSC payload 重建为 React 组件树。
 *
 * 核心职责：
 * 1. 解析 RSC JSON payload
 * 2. 重建 React 元素树
 * 3. 动态加载 Client Components
 * 4. 在正确位置插入 Client Components
 *
 * 简化实现方案：
 * - 同步加载 Client Components（不使用 lazy/Suspense）
 * - 直接返回完整的 React 元素树
 * - 不处理流式传输
 */

import { createElement, ReactElement, ReactNode } from 'react';
import type {
  RSCNode,
  RSCElement,
  RSCClientPlaceholder,
  RSCPayload,
} from './rsc-types';
import {
  isRSCElement,
  isRSCText,
  isRSCClientPlaceholder,
} from './rsc-types';

/**
 * Client Component 注册表
 *
 * 映射组件路径到实际的组件模块
 * 在实际应用中，这些组件会通过 webpack 动态导入
 */
type ComponentRegistry = Record<string, React.ComponentType<any>>;

/**
 * 从 RSC Payload 重建 React 元素树
 *
 * @param payload - RSC payload (从 rsc.json 加载)
 * @param componentRegistry - Client Component 注册表
 */
export function deserializeFromRSC(
  payload: RSCPayload,
  componentRegistry: ComponentRegistry
): ReactElement {
  // 验证 payload 版本
  if (payload.version !== '1.0') {
    console.warn(`未知的 RSC payload 版本: ${payload.version}`);
  }

  // 重建组件树
  const children = payload.tree.map(node =>
    deserializeNode(node, payload.clientComponents, componentRegistry)
  );

  // 如果只有一个根节点且是 ReactElement，直接返回
  if (children.length === 1 && typeof children[0] === 'object' && children[0] !== null) {
    return children[0] as ReactElement;
  }

  // 多个根节点或单个文本节点，包裹在 div 中
  return createElement('div', null, ...children);
}

/**
 * 反序列化单个 RSC 节点
 */
function deserializeNode(
  node: RSCNode,
  clientComponents: Record<string, string>,
  componentRegistry: ComponentRegistry
): ReactNode {
  // 处理文本节点
  if (isRSCText(node)) {
    return node.content;
  }

  // 处理 HTML 元素
  if (isRSCElement(node)) {
    return deserializeElement(node, clientComponents, componentRegistry);
  }

  // 处理 Client Component 占位符
  if (isRSCClientPlaceholder(node)) {
    return deserializeClientPlaceholder(node, componentRegistry);
  }

  // 未知节点类型
  console.error('未知的 RSC 节点类型:', node);
  return '[未知节点]';
}

/**
 * 反序列化 HTML 元素
 */
function deserializeElement(
  element: RSCElement,
  clientComponents: Record<string, string>,
  componentRegistry: ComponentRegistry
): ReactElement {
  // 递归反序列化子节点
  const children = element.children.map(child =>
    deserializeNode(child, clientComponents, componentRegistry)
  );

  // 创建 React 元素
  return createElement(
    element.tag,
    element.props,
    ...children
  );
}

/**
 * 反序列化 Client Component 占位符
 *
 * 从注册表中查找实际的组件并实例化
 */
function deserializeClientPlaceholder(
  placeholder: RSCClientPlaceholder,
  componentRegistry: ComponentRegistry
): ReactElement {
  const { id, componentPath, props } = placeholder;

  // 从注册表中查找组件
  const Component = componentRegistry[id] || componentRegistry[componentPath];

  if (!Component) {
    console.error(
      `找不到 Client Component: ${id} (路径: ${componentPath})`,
      '\n可用组件:', Object.keys(componentRegistry)
    );
    return createElement(
      'div',
      { style: { color: 'red', padding: '1rem', border: '1px solid red' } },
      `[错误: 找不到组件 ${id}]`
    );
  }

  // 实例化 Client Component
  return createElement(Component, props);
}

/**
 * 从 URL 加载 RSC Payload
 *
 * 用于从服务器获取 rsc.json
 */
export async function fetchRSCPayload(url: string): Promise<RSCPayload> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`加载 RSC payload 失败: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    return payload as RSCPayload;
  } catch (error) {
    console.error('加载 RSC payload 出错:', error);
    throw error;
  }
}

/**
 * 辅助函数：创建 Client Component 注册表
 *
 * 将导入的组件模块转换为注册表格式
 *
 * @example
 * const registry = createComponentRegistry({
 *   'Counter_0': Counter,
 *   'src/components/Counter.client.tsx': Counter,
 * });
 */
export function createComponentRegistry(
  components: Record<string, React.ComponentType<any>>
): ComponentRegistry {
  return components;
}
