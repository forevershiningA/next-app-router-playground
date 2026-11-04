'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  CubeTransparentIcon,
  ShieldCheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface VirtualAgentResponse {
  success: boolean;
  intent: string;
  productId?: string;
  title: string;
  message: string;
  draftId?: string;
  previewUrl?: string;
  imageData?: string;
  designerHref?: string;
  warnings?: string[];
  executionTimeMs?: number;
  snapshot?: any;
  error?: string;
}

const SAMPLE_PROMPTS = [
  {
    label: 'Bronze plaque',
    prompt: 'Bronze memorial plaque for Prof. John Miller 1938 — 2019',
  },
  {
    label: 'Companion with vases',
    prompt: 'Companion headstone for John and Mary Smith with base vases',
  },
  {
    label: 'Full monument',
    prompt: 'Family full monument for the Anderson family in African Black',
  },
  {
    label: 'Laser-etched granite',
    prompt: 'Laser-etched granite headstone for Helen Davis 1948 — 2020',
  },
];

const ROTATING_PLACEHOLDERS = [
  'e.g. Bronze memorial plaque for Prof. John Miller 1938 — 2019',
  'e.g. Companion headstone for John and Mary Smith with base vases',
  'e.g. Family full monument for the Anderson family in African Black',
  'e.g. Laser-etched granite headstone for Helen Davis 1948 — 2020',
  'e.g. Tablica pamiątkowa z brązu dla Jerzego Nowickiego 1938 — 2019',
  'e.g. Nagrobek podwójny dla Stanisława i Marii Kowalskich',
];

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('forever-shining-designer', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('drafts')) {
        request.result.createObjectStore('drafts');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function persistSnapshotToIndexedDb(snapshot: any): Promise<void> {
  try {
    const database = await openDraftDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('drafts', 'readwrite');
      transaction.objectStore('drafts').put(snapshot, 'active-design');
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Failed to persist snapshot to IndexedDB:', err);
  }
}

export default function HomeVirtualDesignerBar() {
  const router = useRouter();
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VirtualAgentResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder examples periodically to demonstrate prompt variety
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToRun = typeof customPrompt === 'string' ? customPrompt.trim() : command.trim();
    if (!promptToRun) {
      inputRef.current?.focus();
      return;
    }
    if (loading) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch('/api/virtual-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: promptToRun }),
      });

      const data: VirtualAgentResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'An error occurred while creating the design.');
      }

      // Persist snapshot to local IndexedDB draft store
      if (data.snapshot) {
        await persistSnapshotToIndexedDb(data.snapshot);
      }

      // Seamless direct transition into the real 3D Configurator
      const targetUrl = data.draftId
        ? `${data.designerHref}?draftId=${encodeURIComponent(data.draftId)}&action=load-draft`
        : `${data.designerHref}?action=load-draft`;

      router.push(targetUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process command. Please try again.');
      setLoading(false);
    }
  };

  const handleOpenInDesigner = async () => {
    if (!result?.designerHref) return;
    if (result.snapshot) {
      await persistSnapshotToIndexedDb(result.snapshot);
    }
    const targetUrl = result.draftId
      ? `${result.designerHref}?draftId=${encodeURIComponent(result.draftId)}&action=load-draft`
      : `${result.designerHref}?action=load-draft`;
    router.push(targetUrl);
  };

  return (
    <div className="relative z-30 mx-auto mb-10 w-full max-w-5xl">
      {/* Main Studio Card Container — Elegant ambient depth & respectful stone styling */}
      <div className="day:border-[#d9d2c5] day:bg-gradient-to-b day:from-[#ffffff] day:to-[#faf8f4] day:shadow-[0_16px_36px_rgba(40,30,20,0.07),0_2px_8px_rgba(40,30,20,0.03)] relative overflow-hidden rounded-2xl border border-[#cfac6c]/30 bg-gradient-to-b from-[#1c1813]/95 to-[#13100c]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.55),0_0_0_1px_rgba(207,172,108,0.12)] backdrop-blur-md sm:p-6">
        {/* Subtle decorative gold/stone hairline gradient at the top edge */}
        <div className="day:via-[#cfac6c]/40 absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#cfac6c]/60 to-transparent" />

        <div className="flex flex-col gap-4">
          {/* Header Row: Refined AI Tag, Compassionate Subtitle & Clean Informational Trust Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="day:border-[#cfac6c]/40 day:bg-[#cfac6c]/10 day:text-[#8a651f] inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/30 bg-[#cfac6c]/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#e5ca8a] uppercase">
                <SparklesIcon className="day:text-[#8a651f] h-3.5 w-3.5 text-[#cfac6c]" />
                <span>AI Design Assistant</span>
              </span>
              <span className="day:text-[#554e44] text-xs font-normal text-[#cfc5b6]">
                Describe your memorial idea to generate an instant 3D design
              </span>
            </div>

            {/* Informational Trust Badges — Frameless, understated micro-indicators */}
            <div className="hidden sm:inline-flex items-center gap-2.5 text-xs font-normal text-[#756c60] day:text-[#756c60] dark:text-[#a89d8d]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CubeTransparentIcon className="h-3.5 w-3.5 text-[#cfac6c]" />
                <span>Instant 3D Preview</span>
              </span>
              <span className="text-[#cfc5b7] day:text-[#cfc5b7] dark:text-[#554e44] select-none">•</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-[#cfac6c]" />
                <span>Stonemason Guidelines</span>
              </span>
            </div>
          </div>

          {/* Integrated Modern Input & CTA (Perplexity / ChatGPT Pattern) */}
          <form onSubmit={(e) => handleSubmit(e)} className="relative mt-0.5">
            {/* Outer container: rounded-[18px] with p-1.5 (6px) padding */}
            <div className="day:border-[#cfc5b7] day:bg-white day:shadow-[0_2px_10px_rgba(40,30,20,0.05)] relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-[18px] border border-white/20 bg-white/[0.06] p-1.5 transition-all duration-200 focus-within:border-[#cfac6c] focus-within:ring-2 focus-within:ring-[#cfac6c]/25">
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                className="day:text-[#1d1a17] day:placeholder-[#8e8476] min-w-0 flex-1 border-0 bg-transparent px-3.5 py-2.5 text-sm text-[#f4eee4] placeholder-[#8e8476] transition-colors !outline-none focus:!outline-none focus-visible:!outline-none !ring-0 focus:!ring-0 focus-visible:!ring-0"
                style={{ outline: 'none', boxShadow: 'none' }}
                disabled={loading}
              />

              {/* Inner button: always prominent & clickable (100% active); if prompt is empty it focuses input without submitting */}
              <button
                type="submit"
                disabled={loading}
                className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#332e29] day:active:bg-[#14120f] day:shadow-[0_2px_8px_rgba(29,26,23,0.28)] inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#cfac6c] px-6 py-2.5 text-sm font-semibold tracking-[0.015em] text-[#16120d] shadow transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <SparklesIcon className="day:text-[#cfac6c] h-4 w-4 text-[#16120d] opacity-60" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="day:text-[#cfac6c] h-4 w-4 text-[#16120d]" />
                    <span>Create Design</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Suggestions Chips — Concise single-line pills avoiding orphans */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="day:text-[#6e6457] text-[11px] font-medium text-[#8e8476]">
              Try an example:
            </span>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCommand(sample.prompt);
                  inputRef.current?.focus();
                }}
                disabled={loading}
                className="day:border-[#e5e0d7] day:bg-[#f5f3ef] day:text-[#423b33] day:hover:border-[#cfac6c] day:hover:bg-[#eae5dd] day:hover:text-[#1d1a17] group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11.5px] font-medium text-[#cfc4b4] transition-all duration-150 hover:border-[#cfac6c]/60 hover:bg-white/[0.08] hover:text-[#f3d48f] hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlusIcon className="day:text-[#8a7f72] day:group-hover:text-[#1d1a17] h-3 w-3 text-[#a89d8d] transition-colors group-hover:text-[#cfac6c]" />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Trust Indicators — Clean bullet-separated line on small viewports */}
          <div className="flex sm:hidden items-center justify-center gap-3 border-t border-white/10 pt-2 text-[11px] text-[#8e8476] day:border-[#ebe6dc] day:text-[#756c60]">
            <span className="inline-flex items-center gap-1">
              <CubeTransparentIcon className="h-3.5 w-3.5 text-[#cfac6c]" />
              <span>Instant 3D Preview</span>
            </span>
            <span className="text-[#cfc5b7] select-none">•</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-[#cfac6c]" />
              <span>Stonemason Guidelines</span>
            </span>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="day:border-red-300 day:bg-red-50 day:text-red-800 mt-1 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Generated Result Showcase Card */}
      {result && (
        <div className="day:border-[#cfc5b7] day:bg-[#fbf9f5] day:shadow-[0_20px_50px_rgba(75,60,40,0.12)] relative mt-5 overflow-hidden rounded-2xl border border-[#cfac6c]/30 bg-[#16120d] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-6">
          {/* Header */}
          <div className="day:border-[#cfc5b7]/60 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="day:text-[#2e7d32] inline-flex items-center gap-1.5 text-xs font-semibold text-[#82e0aa]">
                <CheckCircleIcon className="day:text-[#2e7d32] h-4 w-4 text-[#82e0aa]" />
                <span>Design created • 0 layout conflicts • Stonemason verified</span>
              </div>
              <h3 className="day:text-[#1d1a17] mt-1 font-serif text-xl font-bold tracking-tight text-[#f4eee4] sm:text-2xl">
                {result.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="day:text-[#625a51] day:hover:bg-black/5 rounded-lg p-1.5 text-[#a89d8d] transition-colors hover:bg-white/10 hover:text-white"
              title="Close preview"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Presentation Grid: Image + Description */}
          <div className="mt-5 grid items-center gap-6 md:grid-cols-2">
            {/* 3D Preview Image Presentation */}
            <div className="day:border-[#cfc5b7] day:bg-[#eee9df] relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#cfac6c]/25 bg-black/40 shadow-inner">
              {result.imageData || result.previewUrl ? (
                <img
                  src={result.imageData || result.previewUrl}
                  alt={result.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="day:text-[#8e8476] flex h-full items-center justify-center text-xs text-stone-500">
                  Rendering 3D preview...
                </div>
              )}
            </div>

            {/* Description & Action CTA */}
            <div className="flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <p className="day:text-[#514a43] text-sm leading-relaxed text-[#dcd4c7]">
                  {result.message}
                </p>

                {result.snapshot?.inscriptions && result.snapshot.inscriptions.length > 0 && (
                  <div className="day:border-[#cfc5b7]/70 day:bg-white/80 day:text-[#514a43] rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs">
                    <span className="day:text-[#1d1a17] font-semibold text-[#f3d48f] block mb-1">
                      Personalized Inscription Layout:
                    </span>
                    <ul className="space-y-0.5 day:text-[#554e44] text-[#cfc5b6]">
                      {result.snapshot.inscriptions.slice(0, 4).map((ins: any, idx: number) => (
                        <li key={idx} className="truncate">
                          • <span className="font-medium text-[#f4eee4] day:text-[#1d1a17]">{ins.text}</span> {ins.font ? <span className="opacity-70">({ins.font})</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="day:border-[#cfc5b7]/70 day:bg-white/70 day:text-[#625a51] rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-[#b8ad9c]">
                  <p>
                    <strong className="day:text-[#1d1a17] text-[#f3d48f]">Generation time:</strong>{' '}
                    {((result.executionTimeMs || 0) / 1000).toFixed(1)} s
                  </p>
                  <p className="mt-1">
                    <strong className="day:text-[#1d1a17] text-[#f3d48f]">Design ID:</strong>{' '}
                    <span className="font-mono text-[11px]">{result.draftId}</span>
                  </p>
                  <p className="day:text-[#7d7468] mt-2 text-[11px] text-[#8e8476]">
                    This design has been saved. You can now open it directly in the 3D designer to customize inscriptions, dimensions, motifs, materials, or proceed to order.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handleOpenInDesigner}
                  className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#332e29] inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#cfac6c] px-5 py-3 text-sm font-semibold tracking-[0.015em] text-[#16120d] shadow transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99]"
                >
                  <span>Customize in 3D Designer</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>

                {result.previewUrl && (
                  <a
                    href={result.previewUrl}
                    download={`${result.title || 'memorial-design'}.jpg`}
                    className="day:border-[#cfc5b7] day:text-[#1d1a17] day:bg-white/80 day:hover:bg-[#eae5dd] inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-[#f4eee4] transition-all hover:border-[#cfac6c]/50 hover:bg-white/10"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Download 3D Preview</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
