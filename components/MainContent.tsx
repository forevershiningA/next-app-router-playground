'use client';

import { useState, useEffect } from 'react';

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handler = () => setIsSidebarOpen((s) => !s);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  return <div className={isSidebarOpen ? 'lg:pl-72' : ''}>{children}</div>;
}
