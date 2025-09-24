import '#/styles/globals.css';

import ThreeScene from '#/components/ThreeScene';
import SceneOverlayHost from '#/components/SceneOverlayHost';
import { Suspense } from 'react';
import { SkeletonCard } from '#/ui/skeleton-card';

export default function WithSceneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SkeletonCard />}>
        <SceneOverlayHost /> {/* ← one host, one overlay */}
        <ThreeScene />
      </Suspense>
      <div className="pt-4 pb-10">{children}</div>
    </>
  );
}
