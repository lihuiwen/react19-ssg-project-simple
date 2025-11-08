# Changelog

All notable changes to this project will be documented in this file.

## [Phase 1] - 2025-11-08

### ✨ Added - Client Islands + Hydration

#### New Features
- **Client-side Hydration**: Implemented `hydrateRoot()` to make server-rendered HTML interactive
- **Interactive Components**: Created `Counter.client.tsx` with `"use client"` directive
- **Webpack Bundling**: Added Webpack 5 configuration for client-side JavaScript
- **Dual-entry Build System**: Separate build steps for client bundle and HTML generation
- **Local Development Server**: Added `serve` for preview (`pnpm preview`)

#### New Files
- `src/components/Counter.client.tsx` - Interactive counter component
- `src/entries/client.tsx` - Client-side hydration entry point
- `webpack.config.cjs` - Webpack configuration for client bundling
- `CHANGELOG.md` - This file

#### Modified Files
- `src/pages/index.tsx` - Updated to include Counter component
- `src/lib/builder.ts` - Added client script injection in HTML template
- `package.json` - Added new build commands and `serve` dependency

#### Build Output
- `dist/index.html`: 2.6KB (server-rendered with Counter)
- `dist/assets/client.js`: 1.0MB (development mode, uncompressed)
- `dist/assets/client.js.map`: 1.2MB (source map)

#### Performance
- Webpack build time: ~3.6s
- SSG HTML generation: ~32ms
- Total build time: ~3.7s

#### Technical Achievements
- ✅ Server-side rendering working (SEO-friendly HTML)
- ✅ Client-side hydration working (interactive components)
- ✅ Clear separation of Server and Client components
- ✅ Browser console shows hydration logs
- ✅ Counter state updates in real-time

### 🔧 Changed
- Renamed `webpack.config.js` to `webpack.config.cjs` for ES module compatibility
- Updated build commands to support dual-entry system:
  - `pnpm build:client` - Webpack client bundle
  - `pnpm build:html` - SSG HTML generation
  - `pnpm build` - Full build (both)

### 📚 Documentation
- Updated README.md with Phase 1 instructions
- Updated docs/Roadmap.md marking Phase 1 as completed
- Updated CLAUDE.md with current project status

---

## [Phase 0] - 2025-11-08

### ✨ Initial Release - Minimum SSG System

#### Features
- **Server-Side Rendering**: React 19 RC `renderToString()` implementation
- **Static HTML Generation**: Build-time rendering to `dist/` directory
- **TypeScript Support**: Full TypeScript configuration
- **Route Configuration**: Simple route system via `routes.config.ts`

#### Files Created
- `src/pages/index.tsx` - Homepage component
- `src/lib/builder.ts` - Core SSG build script (~130 lines)
- `src/routes.config.ts` - Route definitions
- `tsconfig.json` - TypeScript configuration
- `README.md` - Project documentation
- `CLAUDE.md` - AI assistant guide
- `docs/Roadmap.md` - Complete implementation roadmap

#### Build Output
- `dist/index.html`: 1.6KB (static HTML)

#### Performance
- Build time: ~47ms
- Zero client-side JavaScript

#### Technical Achievements
- ✅ Pure SSG without client-side JS
- ✅ SEO-friendly static HTML
- ✅ Fast build times
- ✅ Simple and understandable codebase

---

## Next Up

### [Phase 2] - Simplified RSC (Planned)
- Implement simplified React Server Components
- Serialize server component tree to JSON
- Client-side reconstruction of component tree
- Reduce client JS bundle size

### [Phase 3-4] - ISR & SSR (Future)
- Incremental Static Regeneration
- Server-Side Rendering for dynamic routes
- Full production deployment setup
