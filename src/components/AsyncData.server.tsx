/**
 * Async Server Component - Phase 2.5 示例
 *
 * 这个组件演示了异步 Server Components 的能力：
 * - 可以使用 async/await
 * - 可以进行数据获取（模拟）
 * - 在构建时执行，不发送到客户端
 */

// 模拟异步数据获取
async function fetchBuildInfo() {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    timestamp: new Date().toISOString(),
    phase: 'Phase 2.5 - Enhanced RSC',
    features: [
      'Async Server Components ✅',
      'Fragment Support ✅',
      'Nested Client Components ✅',
    ],
  };
}

export default async function AsyncData() {
  // Phase 2.5: Server Component 可以使用 async/await
  const buildInfo = await fetchBuildInfo();

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: '#eff6ff',
      borderRadius: '0.5rem',
      borderLeft: '4px solid #3b82f6'
    }}>
      <h2 style={{ fontSize: '1.25rem', marginTop: 0, color: '#1e40af' }}>
        ⚡ Async Server Component
      </h2>
      <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>
        <p><strong>Build Time:</strong> {buildInfo.timestamp}</p>
        <p><strong>Current Phase:</strong> {buildInfo.phase}</p>
        <p><strong>New Features:</strong></p>
        <ul>
          {buildInfo.features.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
        <p style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#dbeafe',
          borderRadius: '0.25rem',
          fontSize: '0.8125rem'
        }}>
          💡 <strong>Note:</strong> This component was executed at build time using async/await.
          The data was fetched and serialized into the RSC payload.
        </p>
      </div>
    </div>
  );
}
