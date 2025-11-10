/**
 * Fragment 示例组件 - Phase 2.5
 *
 * 演示 Fragment 的使用（React.Fragment 和 <>...</>）
 */

import { Fragment } from 'react';

export default function FragmentList() {
  const items = [
    { id: 1, title: 'Async Server Components', emoji: '⚡' },
    { id: 2, title: 'Fragment Support', emoji: '🧩' },
    { id: 3, title: 'Nested Client Components', emoji: '🪆' },
  ];

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: '#fef3c7',
      borderRadius: '0.5rem',
    }}>
      <h2 style={{ fontSize: '1.25rem', marginTop: 0, color: '#92400e' }}>
        🧩 Fragment Demo
      </h2>

      <div style={{ marginTop: '1rem' }}>
        {/* 使用 Fragment 避免额外的 DOM 节点 */}
        {items.map(item => (
          <Fragment key={item.id}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
              {item.emoji}
            </span>
            <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>
              {item.title}
            </span>
            {item.id < items.length && (
              <span style={{ color: '#92400e', margin: '0 0.5rem' }}>•</span>
            )}
          </Fragment>
        ))}
      </div>

      {/* 使用简写语法 <>...</> */}
      <>
        <p style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fde68a',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          color: '#78350f'
        }}>
          💡 This list uses Fragments to avoid extra DOM wrappers.
          Check the HTML to see clean markup!
        </p>
      </>
    </div>
  );
}
