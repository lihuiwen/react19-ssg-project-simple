/**
 * Homepage Component
 *
 * This component demonstrates the hybrid rendering approach:
 * 1. Rendered to static HTML at build time (SSG)
 * 2. Hydrated in the browser to become interactive
 *
 * It contains both:
 * - Server Component parts (this file, no "use client")
 * - Client Component parts (Counter, with "use client")
 */

import Counter from '../components/Counter.client';

export default function Home() {
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <h1 style={{ color: '#2563eb' }}>
        🚀 Hello from React 19 SSG!
      </h1>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.75' }}>
        This page was generated at build time using Static Site Generation (SSG).
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>
          ✅ What's working:
        </h2>
        <ul>
          <li>React 19 RC Server-Side Rendering</li>
          <li>TypeScript Support</li>
          <li>Static HTML Generation</li>
          <li>✨ Client-Side Hydration (NEW!)</li>
          <li>✨ Interactive Components (NEW!)</li>
        </ul>
      </div>

      {/* Client Component - will be hydrated in browser */}
      <Counter />

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#dcfce7',
        borderRadius: '0.5rem',
        borderLeft: '4px solid #10b981'
      }}>
        <p style={{ margin: 0 }}>
          <strong>📌 Current Phase:</strong> MVP-Phase 1 - Client Islands + Hydration
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
          The page is now interactive! Open browser console to see hydration logs.
        </p>
      </div>
    </div>
  );
}
