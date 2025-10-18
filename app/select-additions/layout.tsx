'use client';

import React from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <SceneOverlayController section="additions" title="Select Additions">
        {children}
      </SceneOverlayController>
    </div>
  );
}
