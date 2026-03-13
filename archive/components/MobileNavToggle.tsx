'use client';

import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface MobileNavToggleProps {
  children: React.ReactNode;
}

export default function MobileNavToggle({ children }: MobileNavToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button - Fixed position with highest z-index */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[9999] bg-slate-900 text-white p-3 rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-[9990]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Navigation Panel */}
          <div className="md:hidden fixed inset-y-0 left-0 w-[400px] bg-white shadow-2xl z-[9995] overflow-y-auto">
            {children}
          </div>
        </>
      )}
    </>
  );
}
