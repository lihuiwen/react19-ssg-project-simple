/**
 * Homepage Component - Phase 2.5 Enhanced
 *
 * This component demonstrates the enhanced RSC features:
 * 1. Server Components with async/await
 * 2. Fragment support
 * 3. Nested Client Components
 * 4. Rendered to static HTML at build time (SSG)
 * 5. Hydrated in the browser to become interactive
 */

import Counter from '../components/Counter.client';
import AsyncData from '../components/AsyncData.server';
import FragmentList from '../components/FragmentList';
import InteractiveCard from '../components/InteractiveCard.client';

export default function Home() {
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <h1 style={{ color: '#2563eb' }}>
        🚀 React 19 SSG - Phase 2.5
      </h1>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.75' }}>
        This page demonstrates <strong>Phase 2.5: Enhanced RSC</strong> with async Server Components,
        Fragment support, and nested Client Components.
      </p>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>
          ✅ Phase 2.5 Features:
        </h2>
        <ul>
          <li>⚡ Async Server Components (build-time async/await)</li>
          <li>🧩 Fragment Support (React.Fragment and {"<>...</>"})</li>
          <li>🪆 Nested Client Components</li>
          <li>📦 Optimized RSC Payload</li>
          <li>✨ Selective Hydration</li>
        </ul>
      </div>

      {/* Phase 2.5: Async Server Component */}
      <AsyncData />

      {/* Phase 2.5: Fragment Demo */}
      <FragmentList />

      {/* Original Counter Component */}
      <Counter />

      {/* Phase 2.5: Nested Client Components Demo */}
      <InteractiveCard title="Nested Client Component Demo">
        <p style={{ color: '#5b21b6', marginBottom: '1rem' }}>
          This InteractiveCard is a Client Component that can contain other components.
        </p>

        {/* Nesting another Client Component */}
        <Counter />

        <p style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#ede9fe',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          color: '#5b21b6'
        }}>
          💡 The Counter above is <strong>nested inside</strong> the InteractiveCard Client Component!
        </p>
      </InteractiveCard>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#dcfce7',
        borderRadius: '0.5rem',
        borderLeft: '4px solid #10b981'
      }}>
        <p style={{ margin: 0 }}>
          <strong>📌 Current Phase:</strong> Phase 2.5 - Enhanced RSC
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
          Open browser console to see RSC logs. Check Network tab for rsc.json payload.
        </p>
      </div>
    </div>
  );
}
