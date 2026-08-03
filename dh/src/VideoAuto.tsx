'use client';

import React, { useRef, useEffect } from 'react';

interface Props {
  src: string;
  poster?: string;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  controls?: boolean;
  ariaLabel?: string;
}

export default function VideoAuto({ src, poster, muted = true, loop = false, className, controls = false, ariaLabel }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    // Ensure muted for autoplay
    el.muted = Boolean(muted);
    el.playsInline = true;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!el) return;
          if (entry.isIntersecting) {
            // play when visible
            const p = el.play();
            if (p && typeof p.then === 'function') p.catch(() => {});
          } else {
            // pause when not visible
            try { el.pause(); } catch {}
          }
        });
      },
      { root: null, rootMargin: '200px', threshold: 0.25 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
    };
  }, [muted]);

  return (
    <video ref={ref} src={src} poster={poster} muted={muted} loop={loop} className={className} controls={controls} aria-label={ariaLabel} />
  );
}
