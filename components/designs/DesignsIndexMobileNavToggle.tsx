'use client';

import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const productLinks = [
  ['Laser-Etched Headstone', '/designs/laser-etched-headstone'],
  ['Traditional Headstone', '/designs/traditional-headstone'],
  ['Bronze Plaque', '/designs/bronze-plaque'],
  ['Traditional Plaque', '/designs/traditional-plaque'],
  ['Laser Colour Plaque', '/designs/laser-colour-plaque'],
  ['Stainless Steel Plaque', '/designs/stainless-steel-plaque'],
  ['Mini Headstone', '/designs/mini-headstone'],
  ['Full Colour Plaque', '/designs/full-colour-plaque'],
  ['Traditional Monument', '/designs/traditional-monument'],
  ['Laser Monument', '/designs/laser-monument'],
  ['Pet Memorial', '/designs/pets'],
] as const;

export default function DesignsIndexMobileNavToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="fixed left-4 top-4 z-[9999] rounded-lg bg-slate-900 p-3 text-white shadow-lg transition-colors hover:bg-slate-800 md:hidden"
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-[9990] bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav className="fixed inset-y-0 left-0 z-[9995] w-[min(400px,calc(100vw-32px))] overflow-y-auto bg-white shadow-2xl md:hidden">
            <div className="border-b border-slate-200 px-6 py-5">
              <Link
                href="/designs"
                className="block text-sm font-semibold uppercase tracking-widest text-stone-800"
                onClick={() => setIsOpen(false)}
              >
                Memorial Designs
              </Link>
              <Link
                href="/select-product"
                className="mt-4 inline-flex rounded-lg border border-stone-950 bg-stone-950 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors hover:border-[#8a6b1f] hover:bg-[#8a6b1f]"
                onClick={() => setIsOpen(false)}
              >
                Start Design
              </Link>
            </div>
            <div className="space-y-1 px-3 py-4">
              {productLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-lg px-3 py-2.5 text-[15px] font-normal text-stone-800 transition-all hover:bg-stone-100"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      ) : null}
    </>
  );
}
