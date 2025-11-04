'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SEOPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new /designs route
    router.replace('/designs');
  }, [router]);

  return null;
}
