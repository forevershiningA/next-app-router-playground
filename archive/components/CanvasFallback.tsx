'use client';

import { useEffect, useState } from 'react';

/**
 * Component that only shows children when canvas/WebGL is not supported
 * Hides children by default until we verify canvas support
 */
export default function CanvasFallback({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showFallback, setShowFallback] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if canvas and WebGL are supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2') || canvas.getContext('experimental-webgl');
      
      // Show fallback only if WebGL is NOT supported
      setShowFallback(!gl);
    } catch (e) {
      // If there's an error, assume canvas is not supported
      setShowFallback(true);
    }
  }, []);

  // Don't render anything until we've checked, or if canvas is supported
  if (showFallback === null || showFallback === false) {
    return null;
  }

  // Only render children if canvas is NOT supported
  return <>{children}</>;
}
