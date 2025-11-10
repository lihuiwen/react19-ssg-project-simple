/**
 * RSC Payload 转 HTML
 *
 * Phase 2.5: 从 RSC payload 生成初始 HTML
 * 用于 SEO 和快速首屏，即使页面包含异步组件也能正常工作
 */

import type { RSCNode, RSCPayload } from './rsc-types';
import { isRSCElement, isRSCText, isRSCClientPlaceholder, isRSCFragment } from './rsc-types';

/**
 * 将 RSC Payload 转换为 HTML 字符串
 *
 * Phase 2.5: 支持异步组件的 HTML 生成
 * - 从序列化的 RSC payload 重建 HTML
 * - Client Components 渲染为占位符（将在客户端 hydrate）
 */
export function rscPayloadToHTML(payload: RSCPayload): string {
  const htmlFragments = payload.tree.map(node => nodeToHTML(node));
  return htmlFragments.join('');
}

/**
 * 将单个 RSC 节点转换为 HTML
 */
function nodeToHTML(node: RSCNode): string {
  // 文本节点
  if (isRSCText(node)) {
    return escapeHTML(node.content);
  }

  // Fragment
  if (isRSCFragment(node)) {
    return node.children.map(child => nodeToHTML(child)).join('');
  }

  // HTML 元素
  if (isRSCElement(node)) {
    return elementToHTML(node);
  }

  // Client Component 占位符
  // 在初始 HTML 中，我们渲染一个空的占位符
  // 客户端 hydration 时会填充实际内容
  if (isRSCClientPlaceholder(node)) {
    return `<div data-rsc-placeholder="${escapeHTML(node.id)}"></div>`;
  }

  return '';
}

/**
 * 将 RSC Element 转换为 HTML
 */
function elementToHTML(element: any): string {
  const { tag, props, children } = element;

  // 自闭合标签
  const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
  const isSelfClosing = selfClosingTags.includes(tag);

  // 生成属性字符串
  const attrsString = propsToAttributes(props);

  // 生成子元素 HTML
  const childrenHTML = children.map((child: RSCNode) => nodeToHTML(child)).join('');

  // 组合
  if (isSelfClosing) {
    return `<${tag}${attrsString} />`;
  }

  return `<${tag}${attrsString}>${childrenHTML}</${tag}>`;
}

/**
 * 将 props 转换为 HTML 属性
 */
function propsToAttributes(props: Record<string, any>): string {
  if (!props || typeof props !== 'object') {
    return '';
  }

  const attrs: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    // 跳过特殊属性
    if (key === 'children' || key === 'key' || key === 'ref' || key === 'dangerouslySetInnerHTML') {
      continue;
    }

    // 处理 style 对象
    if (key === 'style' && typeof value === 'object') {
      const styleString = styleObjectToString(value);
      if (styleString) {
        attrs.push(`style="${escapeHTML(styleString)}"`);
      }
      continue;
    }

    // 处理布尔属性
    if (typeof value === 'boolean') {
      if (value) {
        attrs.push(key);
      }
      continue;
    }

    // 处理 className → class
    if (key === 'className') {
      attrs.push(`class="${escapeHTML(String(value))}"`);
      continue;
    }

    // 处理其他属性
    if (value != null) {
      attrs.push(`${key}="${escapeHTML(String(value))}"`);
    }
  }

  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

/**
 * 将 style 对象转换为 CSS 字符串
 */
function styleObjectToString(style: Record<string, any>): string {
  const cssProps: string[] = [];

  for (const [key, value] of Object.entries(style)) {
    if (value != null) {
      // 将 camelCase 转换为 kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssProps.push(`${cssKey}: ${value}`);
    }
  }

  return cssProps.join('; ');
}

/**
 * HTML 转义
 */
function escapeHTML(str: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return str.replace(/[&<>"']/g, char => htmlEscapeMap[char] || char);
}
