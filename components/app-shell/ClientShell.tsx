'use client';

// Client-side shell that lazy-loads heavy designer components so they are NOT
// bundled into the critical app/layout.js chunk (which caused chunk-load timeouts).
// `ssr: false` is only valid inside a Client Component, so this wrapper exists
// purely to host those dynamic() calls.

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const RouterBinder = dynamic(() => import('#/components/system/RouterBinder'), {
  ssr: false,
});
const DefaultDesignLoader = dynamic(
  () => import('#/components/projects/DefaultDesignLoader'),
  { ssr: false },
);
const ConditionalCanvas = dynamic(
  () => import('#/components/app-shell/ConditionalCanvas'),
  { ssr: false },
);

export default function ClientShell() {
  const pathname = usePathname();

  // The homepage has its own preview video and does not use the designer.
  // Skip client-only dynamic components here, including their SSR bailouts.
  if (pathname === '/') return null;

  // Account and legal portal routes do not use the 3D designer canvas.
  const isAccountRoute =
    pathname === '/my-account' ||
    pathname?.startsWith('/my-account/') ||
    pathname === '/orders' ||
    pathname?.startsWith('/orders/') ||
    pathname === '/account' ||
    pathname?.startsWith('/account/') ||
    pathname === '/privacy' ||
    pathname?.startsWith('/privacy/') ||
    pathname === '/terms' ||
    pathname?.startsWith('/terms/') ||
    pathname === '/login' ||
    pathname?.startsWith('/login/');

  return (
    <>
      <RouterBinder />
      <DefaultDesignLoader />
      {!isAccountRoute && <ConditionalCanvas />}
    </>
  );
}
