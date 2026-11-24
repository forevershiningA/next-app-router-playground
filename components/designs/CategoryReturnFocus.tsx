'use client';

import { useEffect } from 'react';

export default function CategoryReturnFocus() {
  useEffect(() => {
    const list = document.getElementById('category-design-list');
    if (!list) return;

    // Scope the selection to this browser history entry, including across reloads.
    const frame = requestAnimationFrame(() => {
      const href = history.state?.designCardHref;
      if (typeof href === 'string' && document.activeElement === document.body) {
        list.querySelector<HTMLAnchorElement>(`a[href="${CSS.escape(href)}"]`)?.focus({ preventScroll: true });
      }
    });

    function rememberCard(event: MouseEvent) {
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element && event.target.closest('a[href]');
      if (link) {
        history.replaceState({ ...history.state, designCardHref: link.getAttribute('href') }, '');
      }
    }

    list.addEventListener('click', rememberCard, true);
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener('click', rememberCard, true);
    };
  }, []);

  return null;
}
