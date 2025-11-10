/**
 * RSC 客户端入口
 *
 * Phase 2: 使用 RSC payload 重建组件树并进行 hydration
 *
 * 工作流程：
 * 1. 加载 rsc.json（RSC payload）
 * 2. 注册所有 Client Components
 * 3. 从 payload 重建 React 元素树
 * 4. 只对 Client Components 进行 hydration
 *
 * vs Phase 1 客户端：
 * - Phase 1: 直接导入页面组件，hydrate 整个树
 * - Phase 2: 从 RSC payload 重建树，只包含 Client Components
 */

import { hydrateRoot } from 'react-dom/client';
import {
  deserializeFromRSC,
  createComponentRegistry,
  fetchRSCPayload,
} from '../lib/rsc-deserializer';

// 导入所有 Client Components
// Phase 2.5: 支持多个 Client Components
import Counter from '../components/Counter.client';
import InteractiveCard from '../components/InteractiveCard.client';

/**
 * 初始化 RSC 客户端
 *
 * Phase 2.5 Update: 支持多个 Client Components 和嵌套
 */
async function initRSCClient() {
  console.log('🚀 RSC Client 启动 (Phase 2.5)...');

  try {
    // 1. 创建 Client Component 注册表
    // Phase 2.5: 注册所有 Client Components（包括嵌套的）
    const componentRegistry = createComponentRegistry({
      // Counter 组件
      'Counter_0': Counter,
      'Counter_1': Counter,  // Phase 2.5: 支持多个实例
      'Counter_2': Counter,
      'src/components/Counter.client.tsx': Counter,

      // Phase 2.5: InteractiveCard 组件
      'InteractiveCard_0': InteractiveCard,
      'InteractiveCard_1': InteractiveCard,
      'src/components/InteractiveCard.client.tsx': InteractiveCard,
    });

    console.log('📦 Client Components 已注册:', Object.keys(componentRegistry));

    // 2. 加载 RSC Payload
    // 在构建时，rsc.json 会被生成到 dist/ 目录
    const payload = await fetchRSCPayload('/rsc.json');
    console.log('📥 RSC Payload 已加载:', {
      version: payload.version,
      nodeCount: payload.tree.length,
      clientComponents: Object.keys(payload.clientComponents),
    });

    // 3. 从 payload 重建组件树
    const tree = deserializeFromRSC(payload, componentRegistry);
    console.log('🌳 组件树已重建');

    // 4. Hydrate 到 DOM
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('找不到 #root 元素');
    }

    console.log('💧 开始 hydration...');
    hydrateRoot(rootElement, tree);
    console.log('✨ Hydration 完成！RSC 客户端已就绪');

  } catch (error) {
    console.error('❌ RSC 客户端初始化失败:', error);

    // 显示错误信息
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="color: red; padding: 2rem; border: 2px solid red; margin: 2rem;">
          <h2>⚠️ RSC 客户端加载失败</h2>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
          <p>请检查浏览器控制台获取详细错误信息。</p>
        </div>
      `;
    }
  }
}

// 浏览器环境下自动初始化
if (typeof window !== 'undefined') {
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRSCClient);
  } else {
    initRSCClient();
  }
}
