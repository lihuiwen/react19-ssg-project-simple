/**
 * Interactive Card - Client Component
 *
 * Phase 2.5: 支持嵌套 Client Components
 * 这个组件可以包含其他 Client Components
 */

"use client";

import { useState } from 'react';

// 标记组件路径（用于 RSC 序列化器识别）
InteractiveCard.__componentPath = 'src/components/InteractiveCard.client.tsx';

export default function InteractiveCard({
  title = 'Interactive Card',
  children
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      marginTop: '2rem',
      border: '2px solid #8b5cf6',
      borderRadius: '0.5rem',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: '#8b5cf6',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.125rem',
          fontWeight: 'bold',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>🎴 {title}</span>
        <span style={{ fontSize: '1.5rem' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f5f3ff',
        }}>
          {children || (
            <p style={{ margin: 0, color: '#5b21b6' }}>
              This is an interactive client component!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
