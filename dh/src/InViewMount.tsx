'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  rootMargin?: string;
  threshold?: number | number[];
}

export default function InViewMount({ children, rootMargin = '0px', threshold = 0.1 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // If no IO support, mount by default
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setInView(true);
          else setInView(false);
        });
      },
      { root: null, rootMargin, threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, threshold]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }}>{inView ? children : null}</div>;
}
