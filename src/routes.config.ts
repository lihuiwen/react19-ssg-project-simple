/**
 * Route Configuration for SSG
 *
 * Each route defines:
 * - path: output file path (e.g., 'index' -> dist/index.html)
 * - component: component name in src/pages/ directory
 */

export interface Route {
  path: string;
  component: string;
}

const routes: Route[] = [
  {
    path: 'index',
    component: 'index',
  },
  // Add more routes here as needed
  // { path: 'about', component: 'about' },
];

export default routes;
