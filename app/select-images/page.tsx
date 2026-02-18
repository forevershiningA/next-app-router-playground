'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const IMAGE_TYPES = [
  {
    id: '21',
    title: 'Granite Image',
    surface: 'Laser-etched on polished black granite',
    highlight: 'Free-form mask + flexible sizing',
    status: 'Perfect for modern memorials',
  },
  {
    id: '7',
    title: 'Ceramic Portrait',
    surface: 'High-gloss ceramic inlay',
    highlight: 'Fixed aspect ratio, vivid color',
    status: 'Most popular with photo backgrounds',
  },
  {
    id: '2300',
    title: 'Vitreous Enamel',
    surface: 'Porcelain enamel baked at 800°C',
    highlight: 'Museum-grade durability',
    status: 'Brilliant whites, no fading outdoors',
  },
  {
    id: '2400',
    title: 'Premium Plana',
    surface: 'Ultra-flat plana plaque',
    highlight: 'Subtle sheen, beveled edge',
    status: 'Pairs nicely with bronze plaques',
  },
  {
    id: '135',
    title: 'YAG Laser Image',
    surface: 'Fine-line YAG engraving',
    highlight: 'Sharper blacks on dense stone',
    status: 'Ideal for scripture tablets',
  },
];

const WORKFLOW_STEPS = [
  {
    step: 'Step 01',
    title: 'Choose your image style',
    detail: 'Match the surface to your stone or plaque so colors and finishes feel intentional.',
    badge: 'Ready today',
  },
  {
    step: 'Step 02',
    title: 'Upload & check quality',
    detail: '5 MB max • JPG / PNG • we recommend 300 dpi scans for vintage photos.',
    badge: 'Auto checks run instantly',
  },
  {
    step: 'Step 03',
    title: 'Crop with guided masks',
    detail: 'Seven masks plus free-form granite cropping. Rotate, flip, and re-center with one finger.',
    badge: 'Crop canvas in QA',
  },
  {
    step: 'Step 04',
    title: 'Place on the memorial',
    detail: 'Images inherit the headstone plane and move with the scene rotation just like motifs.',
    badge: 'Placement coming next',
  },
];

const MASK_SHAPES = [
  'Circle Portrait',
  'Horizontal Oval',
  'Rectangle Portrait',
  'Rectangle Landscape',
  'Heart',
  'Teardrop',
  'Triangle',
];

const CARE_NOTES = [
  'We keep copies of the original upload + your crop data for easy reorders.',
  'Final renders include subtle drop shadows so ceramic edges feel embedded.',
  'Color modes ship exactly as previewed: Full Color, Black & White, or Sepia tone.',
];

export default function Page() {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showMobileView = pathname === '/select-images' && !isDesktop;

  if (!showMobileView) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-16">
      <div className="space-y-8 px-4 pt-6">
        <section className="rounded-3xl border border-white/5 bg-gradient-to-b from-[#2b1b11] via-[#1a120c] to-[#0b0907] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Guided Step · 02 Design</p>
          <h1 className="mt-2 text-3xl font-serif text-white">Add Your Image</h1>
          <p className="mt-3 text-sm text-white/70">
            Upload a treasured portrait, crop it with our guided masks, then place it exactly where you want it on the headstone.
            This view gives you the same controls we ship in the sidebar, but formatted for phones and tablets.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-2xl font-semibold text-white">5</p>
              <p className="text-xs uppercase tracking-wide text-white/60">Image surfaces</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-2xl font-semibold text-white">7</p>
              <p className="text-xs uppercase tracking-wide text-white/60">Guided masks</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-2xl font-semibold text-white">3</p>
              <p className="text-xs uppercase tracking-wide text-white/60">Color modes</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-2xl font-semibold text-white">5 MB</p>
              <p className="text-xs uppercase tracking-wide text-white/60">Upload ceiling</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Image Surfaces</p>
              <h2 className="text-lg font-semibold text-white">Choose how your portrait is produced</h2>
            </div>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">Preview mode</span>
          </div>
          <div className="grid gap-4">
            {IMAGE_TYPES.map((type) => (
              <article
                key={type.id}
                className="rounded-3xl border border-white/10 bg-[#111111] p-4 shadow-inner shadow-black/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">ID {type.id}</p>
                    <h3 className="text-lg font-semibold text-white">{type.title}</h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{type.status}</span>
                </div>
                <p className="mt-3 text-sm text-white/70">{type.surface}</p>
                <div className="mt-4 rounded-2xl border border-[#d7b356]/30 bg-[#d7b356]/5 p-3 text-xs text-[#f3d48b]">
                  {type.highlight}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Workflow</p>
              <h2 className="text-lg font-semibold text-white">Everything happens in four gentle steps</h2>
            </div>
            <span className="text-xs text-white/60">All touch friendly</span>
          </div>
          <div className="space-y-3">
            {WORKFLOW_STEPS.map((step) => (
              <article key={step.step} className="rounded-3xl border border-white/5 bg-white/2 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{step.step}</p>
                    <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/70">{step.badge}</span>
                </div>
                <p className="mt-3 text-sm text-white/65">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Mask Gallery</p>
              <h2 className="text-lg font-semibold text-white">Seven shapes, all mirrored here</h2>
            </div>
            <span className="text-xs text-white/60">Tap any mask in the sidebar</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MASK_SHAPES.map((mask) => (
              <div
                key={mask}
                className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-4 text-center text-sm text-white/80"
              >
                <div className="mx-auto mb-2 h-10 w-10 rounded-full border border-white/20 bg-white/5" />
                {mask}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Care Notes</p>
            <h2 className="text-lg font-semibold text-white">What happens behind the scenes</h2>
          </div>
          <div className="space-y-3">
            {CARE_NOTES.map((note) => (
              <div key={note} className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-4 text-sm text-white/70">
                {note}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
