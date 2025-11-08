/**
 * Client Entry Point
 *
 * This file runs in the browser and is responsible for "hydrating" the
 * server-rendered HTML, making it interactive.
 *
 * Hydration process:
 * 1. Browser loads the static HTML (rendered by server)
 * 2. Browser downloads and executes this script
 * 3. React attaches event listeners to the existing DOM
 * 4. The page becomes interactive!
 *
 * Key difference from createRoot:
 * - createRoot: Creates a new React root (blank page → React app)
 * - hydrateRoot: Attaches to existing HTML (server HTML → interactive app)
 */

import { hydrateRoot } from 'react-dom/client';
import HomePage from '../pages/index';

// Wait for DOM to be ready
if (typeof window !== 'undefined') {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found! Make sure your HTML has <div id="root">');
  }

  console.log('🎯 Starting client-side hydration...');

  // Hydrate the server-rendered HTML
  hydrateRoot(rootElement, <HomePage />);

  console.log('✨ Hydration complete! The page is now interactive.');
}
