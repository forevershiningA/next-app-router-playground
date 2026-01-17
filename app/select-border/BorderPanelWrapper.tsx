'use client';

import SceneOverlayController from '#/components/SceneOverlayController';

export default function BorderPanelWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SceneOverlayController section="border" title="Select Border" isOpen={true}>
      {children}
    </SceneOverlayController>
  );
}
