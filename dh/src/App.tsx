import { useState, useRef, useEffect, useCallback, type ReactNode, lazy, Suspense } from 'react';
import { shapes, materials, Fonts } from './data';
import type { Shape, GraniteMaterial } from './types';

import InViewMount from './InViewMount';
import VideoAuto from './VideoAuto';

const LazyHeroCanvas = lazy(() => import('./HeroCanvas'));

function HeroCanvasPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center rounded-2xl" style={{ backgroundColor: '#F8D7A1' }} aria-hidden="false">
      <div role="status" aria-label="Loading hero canvas" className="flex items-center justify-center">
        <svg className="w-12 h-12 text-stone-600 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>
    </div>
  );
}

function HeroCanvasMount({ Component }: { Component: React.LazyExoticComponent<any> }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [contentReady, setContentReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const minShownRef = useRef(false);

  // Ensure placeholder shows at least this long to avoid flicker
  useEffect(() => {
    const t = window.setTimeout(() => { minShownRef.current = true; }, 700);
    return () => clearTimeout(t);
  }, []);

  // Observe for a canvas node and wait until it has rendered visible content
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let obs: MutationObserver | null = null;
    let pollId: number | null = null;
    let checkId: number | null = null;
    const sampleSize = 16; // downscale sampling for performance

    const findCanvas = (): HTMLCanvasElement | null => {
      return el.querySelector('canvas');
    };

    const isCanvasPopulated = (canvas: HTMLCanvasElement) => {
      try {
        const w = sampleSize;
        const h = sampleSize;
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const ctx = off.getContext('2d');
        if (!ctx) return true; // can't sample; assume populated to avoid blocking
        // draw the target canvas into the small offscreen canvas
        ctx.drawImage(canvas, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h).data;
        const total = w * h;
        const refR = img[0], refG = img[1], refB = img[2], refA = img[3];
        let diffCount = 0;
        const thresh = 12; // per-channel diff threshold
        for (let i = 0; i < img.length; i += 4) {
          const dr = Math.abs(img[i] - refR);
          const dg = Math.abs(img[i+1] - refG);
          const db = Math.abs(img[i+2] - refB);
          const da = Math.abs(img[i+3] - refA);
          if (dr > thresh || dg > thresh || db > thresh || da > 20) diffCount++;
        }
        // if more than 2% of sampled pixels differ from the first pixel, consider it populated
        return diffCount / total > 0.02;
      } catch (e) {
        // security or other errors - bail out and assume populated
        return true;
      }
    };

    const attemptReady = () => {
      const canvas = findCanvas();
      if (!canvas) return false;
      // If minimum visible time not yet elapsed, postpone checking
      if (!minShownRef.current) return false;
      // Perform a sampling check
      try {
        if (isCanvasPopulated(canvas)) {
          setContentReady(true);
          return true;
        }
      } catch (e) {
        // ignore and let timeout handle
      }
      return false;
    };

    const finalizeReveal = () => {
      // small settle delay for nicer visual
      window.setTimeout(() => setVisible(true), 180);
    };

    // If canvas already present, start checking for rendered content
    const existing = findCanvas();
    if (existing) {
      // Poll a few times to confirm rendering; allow minShownRef delay
      pollId = window.setInterval(() => {
        if (attemptReady()) {
          if (pollId) { clearInterval(pollId); pollId = null; }
        }
      }, 300) as unknown as number;
      const safety = window.setTimeout(() => {
        if (pollId) { clearInterval(pollId); pollId = null; }
        setContentReady(true);
      }, 8000);
      return () => { if (pollId) clearInterval(pollId as unknown as number); clearTimeout(safety); };
    }

    // Otherwise observe for canvas addition
    obs = new MutationObserver(() => {
      const c = findCanvas();
      if (c) {
        // start a short polling to wait for content
        pollId = window.setInterval(() => {
          if (attemptReady()) {
            if (pollId) { clearInterval(pollId); pollId = null; }
            obs?.disconnect();
          }
        }, 300) as unknown as number;
      }
    });
    obs.observe(el, { childList: true, subtree: true });

    // Extra fallback polling in case mutations are missed
    checkId = window.setInterval(() => {
      const c = findCanvas();
      if (c && !pollId) {
        pollId = window.setInterval(() => {
          if (attemptReady()) {
            if (pollId) { clearInterval(pollId); pollId = null; }
            if (obs) obs.disconnect();
          }
        }, 300) as unknown as number;
      }
    }, 500) as unknown as number;

    // When contentReady becomes true, finalize reveal (handled below via effect)
    const contentReadyCleanup = () => {};

    // Listen for an explicit readiness signal from the canvas (preferred and robust)
    const onHeroReady = () => {
      if (minShownRef.current) setContentReady(true);
      else setTimeout(() => setContentReady(true), 220);
    };
    window.addEventListener('hero-ready', onHeroReady as EventListener);

    // Safety timeout to avoid never-ready state
    const timeoutId = window.setTimeout(() => setContentReady(true), 10000);

    return () => {
      window.removeEventListener('hero-ready', onHeroReady as EventListener);
      if (obs) obs.disconnect();
      if (pollId) clearInterval(pollId as unknown as number);
      if (checkId) clearInterval(checkId as unknown as number);
      clearTimeout(timeoutId);
      contentReadyCleanup();
    };
  }, [Component]);

  // When contentReady flips, start reveal
  useEffect(() => {
    if (contentReady) finalizeReveal();
    function finalizeReveal() {
      window.setTimeout(() => setVisible(true), 180);
    }
  }, [contentReady]);

  const heroTransform = visible ? 'translateY(30px) scale(1)' : 'translateY(8px) scale(0.95)';

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <div className={`absolute inset-0 transition-opacity duration-500 ${visible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <HeroCanvasPlaceholder />
      </div>

      <div
        className={`w-full h-full transition-all duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: heroTransform }}
      >
        <Suspense fallback={null}>
          <Component />
        </Suspense>
      </div>
    </div>
  );
}


function HeroCanvasLoader() {
  // Use the full HeroCanvas on all viewports (desktop & mobile) so mobile shows the same Heart headstone.
  // Wrapped in InViewMount to defer loading until near viewport.
  return (
    <InViewMount rootMargin="200px">
      <HeroCanvasMount Component={LazyHeroCanvas} />
    </InViewMount>
  );
}

function useDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

function HeroVisual() {
  const isDesktop = useDesktopViewport();

  if (isDesktop) {
    return <HeroCanvasLoader />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center" aria-label="Preview of a custom engraved heart headstone">
      <div className="relative h-full w-full max-w-[340px]">
        <div
          className="absolute left-1/2 top-0 h-[230px] w-[288px] -translate-x-1/2 drop-shadow-xl sm:h-[280px] sm:w-[350px]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05), rgba(0,0,0,0.18)), url(${BASE}textures/forever/l/Blue-Pearl.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            WebkitMaskImage: `url(${BASE}shapes/masks/heart.svg)`,
            maskImage: `url(${BASE}shapes/masks/heart.svg)`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
        <div className="absolute left-1/2 top-[56px] w-[220px] -translate-x-1/2 text-center font-serif text-[#f7d76d] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:top-[68px] sm:w-[260px]">
          <div className="text-[12px] font-semibold leading-tight sm:text-[14px]">In Loving Memory</div>
          <div className="mt-1 text-[17px] font-bold leading-tight sm:text-[20px]">Margaret Ann Cole</div>
        </div>
        <img
          src={`${BASE}vitreous-enamel-image.png`}
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-[104px] h-[62px] w-[46px] -translate-x-1/2 rounded-full border-2 border-[#f7d76d] object-cover shadow-lg sm:top-[128px] sm:h-[76px] sm:w-[56px]"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute left-1/2 top-[208px] h-[42px] w-[286px] -translate-x-1/2 rounded-sm shadow-[0_14px_20px_rgba(0,0,0,0.18)] sm:top-[254px] sm:h-[48px] sm:w-[340px]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.08), rgba(0,0,0,0.22)), url(${BASE}textures/forever/l/Blue-Pearl.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
          }}
        />
        <div className="absolute left-1/2 top-[244px] h-2 w-[250px] -translate-x-1/2 rounded-full bg-black/35 blur-[2px] sm:top-[295px] sm:w-[300px]" />
      </div>
    </div>
  );
}

const DESIGN_URL = 'https://discountheadstones.com.au/design/html5/?product-id124';
const BASE = import.meta.env.BASE_URL;
const CONTACT_EMAIL = 'info@discountheadstones.com.au';
const CONTACT_PHONE_DISPLAY = '1300 851 181';
const CONTACT_PHONE_HREF = 'tel:+611300851181';

/* ─── Peek Carousel ───────────────────────────────────────────────────────── */
// Card occupies 78% of the column; adjacent cards peek outside the white section
const CARD_FRAC = 0.78;
const CARD_GAP = 10;

function usePeekCarousel(count: number, initialIdx = 0, cardFrac = CARD_FRAC) {
  const [idx, setIdx] = useState(initialIdx);
  const outerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const [tx, setTx] = useState('none');

  // Drag / pointer state refs so handlers don't re-register on every frame
  const startXRef = useRef(0);
  const dragDeltaRef = useRef(0);
  const draggingRef = useRef(false);
  const startIdxRef = useRef(initialIdx);
  const autoplayRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  const recalc = useCallback((i: number) => {
    const el = outerRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const cardW = Math.round(w * cardFrac);
    setCw(cardW);
    const base = Math.round((w - cardW) / 2 - i * (cardW + CARD_GAP));
    setTx(`translateX(${base}px)`);
  }, [cardFrac]);

  useEffect(() => {
    recalc(idx);
    const el = outerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => recalc(idx));
    ro.observe(el);

    // Autoplay helpers (advance every 4s)
    function startAutoplay() {
      stopAutoplay();
      if (count <= 1) return;
      autoplayRef.current = window.setInterval(() => {
        if (pausedRef.current || draggingRef.current) return;
        setIdx((i) => (i + 1) % count);
      }, 4000) as unknown as number;
    }
    function stopAutoplay() {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current as unknown as number);
        autoplayRef.current = null;
      }
    }

    // Pointer / touch drag handlers - support mouse and touch via Pointer Events
    function onPointerDown(e: PointerEvent) {
      try { (e.target as Element).setPointerCapture(e.pointerId); } catch {}
      startXRef.current = e.clientX;
      dragDeltaRef.current = 0;
      draggingRef.current = true;
      startIdxRef.current = idx;
      pausedRef.current = true; // pause autoplay during interaction
    }

    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      const el = outerRef.current;
      if (!el) return;
      const delta = e.clientX - startXRef.current;
      dragDeltaRef.current = delta;
      const w = el.offsetWidth;
      const cardW = Math.round(w * cardFrac);
      const base = Math.round((w - cardW) / 2 - startIdxRef.current * (cardW + CARD_GAP));
      setTx(`translateX(${base + delta}px)`);
    }

    function endDrag(e: PointerEvent) {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const el = outerRef.current;
      if (!el) return;
      const delta = dragDeltaRef.current;
      const w = el.offsetWidth;
      const cardW = Math.round(w * cardFrac);
      // negative delta (swipe left) should move to higher index
      const move = Math.round(-delta / (cardW + CARD_GAP));
      const newIdx = Math.max(0, Math.min(count - 1, startIdxRef.current + move));
      setIdx(newIdx);
      const base = Math.round((w - cardW) / 2 - newIdx * (cardW + CARD_GAP));
      setCw(cardW);
      setTx(`translateX(${base}px)`);
      try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
      // resume autoplay shortly after interaction
      pausedRef.current = false;
    }

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // pause autoplay while mouse is over the carousel
    function onEnter() { pausedRef.current = true; }
    function onLeave() { pausedRef.current = false; }
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    // Keyboard navigation (requires the container to be focusable)
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight') setIdx((i) => Math.min(count - 1, i + 1));
    }
    el.addEventListener('keydown', onKey as EventListener);

    startAutoplay();

    return () => {
      ro.disconnect();
      stopAutoplay();
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('keydown', onKey as EventListener);
    };
  }, [idx, recalc, count]);

  const goTo = (i: number) => setIdx(Math.max(0, Math.min(count - 1, i)));
  return { idx, goTo, outerRef, cw, tx };
}

function PeekCarousel<T extends { id: string }>({
  items,
  renderCard,
  getLabel,
  initialIdx = 0,
  cardFrac,
}: {
  items: T[];
  renderCard: (item: T, active: boolean) => ReactNode;
  getLabel: (item: T) => string;
  initialIdx?: number;
  cardFrac?: number;
}) {
  const { idx, goTo, outerRef, cw, tx } = usePeekCarousel(items.length, initialIdx, cardFrac ?? CARD_FRAC);

  return (
    <div className="relative select-none">
      {/* Track: masked inside white background - overflow-hidden on wrapper so only active card is visible */}
      <div className="py-2">
        <div ref={outerRef} tabIndex={0} className="overflow-hidden focus:outline-none">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ gap: `${CARD_GAP}px`, transform: tx }}
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                className="flex-none cursor-pointer"
                style={{ width: cw ? `${cw}px` : `${(cardFrac ?? CARD_FRAC) * 100}%` }}
                onClick={() => goTo(i)}
              >
                {renderCard(item, i === idx)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => goTo(idx - 1)}
        disabled={idx === 0}
        aria-label="Previous"
        className="absolute left-2 top-[42%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl leading-none text-stone-700 shadow-md ring-1 ring-stone-300 disabled:opacity-30 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30 lg:h-12 lg:w-12"
      >‹</button>
      <button
        onClick={() => goTo(idx + 1)}
        disabled={idx === items.length - 1}
        aria-label="Next"
        className="absolute right-2 top-[42%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl leading-none text-stone-700 shadow-md ring-1 ring-stone-300 disabled:opacity-30 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30 lg:h-12 lg:w-12"
      >›</button>

      {/* Label row */}
      <div className="flex items-center justify-center px-3 lg:px-6 mt-2 mb-1 py-1">
        <span className="text-base font-medium text-stone-700">{getLabel(items[idx])}</span>
      </div>

      {/* indicators */}
      <div className="flex items-center justify-center gap-2 mt-1">
        {items.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Go to ${i+1}`} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-stone-800' : 'bg-stone-300'} cursor-pointer`} />
        ))}
      </div>
    </div>
  );
}

/* ─── Card Components ─────────────────────────────────────────────────────── */
function ShapeCard({ shape, active, texture }: { shape: Shape; active: boolean; texture?: string }) {
  const defaultTexture = `${BASE}textures/forever/l/Blue-Pearl.webp`;
  const useTexture = texture ?? defaultTexture;
  const mask = `${BASE}shapes/headstones/${shape.svgFile}`;
  return (
    <div className={`group rounded-md bg-white/72 p-4 pb-6 ring-1 ring-stone-200 transition-transform duration-200 ${active ? 'shadow-lg' : 'opacity-70'} `}>
      {/* Linkable visual preview (clicking image opens design with shape) */}
      <a href={`${DESIGN_URL}&shape-id${shape.shapeIndex}`} aria-label={`Open designer with ${shape.name}`} className="block overflow-hidden rounded-md focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30">
        <div className="flex min-h-[390px] items-center justify-center rounded-md bg-stone-50 px-2 py-4 ring-1 ring-stone-100">
          <div
            className="relative"
            style={{
              width: '100%',
              maxWidth: '430px',
              height: '390px',
              backgroundImage: `url(${useTexture})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              WebkitMaskImage: `url(${mask})`,
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskImage: `url(${mask})`,
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              maskSize: 'contain',
            }}
          />
        </div>
      </a>

      {/* Hidden lazy image to help browsers defer texture loading and improve LCP */}
      <img src={useTexture} alt="" aria-hidden="true" loading="lazy" className="hidden" />

      {/* DESIGN ONLINE CTA */}
      <div className="mt-6 flex justify-center">
        <a href={`${DESIGN_URL}&shape-id${shape.shapeIndex}`} className="inline-block bg-[#0f1724] hover:bg-[#1f2734] text-white px-5 py-2.5 rounded-md text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30">DESIGN ONLINE</a>
      </div>
    </div>
  );
}

function GraniteCard({ material, active }: { material: GraniteMaterial; active: boolean }) {
  return (
    <a href={DESIGN_URL}>
      <div className="rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-stone-200 p-4">
        <div className="flex items-center justify-center">
          {/* Fixed-size preview that scales down on narrow viewports */}
          <div style={{ width: 400, height: 400, maxWidth: '100%' }} className="flex-none">
            <img
              src={`${BASE}textures/forever/l/${material.textureFile}`}
              alt={material.name}
              className={`w-full h-full object-cover ${active ? '' : 'opacity-40 grayscale'}`}
              loading="lazy"
            />
          </div>
        </div>
        <div className="mt-3 text-center text-sm text-stone-700">{material.name}</div>
      </div>
    </a>
  );
}

/* ─── Design Tool Screenshot ──────────────────────────────────────────────── */
function DesignPreview() {
  return (
    <div className="overflow-hidden rounded-lg">
    </div>
  );
}

/* ─── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const selectedTexture = `${BASE}textures/forever/l/${materials[selectedMaterialIdx].textureFile}`;

  // Append a "Back to Top" link at the end of each section (runtime DOM injection).
  // Skip the first section on the page so the top-most hero doesn't get a Back to Top link.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section')) as HTMLElement[];
    const first = sections.length ? sections[0] : null;
    sections.forEach((s) => {
      if (s === first) return; // skip the first section
      if (s.querySelector('.ch-back-to-top')) return;
      const div = document.createElement('div');
      div.className = 'ch-back-to-top mt-8 text-center';
      div.innerHTML = '<a href="#home" class="text-sm text-stone-700 hover:text-stone-900">Back to Top</a>';
      s.appendChild(div);
    });
    return () => {
      sections.forEach((s) => {
        const el = s.querySelector('.ch-back-to-top');
        if (el) s.removeChild(el);
      });
    };
  }, []);

  // Help / FAQ entries pulled from public/xml/au_EN/languages24.xml (instructions)
  const faqs: any[] = [];

  const motifColors = [
    { name: "Gold Gilding", img: `${BASE}motifs/colors/01.jpg`, hex: "#c99d44" },
    { name: "Silver Gilding", img: `${BASE}motifs/colors/35.jpg`, hex: "#eeeeee" },
    { name: "Alizarin", img: `${BASE}motifs/colors/02.jpg`, hex: "#f6303e" },
    { name: "Tangerine (gold drop)", img: `${BASE}motifs/colors/03.jpg`, hex: "#f28b00" },
    { name: "Tangerine yellow", img: `${BASE}motifs/colors/04.jpg`, hex: "#ffce00" },
    { name: "Sherwood Green", img: `${BASE}motifs/colors/05.jpg`, hex: "#154733" },
    { name: "Java", img: `${BASE}motifs/colors/06.jpg`, hex: "#19988b" },
    { name: "Indigo", img: `${BASE}motifs/colors/07.jpg`, hex: "#510b76" },
    { name: "Black", img: `${BASE}motifs/colors/08.jpg`, hex: "#000000" },
    { name: "Brown", img: `${BASE}motifs/colors/09.jpg`, hex: "#a22b2a" },
    { name: "International Orange", img: `${BASE}motifs/colors/10.jpg`, hex: "#fd4f00" },
    { name: "Gorse", img: `${BASE}motifs/colors/11.jpg`, hex: "#fee123" },
    { name: "La Rioja", img: `${BASE}motifs/colors/12.jpg`, hex: "#c3d600" },
    { name: "Dark Turquoise", img: `${BASE}motifs/colors/13.jpg`, hex: "#00c2df" },
    { name: "East Side", img: `${BASE}motifs/colors/14.jpg`, hex: "#bd83cb" },
    { name: "Mako", img: `${BASE}motifs/colors/15.jpg`, hex: "#4e5859" },
    { name: "Chantilly", img: `${BASE}motifs/colors/16.jpg`, hex: "#f0b3cb" },
    { name: "Texas Rose", img: `${BASE}motifs/colors/17.jpg`, hex: "#ffb35a" },
    { name: "Vis Vis", img: `${BASE}motifs/colors/18.jpg`, hex: "#f7de8c" },
    { name: "Caribbean Green", img: `${BASE}motifs/colors/19.jpg`, hex: "#00ce7d" },
    { name: "Summer Sky", img: `${BASE}motifs/colors/20.jpg`, hex: "#3b8ede" },
    { name: "Wistful", img: `${BASE}motifs/colors/21.jpg`, hex: "#a8a4e0" },
    { name: "Submarine", img: `${BASE}motifs/colors/22.jpg`, hex: "#8f9d9d" },
    { name: "Ruby", img: `${BASE}motifs/colors/23.jpg`, hex: "#d41568" },
    { name: "Dark Brown", img: `${BASE}motifs/colors/24.jpg`, hex: "#643c1f" },
    { name: "Watercourse", img: `${BASE}motifs/colors/25.jpg`, hex: "#006746" },
    { name: "Riptide", img: `${BASE}motifs/colors/26.jpg`, hex: "#87e2d1" },
    { name: "Smalt", img: `${BASE}motifs/colors/27.jpg`, hex: "#00269a" },
    { name: "Tiara", img: `${BASE}motifs/colors/28.jpg`, hex: "#bdc6c2" },
    { name: "Chocolate", img: `${BASE}motifs/colors/30.jpg`, hex: "#c26b13" },
    { name: "Christi", img: `${BASE}motifs/colors/31.jpg`, hex: "#799a05" },
    { name: "Robins Egg Blue", img: `${BASE}motifs/colors/32.jpg`, hex: "#1fcfcb" },
    { name: "Jordy Blue", img: `${BASE}motifs/colors/33.jpg`, hex: "#7aa4dd" },
    { name: "White", img: `${BASE}motifs/colors/34.jpg`, hex: "#ffffff" }
  ];

  const half = Math.ceil(motifColors.length / 2);
  const motifTop = motifColors.slice(0, half);
  const motifBottom = motifColors.slice(half);

  // Help / FAQ (question phrasing) used for collapsible accordion UI
  const helpFaqs = [
    { q: 'Why choose the Traditional Engraved Headstone?', a: `<ul><li>Our granite, marble and sandstone Headstones with traditional Inscription have been designed to complement our range of funerary products and satisfy the needs of customers who wish to use a traditional material for their memorial.</li><br/><li>These Headstones are available in different granites, marbles and sandstone in a variety of colours. Inscriptions and Motif artwork also come in a wide range of different colours to choose from.</li><br/><li>A polished granite, marble or sandstone product will not oxidize or readily deteriorate thereby maintaining good looks for many years.</li><br/><li>Price includes delivery to mainland Australia. Please note, we can only deliver products heavier than 25kg to a postal or shipping depot for collection. See <a target="_blank" rel="noopener noreferrer" href="https://www.forevershining.com.au/help/delivery/">Delivery</a> for details.</li></ul>` },
    { q: 'How do I choose Granites?', a: `<p>Traditional Engraved Plaques and Headstones are available in a number of different granites, marbles and sandstone. Our most popular material for this product is Blue Pearl.</p><p>All stone is responsibly sourced from around the world for the highest quality material. Please note that because materials are natural stone it has an unpredictable grain pattern and fleck which is part of stone’s beauty.</p><p>If you have a particular material in mind which you cannot find among the stone listed, please call us.</p>` },
    { q: 'How do I change the Headstone size?', a: `<p>To change the size of your Headstone, move the Width and Height sliders left or right to adjust dimensions.</p><p>Alternatively, enter the dimensions directly into the size input, or use the - / + buttons to decrease or increase size.</p><p>The dimensions and estimated cost are shown in the header as you adjust them.</p>` },
    { q: 'How do I choose a Shape?', a: `<p>Click to select your preferred Shape from the available shapes on the left-hand side of the window.</p><p>Products come in a range of Shapes for you to choose from. Custom shapes are available upon request.</p>` },
    { q: 'How do I add my Inscriptions?', a: `<p>To add an Inscription, click into the box titled ‘Add Your Inscription’ on the left-hand side of the window and type your message. The Inscription will appear on your design and additional controls will appear in the left menu.</p><p>Choose your desired font from the drop-down list ‘Select Font’. There are currently ten to choose from. Please contact us if you would like a different font.</p><p>Move the slider below Size to the left and right to decrease and increase the size of your Inscription. You can also use the - Decrease / + Increase buttons. You can also re-size the Inscription by clicking and dragging on one of the four circles on the corners of the bounding box surrounding your text on the design.</p><p>Rotate your text using the Rotation slider or the +/- buttons.</p><p>Select the colour of your Inscription from the colour swatch on the left-hand side of the window.</p><p>Move the Inscription to position by clicking and dragging the Inscription on the design.</p><p>To add more Inscriptions either click the button ‘Add New Line’ and type your new Inscription. Or, click on the ‘Duplicate’ button at the bottom of the left-hand menu and then edit the text in the box titled ‘Add Your Inscription’.</p>` },
    { q: 'How do I add Images?', a: `<![CDATA[<strong>Instructions:</strong><br/><br/>
Click the <strong><i>'UPLOAD'</i></strong> button below to upload a photo or image from your own files, or click <strong><i>'CLOSE'</i></strong> to exit the upload process. <br/><br/>
In the window that opens, find and select your desired photo or image. Click <strong><i>'Open'</i></strong> or <strong><i>'Done'</i></strong> to begin uploading your image to your design. <br/><br/>
In the screen that follows you can crop, resize and move your desired photo or image as you like. <br/><br/>
For best results, please ensure your image is between 500kB and 8MB in size before uploading. <br/><br/>
The bigger and more clear your image, the better the result. If you only have a physical photo or image, you may post or bring this to us and we will scan it into a high resolution digital file for you. <br/><br/>
Feel free to call us for more information.
]]>` },
    { q: 'How do I add Motifs?', a: `<p>Click on a Motif category to display all Motifs in that category. For example, clicking on ‘Aquatic’ will show aquatic Motifs. If you want to see more Motifs in the same category, click ‘Load more’ at the bottom of the list of Motifs. If you want to change the Motif category, click on the drop-down list indicated by the small downward-facing triangle just below ‘Select Category’.</p><p>Add the Motif you want by clicking on it from among the displayed Motifs. Your Motif will be added to your design, and Motif control buttons and sliders will appear on the left.</p><p>To re-size your chosen Motif, drag the slider below ‘Size’ or click the - Decrease / + Increase buttons in the control panel. Alternately, click and drag on one of the four circles on the corners of the bounding box surrounding your Motif on the design.</p><p>Rotate your chosen Motif by dragging the slider below ‘Rotation’ or clicking on the - / + buttons below it.</p><p>You can flip your chosen Motif if wanted by clicking on the ‘Flip X’ and ‘Flip Y’ buttons. These flip the Motif in both horizontal and vertical axes. You can also Duplicate and Delete your Motif by clicking on the respective buttons. Pressing ‘Delete’ on your keyboard will also remove the Motif from your design.</p><p>The cost of the adding Motifs to your design will show in the total cost in the header. Or see Check Price in the main menu for the individual cost of your chosen Motifs.</p>` },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div id="home" className="min-h-screen bg-[#f8d7a1]">

      {/* Mobile main nav. */}
      <header className="main-nav lg:hidden w-full bg-[#0f1724] shadow-sm mb-3">
        <div className="flex min-h-14 items-center justify-between px-4">
          <a href="#home" className="text-white font-semibold tracking-wide" onClick={() => setMobileMenuOpen(false)}>
            Discount Headstones
          </a>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30"
          >
            <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className="flex h-5 w-6 flex-col justify-between" aria-hidden="true">
              <span className={`h-0.5 w-6 rounded bg-current transition-transform ${mobileMenuOpen ? 'translate-y-[9px] rotate-45' : ''}`} />
              <span className={`h-0.5 w-6 rounded bg-current transition-opacity ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`h-0.5 w-6 rounded bg-current transition-transform ${mobileMenuOpen ? '-translate-y-[9px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
        <nav id="mobile-menu" className={`${mobileMenuOpen ? 'block' : 'hidden'} border-t border-white/10`}>
          <ul className="px-2 py-2">
            {[
              ['About', '#about'],
              ['Design Online', DESIGN_URL],
              ['Support', '#contact'],
              ['Help', '#help'],
              ['Contact', '#contact'],
            ].map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-3 text-base font-semibold uppercase tracking-wide text-white hover:bg-white/10 hover:text-[#F8D7A1]"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Full-width header (desktop) */}
      <header className="hidden lg:block bg-[#0f1724] top-0 z-50 shadow-sm">
        <div className="mx-auto w-full max-w-[1240px] flex items-center justify-between px-6 py-4">
                    <a href={DESIGN_URL}>
            <div className="text-2xl lg:text-2xl leading-snug text-white">Discount Headstones</div>
          </a>
          <nav className="main-nav">
            <ul className="nav-list flex items-center gap-6">
              <li><a href="#about" className="text-slate-300 hover:text-white font-semibold uppercase">About</a></li>
              <li><a href={DESIGN_URL} className="text-slate-300 hover:text-white font-semibold uppercase">Design now</a></li>
              <li><a href="#contact" className="text-slate-300 hover:text-white font-semibold uppercase">Support</a></li>
              <li><a href="#help" className="text-slate-300 hover:text-white font-semibold uppercase">Help</a></li>
              <li><a href="#contact" className="text-slate-300 hover:text-white font-semibold uppercase">Contact us</a></li>
            </ul>
          </nav>
        </div>
      </header>


      {/* Narrow centered column - carousel cards overflow into the gray sides */}
      <div className="mx-auto w-full max-w-full lg:max-w-[1240px]">

        {/* ── Hero (desktop: centered logo + hero headline, then split content) ── */}
        <section className="relative overflow-hidden py-6 px-4 sm:px-6 lg:py-8 section-fade mt-2 lg:mt-4">
          <div className="text-left">

            <div className="flex items-center justify-center lg:justify-between">
              <a href="#home" className="inline-block">
                <img src={`${BASE}logo.svg`} alt="Discount Headstones" className="h-24 sm:h-28 lg:h-34 w-auto" />
              </a>

              <nav className="second-nav hidden lg:block">
                <ul className="nav-list">
                  <li><a href="#home">Home</a></li>
                  <li><a href="#shapes">Shapes &amp; Granites</a></li>
                  <li><a href="#images">Images</a></li>
                  <li><a href="#motifs">Motifs</a></li>
                  <li><a href="#inscriptions">Inscriptions</a></li>
                </ul>
              </nav>
            </div>

            <div className="max-w-[1240px] mx-auto mt-6 lg:mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-5 lg:gap-8">

                {/* Mobile shows the offer first; desktop keeps the canvas on the right. */}
                <div className="flex justify-center order-2 lg:order-2">
                  <div className="w-full max-w-[920px] h-[275px] sm:h-[330px] lg:h-[520px]">
                    <HeroVisual />
                  </div>
                </div>

                {/* Hero copy and CTA. */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-1">
                  <h1 className="text-[1.8rem] sm:text-3xl lg:text-4xl font-normal leading-tight text-black [text-wrap:balance]">
                    Discount Headstones Australia - Engraved Headstones from $650
                  </h1>

                  <p className="hero-copy text-base sm:text-lg lg:text-xl text-stone-900 mt-4 max-w-[34rem]">Design custom granite headstones online with Australia-wide delivery.</p>

                  <div className="mt-4 space-y-3 text-base sm:text-lg text-stone-700 max-w-[34rem]">
                    <div className="flex items-start justify-start gap-3 text-left">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <div><strong>Design online:</strong> Create and preview your memorial instantly</div>
                    </div>
                    <div className="flex items-start justify-start gap-3 text-left">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <div><strong>Save money:</strong> Direct shipping from the factory to you</div>
                    </div>
                  </div>

                  <div className="mt-6 flex w-full flex-col items-center lg:items-start gap-4">
                    <a href={DESIGN_URL} className="w-full max-w-[320px] lg:w-auto lg:max-w-none bg-[#0f1724] hover:bg-[#1f2734] text-white font-sans font-bold uppercase tracking-wide text-base sm:text-lg lg:text-xl px-5 lg:px-14 py-4 rounded-md shadow-md transition-transform transform hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30 text-center whitespace-nowrap">
                      DESIGN ONLINE & SAVE
                    </a>
                    <div className="text-sm text-stone-900 mt-1 no-underline">Prices start at <strong>$650</strong>, including delivery</div>
                  </div>

                  <nav className="second-nav second-nav--mobile lg:hidden mt-7 w-full" aria-label="Page sections">
                    <ul className="nav-list">
                      <li><a href="#shapes">Shapes &amp; Granites</a></li>
                      <li><a href="#images">Images</a></li>
                      <li><a href="#motifs">Motifs</a></li>
                      <li><a href="#inscriptions">Inscriptions</a></li>
                    </ul>
                  </nav>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── Headstone Shapes ── */}
        <section id="shapes" className="bg-gradient-to-b from-[#f8d7a1] via-white to-white pt-10 mt-0 pb-12 full-bleed-lg">
          <div className="max-w-[1240px] mx-auto px-6">
            <h2 className="text-2xl lg:text-3xl font-normal leading-snug text-stone-800 text-center">
              Headstone Shapes &amp; Granites
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 items-start">

              {/* Left: Shapes carousel (uses selected texture) */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-full lg:w-[450px]">
                  <PeekCarousel
                    items={shapes}
                    renderCard={(shape, active) => <ShapeCard shape={shape} active={active} texture={selectedTexture} />}
                    getLabel={(shape) => shape.name}
                    cardFrac={1}
                  />

                  <p className="mt-10 mb-4 text-stone-700 leading-relaxed"><strong>Granite headstones</strong> are among the most durable and timeless memorials used in cemeteries around the world. While headstones come in many shapes—including <strong>Peak</strong>, <strong>Gable</strong>, <strong>Serpentine</strong>, and <strong>Wave</strong> designs—the <strong>manufacturing process</strong> follows a similar sequence, with the final profile determining the cutting and finishing techniques required.</p>
                  <p className="mt-6 mb-4 text-stone-700 leading-relaxed">The process begins in a <strong>granite quarry</strong>, where large blocks are extracted using modern methods such as diamond wire sawing and controlled splitting. Blocks are transported to monument manufacturing facilities, then cut into slabs of the required thickness using large industrial saws.</p>
                  <p className="mt-6 mb-4 text-stone-700 leading-relaxed">Slabs are then cut into rectangular blanks matching the dimensions of the finished monument. At this stage, every headstone starts as a simple rectangular piece of granite. The desired shape is marked using templates, CAD drawings, or CNC programming.</p>
                  <p className="mt-6 mb-4 text-stone-700 leading-relaxed">The <strong>shaping stage</strong> creates the different monument styles. Traditional designs such as <strong>Peak</strong>, <strong>Cropped Peak</strong>, and <strong>Gable</strong> can often be produced with straight saw cuts. More complex profiles—like <strong>Curved Peak</strong>, <strong>Curved Gable</strong>, <strong>Half Round</strong>, <strong>Left Wave</strong>, <strong>Right Wave</strong>, and <strong>Serpentine</strong>—typically require CNC contour-cutting equipment for smooth curves and intricate outlines.</p>
                  <p className="mt-6 mb-4 text-stone-700 leading-relaxed">After cutting, edges are ground and refined with diamond tools, and the monument is finished to the desired appearance—ranging from a high-gloss <strong>polish</strong> to a honed or rock-faced texture.</p>
                  <p className="mt-6 mb-4 text-stone-700 leading-relaxed">The final stage adds <strong>inscriptions, decorative artwork, and photographs</strong>, commonly achieved via <strong>sandblasting</strong>, <strong>laser etching</strong>, or <strong>CNC engraving</strong>. After quality inspection, the finished headstone is paired with its base and prepared for installation.</p>
                  <p className="text-stone-700 leading-relaxed">Although all granite headstones originate from the same raw material, the complexity of their shape significantly influences manufacturing. Simple geometric profiles are produced quickly, while decorative designs such as Serpentine and Wave monuments require additional contour cutting, grinding, and hand-finishing to achieve elegant flowing lines. The result is a <strong>durable and personalised memorial</strong> designed to withstand generations of exposure to the elements.</p>
                </div>

              </div>

              {/* Right: Granites grid (click to apply texture) */}
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {materials.map((mat, i) => (
                    <button
                      key={mat.name}
                      onClick={() => setSelectedMaterialIdx(i)}
                                        className={`flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg transition-shadow hover:shadow-md hover:ring-2 hover:ring-[#b89a3e] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-25 cursor-pointer ${selectedMaterialIdx === i ? 'ring-2 ring-[#b89a3e] shadow-sm' : 'ring-1 ring-stone-200'}`}
                    >
                      <div className="w-full h-32 overflow-hidden rounded-xl">
                                          <img src={`${BASE}textures/forever/l/${mat.textureFile}`} alt={mat.name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                                        <div className="mt-3 text-sm text-stone-800">{mat.name}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-8 flex justify-center">
              <a href={DESIGN_URL} className="inline-flex items-center justify-center bg-[#0f1724] hover:bg-[#1f2734] text-white font-sans font-bold uppercase tracking-wide text-base lg:text-xl px-6 lg:px-14 py-4 rounded-md shadow-md transition-transform transform hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30 whitespace-nowrap">DESIGN ONLINE & SAVE</a>
            </div>

          </div>
        </section>

        {/* ── About ── */}
        <section id="about" className="bg-[#c8e4fb] py-12 full-bleed-lg">
          <div className="max-w-[1240px] mx-auto px-6">
            <h2 className="text-3xl lg:text-4xl font-normal leading-tight text-stone-900 text-center lg:text-left mb-6">
              About our DYO system
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="max-w-[720px] mx-auto lg:mx-0 text-center lg:text-left">
                <p className="text-xl lg:text-2xl text-stone-800 mb-4">
                  <strong>Design Your Own (DYO)</strong> gives you a live, online way to build a traditional engraved Headstone before you order. Choose the Shape, Granite, size, Inscriptions, Motifs, and memorial Images while the design and price update as you work.
                </p>

                <p className="text-base text-stone-700 mb-4">
                  The system removes the slow back-and-forth of manual quoting. You can compare options, refine the layout, check how each addition affects the total, and move forward with a clearer understanding of what the finished memorial will look like.
                </p>

                <p className="text-base text-stone-700 mb-6">
                  Once your design is ready, submit it online for production and delivery. It is a practical way to personalise a durable stone memorial with confidence, without needing design software or a showroom appointment.
                </p>

                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <a href={DESIGN_URL} className="bg-[#0f1724] hover:bg-[#1f2734] text-white font-sans font-bold uppercase tracking-wide text-lg px-6 py-3 rounded-md shadow-md transition-transform transform hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30">DESIGN ONLINE</a>
                </div>
              </div>

              <div className="w-full">
                <VideoAuto src={`${BASE}how-it-works.mp4`} loop={true} ariaLabel="How it works video" className="w-full rounded-lg shadow-md block border-0" />
                <div className="mt-4">
                  <DesignPreview />
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ── Images ── */}
        <section id="images" className="bg-[#f8d7a1] py-8 full-bleed-lg">
          <div className="max-w-[1240px] mx-auto px-6">
            <h2 className="text-3xl lg:text-4xl font-normal leading-tight text-stone-900 text-center mb-4">
              Images
            </h2>
            <div className="prose max-w-none text-stone-700 mx-auto mb-6">
              <h3 className="text-center mb-4">Memorial Photo Options for Headstones and Memorials</h3>
              <p className="text-center text-stone-700 mb-6 max-w-3xl mx-auto leading-relaxed">Preserve cherished memories with a beautifully crafted memorial image designed to withstand the test of time. We offer a range of premium photographic solutions to complement headstones, plaques, monuments, and cremation memorials.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <a href={DESIGN_URL} aria-label="Design with Ceramic Image" className="group bg-white rounded-2xl p-6 shadow-lg min-h-[360px] flex flex-col justify-between hover:-translate-y-1 transform transition-shadow transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30">
                <img src={`${BASE}product-ceramic-image.jpg`} alt="Ceramic Image - fired at 1000°C" loading="lazy" className="mx-auto h-56 object-cover rounded-xl" />
                <div>
                  <h3 className="mt-4 text-xl text-stone-800 font-normal">Ceramic Images</h3>
                  <div className="mt-3 text-sm text-stone-700 text-left">
                    <p>Fired onto glazed ceramic at approximately <strong>1000°C</strong>; permanently fixed to the memorial face for a classic finish.</p>
                  </div>
                </div>
              </a>

              <a href={DESIGN_URL} aria-label="Design with Vitreous Enamel" className="group bg-white rounded-2xl p-6 shadow-lg min-h-[360px] flex flex-col justify-between hover:-translate-y-1 transform transition-shadow transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30">
                <img src={`${BASE}product-vitreous-enamel-image.jpg`} alt="Vitreous Enamel - fused glass coating" loading="lazy" className="mx-auto h-56 object-cover rounded-xl" />
                <div>
                  <h3 className="mt-4 text-xl text-stone-800 font-normal">Vitreous Enamel Images</h3>
                  <div className="mt-3 text-sm text-stone-700 text-left">
                    <p>Powdered glass fused at high temperature to a stainless plate for exceptional durability and weather resistance.</p>
                  </div>
                </div>
              </a>

              <a href={DESIGN_URL} aria-label="Design with Premium Plana" className="group bg-white rounded-2xl p-6 shadow-lg min-h-[360px] flex flex-col justify-between hover:-translate-y-1 transform transition-shadow transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30">
                <img src={`${BASE}plana.jpg`} alt="Premium Plana memorial" loading="lazy" className="mx-auto h-56 object-cover rounded-xl" />
                <div>
                  <h3 className="mt-4 text-xl text-stone-800 font-normal">Premium Plana Memorials</h3>
                  <div className="mt-3 text-sm text-stone-700 text-left">
                    <p>Contemporary, low-profile memorials ideal for lawn cemeteries and memorial gardens.</p>
                  </div>
                </div>
              </a>
            </div>

            <div className="mt-8 flex justify-center">
              <a href={DESIGN_URL} className="bg-[#0f1724] hover:bg-[#1f2734] text-white font-sans font-bold uppercase tracking-wide text-lg px-8 py-3 rounded-md shadow-md transition-transform transform hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30">DESIGN ONLINE</a>
            </div>

            <DesignPreview />

          </div>
        </section>


        {/* ── Motifs ── */}
        <section id="motifs" className="bg-white py-8 full-bleed-lg">
          <div className="max-w-[1240px] mx-auto px-6">
            <h2 className="text-2xl lg:text-3xl font-normal leading-snug text-stone-800 text-center mb-4">
              Motifs
            </h2>

            <p className="text-center text-stone-700 mb-4">Browse our motif categories and click a category to explore available motifs.</p>

            <p className="text-center text-stone-700 mb-6 max-w-3xl mx-auto leading-relaxed">Choose from a selection of <strong>5000+</strong> flat Motifs to personalise your Headstone, urn or ceramic Image. Motifs range from religious symbols to flora and fauna, borders and flourishes. Motifs have a minimum size to ensure visible detail. The cost of each Motif depends on its size, with <strong>gold and silver gilding</strong> costing a little more.</p>

            {/* Motif categories list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
              {[
                { id: 0, name: 'Aquatic', file: 'whale_002.png' },
                { id: 1, name: 'Birds', file: 'dove_002.png' },
                { id: 2, name: 'Butterflies', file: 'butterfly_005.png' },
                { id: 3, name: 'Cats', file: '2_056_04.png' },
                { id: 4, name: 'Dogs', file: '1_137_10.png' },
                { id: 5, name: 'Farm Animals', file: '1_138_12.png' },
                { id: 6, name: 'Horses', file: 'horse_009.png' },
                { id: 7, name: 'Insects', file: 'dragonfly_03.png' },
                { id: 8, name: 'Mythical Animals', file: '2_061_17.png' },
                { id: 9, name: 'Prehistoric', file: '1_135_02.png' },
                { id: 10, name: 'Reptiles', file: '1_173_05.png' },
                { id: 11, name: 'Wild Animals', file: '1_145_20.png' },
                { id: 12, name: 'Australian Wildlife', file: 'gecko_003.png' },
                { id: 13, name: 'Australian Flora', file: 'banksiarufa.png' },
                { id: 14, name: 'Architectural', file: '1_217_23.png' },
                { id: 15, name: 'Arrows', file: '1_207_07.png' },
                { id: 16, name: 'Borders', file: '1_018_10.png' },
                { id: 17, name: 'Cartoons', file: '1_055_01.png' },
                { id: 18, name: 'Corners', file: '1_208_03.png' },
                { id: 19, name: "Children's Toys", file: 'teddy-bear_003.png' },
                { id: 20, name: 'Ornaments', file: '1_011_09.png' },
                { id: 21, name: 'Flourishes', file: '2_139_07.png' },
                { id: 22, name: 'Flowers', file: 'flower rose_03.png' },
                { id: 24, name: 'Food & Drink', file: '2_117_01.png' },
                { id: 25, name: 'Hearts', file: '2_155_14.png' },
                { id: 26, name: 'History', file: '2_079_03.png' },
                { id: 27, name: 'Festivals', file: 'clover_001.png' },
                { id: 28, name: 'Household Items', file: '2_092_15.png' },
                { id: 29, name: 'Islander', file: '1_140_12.png' },
                { id: 30, name: 'Iconic Places', file: '2_111_05.png' },
                { id: 31, name: 'Moon & Stars', file: '2_082_17.png' },
                { id: 32, name: 'Music & Dance', file: '1_172_08.png' },
                { id: 33, name: 'Nautical', file: 'anchor_001.png' },
                { id: 34, name: 'Official', file: '1_127_06.png' },
                { id: 35, name: 'Pets', file: 'paw_001.png' },
                { id: 36, name: 'Plants & Trees', file: '1_158_16.png' },
                { id: 37, name: 'Religious', file: 'angel_001.png' },
                { id: 38, name: 'Shapes & Patterns', file: '2_147_09.png' },
                { id: 39, name: 'Skulls & Weapons', file: '1_061_07.png' },
                { id: 40, name: 'Sport & Fitness', file: '2_120_13.png' },
                { id: 41, name: 'Zodiac', file: 'zodiac_003.png' },
                { id: 42, name: 'Text', file: '2_172_21.png' },
                { id: 43, name: 'Tools, Office & Trades', file: '2_124_26.png' },
                { id: 44, name: 'Tribal', file: '1_206_16.png' },
                { id: 45, name: 'USA', file: '1_127_23.png' },
                { id: 46, name: 'Vehicles', file: '1_188_24.png' },
              ].map((cat) => (
                <button key={cat.id} className="flex flex-col items-center p-3 bg-white rounded shadow hover:shadow-md focus:outline-none">
                  <img src={`${BASE}motifs/${cat.file}`} alt={cat.name} className="w-20 h-20 object-contain" />
                  <div className="mt-2 text-sm text-stone-800 text-center">{cat.name}</div>
                </button>
              ))}
            </div>


            {/* Motif colours palette (solid swatches) */}
            <div className="mt-10 mx-auto flex flex-col items-center gap-y-2">
              <div className="flex gap-x-1 gap-y-2 mb-1 flex-wrap justify-center">
                {motifTop.map((c, i) => (
                  <button
                    key={`t-${i}`}
                    className="w-8 h-8 p-0 shadow-md rounded-sm flex items-center justify-center focus:outline-none m-1"
                    aria-label={c.name}
                    title={c.name}
                    style={{ backgroundColor: c.hex, border: '1px solid #999999' }}
                  />
                ))}
              </div>
              <div className="flex gap-x-1 gap-y-2 flex-wrap justify-center">
                {motifBottom.map((c, i) => (
                  <button
                    key={`b-${i}`}
                    className="w-8 h-8 p-0 shadow-md rounded-sm flex items-center justify-center focus:outline-none m-1"
                    aria-label={c.name}
                    title={c.name}
                    style={{ backgroundColor: c.hex, border: '1px solid #999999' }}
                  />
                ))}
              </div>
            </div>

            <DesignPreview />

            <div className="mt-8 flex justify-center">
              <a href={DESIGN_URL} className="inline-flex items-center justify-center bg-[#0f1724] hover:bg-[#1f2734] text-white font-sans font-bold uppercase tracking-wide text-base lg:text-xl px-6 lg:px-14 py-4 rounded-md shadow-md transition-transform transform hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b89a3e] focus-visible:ring-opacity-30 whitespace-nowrap">DESIGN ONLINE & SAVE</a>
            </div>

          </div>
        </section>

      </div>

       {/* ── Inscriptions ── */}
       <section id="inscriptions" className="bg-[#c8e4fb] py-10 full-bleed-lg">
         <div className="max-w-[1240px] mx-auto px-6">
           <h2 className="text-2xl lg:text-3xl font-normal leading-snug text-stone-800 text-center">Inscriptions</h2>
           <p className="text-center text-stone-700 mt-2 mb-6">Choose a font for inscriptions.</p>

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
             {Fonts.map((f) => (
               <div key={f} className="group text-left p-4 bg-white rounded-2xl shadow-sm ring-1 ring-stone-200">
                 <div className="text-2xl text-stone-900 mb-3" style={{ fontFamily: f }}>
                   Margaret Ann Cole
                 </div>
                 <div className="text-sm text-stone-600">{f}</div>
               </div>
             ))}
           </div>

         </div>
       </section>

        {/* ── Help / FAQ (above contact) ── */}
        <section id="help" className="bg-[#f8d7a1] py-12 full-bleed-lg">
          <div className="max-w-[960px] mx-auto px-6">
            <h2 className="text-2xl lg:text-3xl font-normal leading-snug text-stone-800 text-center">Help & FAQ</h2>
            <p className="text-center text-stone-700 mt-2 mb-6">Common questions and instructions to help you use the designer.</p>

            <div className="space-y-3">
              {helpFaqs.map((f, i) => (
                <div key={f.q} className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200 overflow-hidden">
                  <button type="button" onClick={() => setOpenIndex(openIndex === i ? null : i)} aria-expanded={openIndex === i} className="w-full px-5 py-4 text-left flex items-center justify-between focus:outline-none cursor-pointer">
                    <span className="text-lg font-semibold text-stone-800">{f.q}</span>
                    <span className="text-stone-500 text-xl">{openIndex === i ? '−' : '+'}</span>
                  </button>
                  {openIndex === i && (
                    <div className="px-5 pb-5 text-sm text-stone-700" dangerouslySetInnerHTML={{ __html: f.a }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact Form (above footer) ── */}
        <section id="contact" className="bg-white py-12 full-bleed-lg">
          <div className="max-w-[760px] mx-auto px-6">
            <h2 className="text-2xl lg:text-3xl font-normal leading-snug text-stone-800 text-center">Contact Us</h2>
            <p className="text-center text-stone-700 mt-2 mb-6">Questions about a product, custom requests, or help with your order? Send a message using the form below and we'll get back to you.</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const fd = new FormData(form);
              const name = String(fd.get('name') || '');
              const email = String(fd.get('email') || '');
              const phone = String(fd.get('phone') || '');
              const message = String(fd.get('message') || '');
              const subject = encodeURIComponent(`Discount Headstones enquiry from ${name}`);
              const body = encodeURIComponent([
                `Name: ${name}`,
                `Email: ${email}`,
                `Phone: ${phone || 'Not provided'}`,
                '',
                message
              ].join('\n'));
              window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
              form.reset();
            }} className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="name" type="text" required placeholder="Full name" aria-label="Full name" className="w-full px-4 py-3 rounded-md border border-stone-200" />
                <input name="email" type="email" required placeholder="Email address" aria-label="Email address" className="w-full px-4 py-3 rounded-md border border-stone-200" />
              </div>
              <input name="phone" type="tel" placeholder="Phone (optional)" aria-label="Phone" className="w-full px-4 py-3 rounded-md border border-stone-200" />
              <textarea name="message" rows={6} required placeholder="Your message" aria-label="Message" className="w-full px-4 py-3 rounded-md border border-stone-200" />
              <div className="text-center">
                <button type="submit" className="bg-[#0f1724] text-white px-6 py-3 rounded-md font-semibold cursor-pointer">Send Message</button>
              </div>
            </form>
          </div>
        </section>

        {/* Privacy summary */}
        <section id="privacy" className="bg-[#c8e4fb] py-10 full-bleed-lg">
          <div className="max-w-[960px] mx-auto px-6">
            <h2 className="text-2xl lg:text-3xl font-normal leading-snug text-stone-800 text-center">Privacy Policy</h2>
            <div className="mt-4 space-y-4 text-stone-700 leading-relaxed">
              <p>Discount Headstones collects contact details and order information only to answer enquiries, prepare quotes, process memorial designs, and support customer orders.</p>
              <p>Information submitted through the contact form or online designer is used for service delivery and customer support. We do not sell personal information.</p>
              <p>For privacy questions or data access requests, contact <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-stone-900">{CONTACT_EMAIL}</a>.</p>
            </div>
          </div>
        </section>

      {/* ── Footer ── full structured footer */}
      <footer className="w-full bg-[#0f1724] text-white py-12">
        <div className="max-w-[1240px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-3">Discount Headstones</h4>
            <p className="text-sm text-stone-200 leading-relaxed">Affordable, respectful memorials crafted with care. Design online or contact our support team to help with bespoke requests.</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="text-sm text-stone-200 space-y-2">
              <li><a href="#shapes" className="hover:text-white">Shapes &amp; Granites</a></li>
              <li><a href="#images" className="hover:text-white">Images</a></li>
              <li><a href="#motifs" className="hover:text-white">Motifs</a></li>
              <li><a href="#inscriptions" className="hover:text-white">Inscriptions</a></li>
              <li><a href="#privacy" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Contact</h4>
            <div className="text-sm text-stone-200 space-y-2">
              <div>Discount Headstones</div>
              <div>Phone: <a href={CONTACT_PHONE_HREF} className="hover:text-white">{CONTACT_PHONE_DISPLAY}</a></div>
              <div>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">{CONTACT_EMAIL}</a></div>
              <div>Mon-Fri 9:00-17:00</div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-700 pt-6">
          <div className="max-w-[1240px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-stone-400">
            <div>© {new Date().getFullYear()} Discount Headstones. All rights reserved.</div>
            <div className="mt-3 md:mt-0">Designed with care — <a href="#home" className="hover:text-white">Back to Top</a></div>
          </div>
        </div>
      </footer>

    </div>
  );
}
