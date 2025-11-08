"use client";

/**
 * Counter Client Component
 *
 * This component demonstrates client-side interactivity.
 * The "use client" directive marks this as a Client Component,
 * meaning it will be hydrated in the browser and can use hooks like useState.
 *
 * Phase 2: RSC 序列化器会识别这个组件为 Client Component
 * 并创建占位符，而不是在服务端执行它
 */

import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: '#eff6ff',
      borderRadius: '0.5rem',
      border: '2px solid #3b82f6'
    }}>
      <h3 style={{ marginTop: 0, color: '#1e40af' }}>
        🎮 Interactive Counter
      </h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '1rem'
      }}>
        <button
          onClick={() => setCount(count - 1)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          -
        </button>

        <span style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1e40af',
          minWidth: '4rem',
          textAlign: 'center'
        }}>
          {count}
        </span>

        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          +
        </button>
      </div>

      <p style={{
        marginTop: '1rem',
        marginBottom: 0,
        fontSize: '0.875rem',
        color: '#64748b'
      }}>
        {count === 0
          ? '👆 Click the buttons to test client-side interactivity!'
          : '✨ Hydration is working! This is running in your browser.'}
      </p>
    </div>
  );
}

// 为 RSC 序列化器添加组件路径标记
(Counter as any).__componentPath = 'src/components/Counter.client.tsx';

export default Counter;
