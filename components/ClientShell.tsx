'use client';

// Client-side shell that lazy-loads heavy designer components so they are NOT
// bundled into the critical app/layout.js chunk (which caused chunk-load timeouts).
// `ssr: false` is only valid inside a Client Component, so this wrapper exists
// purely to host those dynamic() calls.

import dynamic from 'next/dynamic';

const RouterBinder = dynamic(() => import('#/components/system/RouterBinder'), { ssr: false });
const DefaultDesignLoader = dynamic(() => import('#/components/DefaultDesignLoader'), { ssr: false });
const ConditionalCanvas = dynamic(() => import('#/components/ConditionalCanvas'), { ssr: false });

export default function ClientShell() {
  return (
    <>
      <RouterBinder />
      <DefaultDesignLoader />
      <ConditionalCanvas />
    </>
  );
}
