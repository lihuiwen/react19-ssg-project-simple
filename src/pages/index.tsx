/**
 * Homepage Component
 *
 * This is a simple React component that will be rendered to static HTML
 * during the build process using React's renderToString.
 */

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
          <li>No JavaScript in Browser (yet!)</li>
        </ul>
      </div>
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#fef3c7',
        borderRadius: '0.5rem',
        borderLeft: '4px solid #f59e0b'
      }}>
        <p style={{ margin: 0 }}>
          <strong>📌 Current Phase:</strong> MVP-Phase 0 - Minimal SSG System
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
          Next up: Phase 1 will add client-side hydration for interactivity!
        </p>
      </div>
    </div>
  );
}
