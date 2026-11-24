'use client';

import { useId, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface MobileNavToggleProps {
  children: React.ReactNode;
  desktopSidebar?: boolean;
}

export default function MobileNavToggle({ children, desktopSidebar = false }: MobileNavToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      {/* Mobile Hamburger Button - Fixed position with highest z-index */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[9999] bg-slate-900 text-white p-3 rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
        aria-controls={desktopSidebar || isOpen ? panelId : undefined}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[9990]"
          onClick={() => setIsOpen(false)}
        />
      )}
      {(desktopSidebar || isOpen) && (
        <aside
          id={panelId}
          className={`fixed inset-y-0 left-0 z-[9995] w-[min(400px,100vw)] overflow-y-auto bg-white shadow-2xl ${isOpen ? 'block' : 'hidden'} ${desktopSidebar ? 'md:z-10 md:block md:w-[400px] md:shadow-none' : 'md:hidden'}`}
        >
          {children}
        </aside>
      )}
    </>
  );
}
