# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React 19 progressive rendering architecture project implementing a phased evolution: **SSG → RSC → ISR → SSR**. The goal is to build a production-ready, evolvable frontend rendering system with gradual capability enhancement while maintaining observability, rollback capability, and performance at each stage.

## Project Status

**MVP-Phase 2.5: ✅ COMPLETED** - Enhanced RSC with async, Fragment, and nested components!

**Current State:**
- ✅ Static HTML generation (`pnpm build` → `dist/index.html`)
- ✅ React 19 RC server-side rendering (from RSC payload)
- ✅ Client-side hydration (`hydrateRoot`)
- ✅ Interactive components with `"use client"`
- ✅ Webpack client bundling (~1MB dev mode)
- ✅ Dual-entry build system (server + client)
- ✅ Local development server (`pnpm preview`)
- ✅ **RSC component tree serialization** (Phase 2)
- ✅ **Server/Client component separation** (Phase 2)
- ✅ **RSC Payload generation (rsc.json)** (Phase 2)
- ✅ **Client-side tree reconstruction** (Phase 2)
- ✅ **Selective hydration** (Phase 2)
- ✅ **Async Server Components** ⬅️ Phase 2.5 NEW!
- ✅ **Fragment support (React.Fragment / <>...</>)** ⬅️ Phase 2.5 NEW!
- ✅ **Nested Client Components** ⬅️ Phase 2.5 NEW!
- ✅ **RSC Payload to HTML conversion** ⬅️ Phase 2.5 NEW!
- ✅ TypeScript configuration
- ✅ Route configuration system

**Build Output:**
- HTML: 3.7KB (generated from RSC payload)
- RSC Payload: 21KB (rsc.json - complete component tree with async data)
- Client JS: 1.0MB (dev mode, only Client Components)
- Build time: ~149ms (HTML generation only, webpack ~4.8s)

**Key Achievements:**
- ✅ Server Component code NOT in client bundle
- ✅ Only Client Components bundled to browser
- ✅ Component tree transmitted via JSON
- ✅ Async Server Components execute at build time
- ✅ Fragment nodes serialized without extra DOM
- ✅ Client Components can contain other Client Components

**Next Phase:** Optional - Phase 3 (ISR) / Phase 4 (SSR) or transition to Next.js

Following the **MVP Learning Path** - Phase 2.5 completed! Understanding 80%+ of RSC core concepts.

## Tech Stack (MVP)

- **Build Tool**: Webpack 5
- **React**: React 19 (RC)
- **TypeScript**: 5.x
- **Runtime**: Node.js 18+
- **Package Manager**: pnpm

## Learning Paths

This project supports two development paths:

1. **MVP Learning Path** (✅ Completed through Phase 2.5) - Simplified implementation for learning:
   - MVP-Phase 0: Minimal SSG (local filesystem, no CDN) ✅
   - MVP-Phase 1: Client islands + Hydration ✅
   - MVP-Phase 2: Simplified RSC implementation ✅
   - MVP-Phase 2.5: Enhanced RSC (async, Fragment, nested) ✅
   - MVP-Phase 3-4: ISR/SSR (Optional)

2. **Production Path** - Full production-ready implementation:
   - Phase 0-4 with CDN, S3, monitoring, etc.
   - See full roadmap in `docs/Roadmap.md`

## Architecture Phases

### Phase 0: Foundation (Current)
- Establish evolvable baseline architecture
- Define core abstractions: `fetchPageData(params)`, `render(url, data)`, `routes.config.ts`
- Set up build output structure: `dist/pages/**/index.html`, `dist/assets/**`, `dist/manifests/`

### Phase 1: Pure SSG + Client Hydration (✅ Completed)
- Full static site generation with server-side rendering
- Client-side islands with `use client` for interactivity
- Webpack bundling for client JavaScript
- Hydration using `hydrateRoot()` for interactive components
- Local development server for testing
- Achieved: Working Counter component with real-time state updates

### Phase 2: RSC Integration (Build-time React Server Components) (✅ Completed)
- ✅ Implemented simplified RSC with component tree serialization
- ✅ Created RSC type system (`rsc-types.ts`)
- ✅ Built RSC serializer (`rsc-serializer.ts`)
- ✅ Built RSC deserializer (`rsc-deserializer.ts`)
- ✅ Generated `rsc.json` (RSC Payload format)
- ✅ Server Component code excluded from client bundle
- ✅ Only Client Components packaged to browser
- ✅ Selective hydration - only hydrate Client Components
- Achieved: Complete Server/Client component separation at build time

### Phase 2.5: Enhanced RSC (Build-time Async + Advanced Features) (✅ Completed)
- ✅ Async Server Components support (build-time async/await)
- ✅ Fragment support (React.Fragment and `<>...</>`)
- ✅ Nested Client Components support
- ✅ RSC Payload to HTML conversion (`rsc-to-html.ts`)
- ✅ Complete async serialization chain
- ✅ Example components: AsyncData.server, FragmentList, InteractiveCard.client
- Achieved: 80%+ of RSC core concepts implemented and understood

### Phase 3: ISR (Incremental Static Regeneration)
- Support content updates via stale-while-revalidate (SWR) or webhook triggers
- Background regeneration: `fetchPageData + renderRSC()` → atomic S3 replacement
- Route-level concurrency locks to prevent regeneration storms
- Target: Update latency ≤ 60s (webhook mode), failure rate < 1%

### Phase 4: Hybrid SSR
- Add server-side rendering for real-time routes (`/dashboard/**`, `/checkout/**`, `/api/**`)
- Dual build outputs: `dist/static` (SSG+RSC+ISR) and `dist/server` (SSR runtime)
- CDN routing: static paths → S3, dynamic paths → SSR origin
- Target: SSR TTFB ≤ 500ms, static hit rate ≥ 95%

## Development Commands

### Package Management
```bash
pnpm install              # Install dependencies
```

### Build Commands (MVP Phase 2 - Current)
```bash
pnpm build                # Full build: webpack RSC client + RSC payload + HTML
pnpm build:client         # Build only RSC client JS → dist/assets/client-rsc.js
pnpm build:html           # Build only HTML + rsc.json → dist/
pnpm clean                # Clean dist directory
pnpm rebuild              # Clean + full build
```

### Development & Preview (Phase 2)
```bash
pnpm preview              # Start local server at http://localhost:3000
                          # Required to test RSC (loads client-rsc.js + rsc.json)
```

### Build Commands (Future - Production)
```bash
pnpm build:static         # Build static SSG output → dist/static (Phase 3+)
pnpm build:ssr            # Build SSR runtime → dist/server (Phase 4)
pnpm dev                  # Hot-reload dev server (To be implemented)
```

### Testing (To be implemented)
```bash
pnpm test                 # Run tests
pnpm test:watch           # Run tests in watch mode
pnpm lint                 # Lint code
```

## Core Architecture Patterns

### Rendering Boundaries
- **Default**: All components are Server Components
- **Client components**: Only for interactivity, mark with `"use client"`
- **Pattern**: Keep data fetching and templating in Server Components, move only event handlers and state to client

### Data Fetching Abstraction
```typescript
// Pure function, reusable across build/regeneration/SSR
fetchPageData(params: Record<string, string>): Promise<PageData>
```

### Rendering Interface
```typescript
// Unified interface, can be replaced with RSC implementation later
render(url: string, data: PageData): Promise<string>
```

### Route Configuration
```typescript
// routes.config.ts - Define routing patterns and regeneration strategy
export const rules = [
  { pattern: '/', mode: 'static', revalidate: 300 },
  { pattern: '/blog/[slug]', mode: 'static', revalidate: 600 },
  { pattern: '/dashboard/**', mode: 'ssr' },      // Phase 4
  { pattern: '/api/**', mode: 'ssr' },            // Phase 4
];
```

## MVP Project Structure (Phase 0)

```
react19-ssg-project-simple/
├── src/
│   ├── pages/                    # Page components
│   │   └── index.tsx             # Homepage
│   ├── components/               # Shared components (Phase 1+)
│   │   └── Counter.client.tsx    # Client component example
│   ├── lib/
│   │   └── builder.ts            # Core SSG build script (50-100 lines)
│   ├── entries/                  # Build entries (Phase 1+)
│   │   ├── server.tsx            # Server-side render entry
│   │   └── client.tsx            # Client hydration entry
│   └── routes.config.ts          # Route definitions
├── dist/                         # Build output (git ignored)
│   ├── index.html                # Generated static pages
│   └── assets/                   # Bundled JS/CSS (Phase 1+)
├── webpack.config.js             # Webpack configuration
├── tsconfig.json                 # TypeScript config
├── package.json
└── docs/
    └── Roadmap.md                # Full implementation roadmap
```

## Build Output Structure (Production)

```
dist/
  pages/              # Static HTML pages
    index.html
    blog/
      [slug]/
        index.html
  assets/             # Fingerprinted static assets
    js/
    css/
    images/
  manifests/          # Build manifests
    client.json       # Client bundle manifest
    rsc.json          # RSC manifest (Phase 2+)
  manifest.json       # Main manifest
```

## Caching Strategy

### Phase 1 (SSG)
- HTML: `Cache-Control: public, s-maxage=86400, max-age=0`
- JS/CSS/Images: `Cache-Control: public, max-age=31536000, immutable`

### Phase 3 (ISR)
- HTML: `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`
- Assets: Same as Phase 1

### Phase 4 (SSR routes)
- Dynamic HTML: `Cache-Control: no-store` or short s-maxage
- Static assets: Same as Phase 1

## MVP Implementation Guide

### MVP-Phase 0: Core Build Script

The heart of the SSG system is `src/lib/builder.ts`:

```typescript
// Simplified structure (50-100 lines)
import { renderToString } from 'react-dom/server';
import fs from 'fs';
import path from 'path';

export async function build() {
  // 1. Read route config
  const routes = await import('../routes.config');

  // 2. For each route:
  for (const route of routes.default) {
    // 3. Import page component
    const Page = await import(`../pages/${route.path}`);

    // 4. Render to HTML string
    const html = renderToString(<Page.default />);

    // 5. Wrap in HTML template
    const fullHtml = createHTMLTemplate(html);

    // 6. Write to dist/
    fs.writeFileSync(`dist/${route.path}.html`, fullHtml);
  }
}

function createHTMLTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
  <head><title>SSG Page</title></head>
  <body><div id="root">${content}</div></body>
</html>`;
}
```

**Key concepts:**
- **Build-time rendering**: `renderToString()` runs during build, not in browser
- **Static output**: Each route produces an `.html` file
- **No server needed**: Generated HTML can be opened directly or served statically

### MVP-Phase 1: Adding Hydration

Two-step process:

1. **Server-side** (build time):
   - Render full page with `renderToString()`
   - Include `<script src="/assets/client.js"></script>` in HTML

2. **Client-side** (browser):
   ```typescript
   // src/entries/client.tsx
   import { hydrateRoot } from 'react-dom/client';
   import App from '../pages/index';

   hydrateRoot(document.getElementById('root')!, <App />);
   ```

**Webpack config** needs two targets:
- `target: 'node'` for build script
- `target: 'web'` for client bundle

### MVP-Phase 2: Simplified RSC

**Core idea**: Separate component tree into two layers:

1. **Server Components** (build time):
   - Can use `async/await`
   - Can access filesystem, databases
   - Code NOT sent to browser

2. **Client Components** (browser):
   - Marked with `"use client"`
   - Handle interactivity
   - Code sent to browser

**Implementation approach**:
- Analyze component imports to detect `"use client"`
- Execute Server Components, serialize their output to JSON
- Send JSON + Client Component code to browser
- Browser reconstructs the tree

## Key Implementation Notes

### Server Components (Phase 2)
- Migrate in priority order:
  1. Markdown/documentation rendering
  2. Content aggregation pages (lists, directories, recommendations)
  3. Multi-language template assembly
- Browser-only libraries must stay in client components

### ISR Triggers (Phase 3)
1. **SWR**: Automatic background regeneration on cache expiry
2. **Webhook**: CMS/DB updates → event queue → regeneration worker
- Implement route-level locks to prevent concurrent regeneration
- Atomic file replacement with validation before switching versions

### CDN Routing (Phase 4)
| Path           | Origin      | Cache Policy | Purpose               |
|----------------|-------------|--------------|----------------------|
| `/api/*`       | SSR runtime | no-store     | APIs/Server Actions  |
| `/dashboard/*` | SSR runtime | no-store     | Login/Dashboard      |
| `/checkout/*`  | SSR runtime | no-store     | Checkout flow        |
| `/*`           | S3 static   | s-maxage=300 | Default static pages |

## Auto-generated Files

The following files are auto-generated and should not be manually edited:
- `src/runtime/server/page-loader.generated.ts` (regenerated on every build by webpack plugins)

## Performance Targets

### Phase 1 (SSG)
- Lighthouse Performance: ≥ 95
- CDN hit rate: ≥ 95%
- Average TTFB: < 100ms

### Phase 2 (RSC)
- JS bundle reduction: ≥ 30%
- Hydration time improvement: ≥ 40%

### Phase 3 (ISR)
- Update latency (webhook): ≤ 60s
- Regeneration failure rate: < 1%

### Phase 4 (SSR)
- SSR route TTFB: ≤ 500ms
- Static hit rate: ≥ 95%
- Dynamic error rate: < 0.5%

## Important Constraints

1. **Evolvability**: Every phase must be independently deployable, observable, and rollbackable
2. **Pure functions**: `fetchPageData()` must be stateless, re-entrant, and cacheable
3. **Progressive enhancement**: Start simple (SSG), add complexity only when needed
4. **Monitoring**: Each phase requires metrics: TTFB, cache hit rate, regeneration queue, error rates
5. **Security**: Secrets only in build/regeneration/SSR environments, never in client bundles

## File Organization Conventions

When implementing:
- Server Components: Default export without `"use client"` directive
- Client Components: Mark with `"use client"` at the top, typically in `*.client.tsx` files
- Route definitions: Centralize in `routes.config.ts`
- Data fetching: Pure functions in dedicated `data/` or `lib/` directory
- Rendering logic: Separate from data fetching for testability

## Deployment Strategy

### Static (Phase 1-3)
1. Build: `pnpm build:static` → `dist/static`
2. Upload to S3/R2 with versioning enabled
3. Invalidate CDN cache
4. Monitor CDN hit rate and TTFB

### Hybrid (Phase 4)
1. Build static: `pnpm build:static` → `dist/static`
2. Build SSR: `pnpm build:ssr` → `dist/server`
3. Deploy static to S3/R2
4. Deploy SSR runtime to Lambda/Workers/Node server
5. Configure CDN routing rules
6. Blue-green or canary deployment for SSR

## Rollback Procedures

- **Static**: S3 object version rollback + CDN invalidation
- **SSR**: Blue-green deployment switch or weighted traffic shift
- **Regeneration**: Disable webhook triggers, revert to static cache

## MVP Quick Start (30 minutes)

Follow these steps to get your first static page working:

### Step 1: Install Dependencies (5 min)
```bash
pnpm add react@rc react-dom@rc
pnpm add -D webpack webpack-cli html-webpack-plugin
pnpm add -D @types/react @types/react-dom @types/node
pnpm add -D typescript tsx ts-loader
```

### Step 2: Create Basic Files (10 min)

**`src/routes.config.ts`**:
```typescript
export default [
  { path: 'index', component: 'index' },
];
```

**`src/pages/index.tsx`**:
```typescript
export default function Home() {
  return <h1>Hello SSG!</h1>;
}
```

**`tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Step 3: Create Build Script (10 min)

**`src/lib/builder.ts`**: See MVP Implementation Guide above for code example

### Step 4: Add Build Command (2 min)

In `package.json`:
```json
{
  "scripts": {
    "build": "tsx src/lib/builder.ts"
  }
}
```

### Step 5: Build & Verify (3 min)
```bash
pnpm build
open dist/index.html  # Should see "Hello SSG!"
```

**Success criteria:**
- `dist/index.html` exists
- Opening it in browser shows your React component's output
- Viewing page source shows the HTML (not blank until JS loads)

## Webpack Configuration Notes

For MVP-Phase 1 (hydration), you'll need:

**Dual entry points**:
```javascript
module.exports = [
  {
    name: 'client',
    target: 'web',
    entry: './src/entries/client.tsx',
    output: { path: 'dist/assets', filename: 'client.js' }
  },
  {
    name: 'server',
    target: 'node',
    // Used by build script, not a direct webpack output
  }
];
```

**Key loaders**:
- `ts-loader`: TypeScript compilation
- `babel-loader` (optional): For JSX transformation if not using `tsx`

## Common Pitfalls

1. **Import errors in Node.js**: Make sure `tsconfig.json` has `"module": "ESNext"` and use `.tsx` extension
2. **React hydration mismatch**: Server and client must render identical HTML
3. **Missing dependencies**: Don't forget `@types/*` packages for TypeScript
4. **Webpack target confusion**: Build scripts need `target: 'node'`, client bundles need `target: 'web'`

## Reference Documentation

See `docs/Roadmap.md` for:
- **MVP Learning Path**: Detailed phase-by-phase guide with code structure
- **Production Roadmap**: Full implementation with CDN, S3, monitoring
- **Quick Start Checklist**: Step-by-step setup instructions
- Infrastructure setup (IaC, CI/CD, secrets management)
- Observability and alerting
- Security and compliance
- Performance and frontend quality
- SEO, accessibility, and internationalization
