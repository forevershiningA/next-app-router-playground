'use client';

import { useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useRouter } from 'next/navigation';

export default function SEOPage() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const router = useRouter();

  useEffect(() => {
    // Open the SEO panel
    setActivePanel('seo');
    
    // Navigate back to home after a short delay so the URL doesn't stay on /seo
    const timer = setTimeout(() => {
      router.push('/');
    }, 100);

    return () => clearTimeout(timer);
  }, [setActivePanel, router]);

  return null;
}
