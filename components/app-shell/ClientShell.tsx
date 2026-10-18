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

  return (
    <>
      <RouterBinder />
      <DefaultDesignLoader />
      <ConditionalCanvas />
    </>
  );
}
