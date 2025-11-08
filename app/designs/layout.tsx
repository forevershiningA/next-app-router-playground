'use client';

import { useEffect } from 'react';

export default function DesignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Set body background to white for designs pages
    document.body.classList.remove('bg-black');
    document.body.classList.add('bg-white');
    
    // Cleanup: restore black background when leaving designs routes
    return () => {
      document.body.classList.remove('bg-white');
      document.body.classList.add('bg-black');
    };
  }, []);

  return <>{children}</>;
}
