'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/outline';

import { getAllSavedDesigns, SavedDesignMetadata } from '#/lib/saved-designs-data';
import { data } from '#/app/_internal/_data';
import { applyDesignSnapshot } from '#/lib/project-serializer';

type DesignStatus = 'awaiting-approval' | 'ready-to-order' | 'in-production' | 'completed' | 'draft';

const statusMeta: Record<DesignStatus, { primaryAction: string }> = {
  'awaiting-approval': {
    primaryAction: 'Review proof',
  },
  'ready-to-order': {
    primaryAction: 'Place order',
  },
  'in-production': {
    primaryAction: 'Track order',
  },
  completed: {
    primaryAction: 'Reorder design',
  },
  draft: {
    primaryAction: 'Edit design',
  },
};

const commentInstructions = 'Add engraving notes or approval comments before submitting your order.';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

type AccountDesignCard = {
  id: string;
  title: string;
  priceLabel: string;
  createdLabel: string;
  relativeUpdated: string;
  preview: string;
  fullScreenshot?: string;
  description: string;
  productName: string;
  status: DesignStatus;
  primaryActionLabel: string;
  destinationUrl: string;
  htmlQuotePath?: string;
};

// ─── Login / Register gate ────────────────────────────────────────────────────

function AuthGate({ onLogin }: { onLogin: (email: string) => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (tab === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Login failed');
      else {
        window.dispatchEvent(new Event('session-changed'));
        onLogin(email);
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full rounded-lg bg-white/5 border border-white/15 px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4A84F]/60 focus:ring-1 focus:ring-[#D4A84F]/30 transition-colors';

  return (
    <div className="relative min-h-screen bg-[#050301] text-white flex items-center justify-center px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white">My Account</h1>
          <p className="text-white/40 text-sm mt-1">Forever Shining Memorial Designs</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-[#D4A84F] text-[#1a0f05]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {t === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputCls} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className={inputCls} placeholder="••••••••" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
          </div>
          {tab === 'register' && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">Confirm Password</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls} placeholder="••••••••" autoComplete="new-password" />
            </div>
          )}

          {error && (
            <p className="text-red-400/80 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-[#D4A84F] text-[#1a0f05] font-semibold text-sm hover:bg-[#e8bc5e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-white/30 text-xs mt-8">
          Need help?{' '}
          <a href="mailto:support@forevershining.com" className="text-[#D4A84F]/70 hover:text-[#D4A84F]">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyAccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ email: string } | null | undefined>(undefined);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  async function handleEdit(cardId: string) {
    setLoadingEditId(cardId);
    try {
      const res = await fetch(`/api/projects/${cardId}`);
      if (!res.ok) throw new Error();
      const body = await res.json();
      const snapshot = {
        ...body.project.designState,
        metadata: {
          ...body.project.designState?.metadata,
          currentProjectId: body.project.id,
          currentProjectTitle: body.project.title,
        },
      };
      await applyDesignSnapshot(snapshot);
      router.push('/select-size');
    } catch {
      alert('Failed to load design. Please try again.');
      setLoadingEditId(null);
    }
  }

  // Close overflow menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      }
    }
    checkSession();

    function onSessionChanged() { checkSession(); }
    window.addEventListener('session-changed', onSessionChanged);
    return () => window.removeEventListener('session-changed', onSessionChanged);
  }, []);

  useEffect(() => {
    async function fetchSavedProjects() {
      try {
        const response = await fetch('/api/projects?limit=20');
        if (response.ok) {
          const data = await response.json();
          setSavedProjects(data.projects || []);
        }
      } catch (error) {
        // silently ignore
      } finally {
        setIsLoading(false);
      }
    }
    if (session) fetchSavedProjects();
    else if (session === null) setIsLoading(false);
  }, [session]);

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Delete this design? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/projects?id=${cardId}`, { method: 'DELETE' });
      if (res.ok) setSavedProjects((prev) => prev.filter((p) => p.id !== cardId));
    } catch { alert('Failed to delete. Please try again.'); }
    setOpenMenuId(null);
  };

  const allDesigns = getAllSavedDesigns();
  
  // Convert API projects to design cards
  const projectCards = savedProjects.map((project) => buildProjectCard(project));
  
  // Merge with static designs
  const designCards = buildDesignCards(allDesigns);
  const allCards = [...projectCards, ...designCards];
  const cards = allCards.length ? allCards : getFallbackCards();
  const visibleCards = cards.filter((card) => card.status !== 'awaiting-approval');

  // Still checking session
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#050301] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#D4A84F]/30 border-t-[#D4A84F] animate-spin" />
      </div>
    );
  }

  // Not logged in — show login/register gate
  if (session === null) {
    return <AuthGate onLogin={(email) => setSession({ email })} />;
  }

  return (
    <div className="relative min-h-screen bg-[#050301] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-7xl px-10 py-10">
        <section
          className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-10 py-6 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          aria-labelledby="saved-designs-heading"
        >
          <header className="mb-6 border-b border-white/5 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="saved-designs-heading" className="text-3xl font-semibold tracking-tight">
                  Saved Designs
                </h2>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/70">
                  <UserCircleIcon className="h-5 w-5 text-white/60" aria-hidden />
                  {session.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/my-account/details"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  <UserCircleIcon className="h-4 w-4 text-white/60" aria-hidden />
                  Account Details
                </Link>
                <Link
                  href="/my-account/invoice"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  <UserCircleIcon className="h-4 w-4 text-white/60" aria-hidden />
                  Invoice Details
                </Link>
              </div>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCards.map((card) => {
              return (
                <article
                  key={card.id}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-sm"
                >
                  {/* Preview Image */}
                  <div className="mb-4">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/50">
                      <img
                        src={card.preview}
                        alt={card.title}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Card Header */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <div className="mt-1 flex items-center justify-between text-sm text-white/70">
                      <span className="font-medium text-[#D4A84F]">{card.priceLabel}</span>
                      <span className="text-white/50">{card.relativeUpdated}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-4 flex-1 text-sm text-white/75 line-clamp-2">
                    {card.description}
                  </p>

                  {/* Action Buttons: Buy | Edit | More */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/my-account/designs/${card.id}/buy`}
                      className="rounded-lg px-4 py-2 text-xs font-medium text-black transition cursor-pointer text-center"
                      style={{ backgroundColor: '#D4A84F' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#C49940')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#D4A84F')}
                    >
                      Buy
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEdit(card.id)}
                      disabled={loadingEditId === card.id}
                      className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 cursor-pointer disabled:opacity-50"
                    >
                      {loadingEditId === card.id ? 'Loading…' : 'Edit'}
                    </button>
                    <Link
                      href={`/my-account/designs/${card.id}`}
                      className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 cursor-pointer text-center"
                    >
                      More
                    </Link>
                    <div className="relative ml-auto" ref={openMenuId === card.id ? menuRef : null}>
                      <button
                        type="button"
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white transition hover:bg-white/10 cursor-pointer"
                        onClick={() => setOpenMenuId(openMenuId === card.id ? null : card.id)}
                        aria-label="More options"
                      >
                        ⋮
                      </button>
                      {openMenuId === card.id && (
                        <div className="absolute right-0 bottom-full mb-1 z-50 w-48 rounded-xl border border-white/10 bg-[#1a1208] shadow-2xl overflow-hidden">
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/10 transition"
                            onClick={async () => {
                              setOpenMenuId(null);
                              try {
                                await navigator.clipboard.writeText(window.location.origin + `/my-account/designs/${card.id}`);
                                alert('Link copied to clipboard');
                              } catch { alert('Could not copy link'); }
                            }}
                          >
                            🔗 Copy Link
                          </button>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/10 transition"
                            onClick={() => { setOpenMenuId(null); alert('Email share coming soon'); }}
                          >
                            ✉️ Email
                          </button>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-xs text-white/60 hover:bg-white/10 transition"
                            onClick={() => { setOpenMenuId(null); const u = window.location.origin + `/my-account/designs/${card.id}`; window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`, '_blank', 'width=600,height=400'); }}
                          >
                            Facebook
                          </button>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-xs text-white/60 hover:bg-white/10 transition"
                            onClick={() => { setOpenMenuId(null); const u = window.location.origin + `/my-account/designs/${card.id}`; window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent('Check out my memorial design: ' + card.title)}`, '_blank', 'width=600,height=400'); }}
                          >
                            Twitter / X
                          </button>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-xs text-white/60 hover:bg-white/10 transition"
                            onClick={() => { setOpenMenuId(null); const u = window.location.origin + `/my-account/designs/${card.id}`; window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`, '_blank', 'width=600,height=400'); }}
                          >
                            LinkedIn
                          </button>
                          <div className="border-t border-white/10" />
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/10 transition"
                            onClick={async () => {
                              setOpenMenuId(null);
                              try {
                                const { generateDesignPDF } = await import('#/lib/pdf-generator');
                                await generateDesignPDF({
                                  title: card.title,
                                  screenshot: card.preview,
                                  priceLabel: card.priceLabel,
                                  createdLabel: card.createdLabel,
                                  description: card.description,
                                  productName: card.productName,
                                });
                              } catch { alert('Failed to generate PDF. Please try again.'); }
                            }}
                          >
                            Download PDF
                          </button>
                          <div className="border-t border-white/10" />
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
            {!visibleCards.length && !isLoading && (
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                No saved designs available yet. Start a new design to see it here.
              </div>
            )}
            {isLoading && (
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                Loading your saved designs...
              </div>
            )}
          </div>

        </section>
      </div>
    </div>
  );
}

function buildProjectCard(project: any): AccountDesignCard {
  const createdDate = new Date(project.createdAt);
  const updatedDate = new Date(project.updatedAt);
  
  // Get screenshot and thumbnail paths
  const thumbnail = project.thumbnailPath || project.screenshotPath || '/screen.png';
  const fullScreenshot = project.screenshotPath || '/screen.png';
  
  // Get product name from productId
  const productId = project.designState?.productId;
  console.log('Full designState:', project.designState);
  console.log('Product lookup:', { productId, hasProducts: !!data.products, productsCount: data.products?.length });
  const product = productId ? data.products.find(p => p.id === productId) : null;
  console.log('Found product:', product);
  const productName = product?.name || 'Custom memorial design';
  console.log('Final productName:', productName);
  
  return {
    id: project.id,
    title: project.title || 'Untitled Design',
    productName: productName,
    priceLabel: project.totalPriceCents 
      ? currencyFormatter.format(project.totalPriceCents / 100)
      : 'Price TBD',
    createdLabel: formatDate(createdDate),
    relativeUpdated: formatRelativeTime(updatedDate),
    preview: thumbnail,
    fullScreenshot: fullScreenshot,
    htmlQuotePath: `/saved-designs/html/${new Date(project.createdAt).getFullYear()}/${String(new Date(project.createdAt).getMonth() + 1).padStart(2, '0')}/design_${project.id}.html`,
    description: buildProjectDescription(project),
    status: (project.status || 'draft') as DesignStatus,
    primaryActionLabel: statusMeta[(project.status || 'draft') as DesignStatus].primaryAction,
    destinationUrl: `/select-product?projectId=${project.id}`, // Load design back into editor
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function buildProjectDescription(project: any): string {
  const inscriptions = project.designState?.inscriptions || [];
  if (inscriptions.length > 0) {
    const texts = inscriptions.map((i: any) => i.text).filter(Boolean);
    if (texts.length > 0) {
      return truncateText(decodeHtmlEntities(texts.join(' • ')), 140);
    }
  }
  return 'Custom memorial design';
}

function formatDate(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatRelativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, ms] of divisions) {
    if (Math.abs(diffMs) >= ms || unit === 'minute') {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }

  return 'just now';
}

function buildDesignCards(designs: SavedDesignMetadata[]): AccountDesignCard[] {
  return designs
    .slice()
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
    .slice(0, 9)
    .map((design, index) => {
      const status = deriveDesignStatus(design);
      const statusInfo = statusMeta[status];
      return {
        id: design.id,
        title: design.title || design.productName,
        productName: design.productName,
        priceLabel: computePriceLabel(design, index),
        createdLabel: formatCreatedLabel(design.id),
        relativeUpdated: formatRelativeUpdated(design.id),
        preview: normalizePreview(design.preview),
        description: composeDescription(design),
        status,
        primaryActionLabel: statusInfo.primaryAction,
        destinationUrl: buildDesignDestination(design),
      };
    });
}

function deriveDesignStatus(design: SavedDesignMetadata): DesignStatus {
  const tailDigits = Number(design.id.slice(-2));

  if ((design.hasMotifs || design.hasAdditions) && design.inscriptionCount >= 1) {
    return 'awaiting-approval';
  }

  if (design.inscriptionCount >= 6) {
    return 'ready-to-order';
  }

  if (design.hasPhoto) {
    return 'in-production';
  }

  if (Number.isFinite(tailDigits)) {
    if (tailDigits % 4 === 0) return 'awaiting-approval';
    if (tailDigits % 4 === 1) return 'ready-to-order';
    if (tailDigits % 4 === 2) return 'in-production';
  }

  return 'completed';
}

function formatRelativeUpdated(id: string): string {
  const timestamp = Number(id);
  if (!Number.isFinite(timestamp)) {
    return 'recently updated';
  }

  const diffMs = timestamp - Date.now();
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, ms] of divisions) {
    if (Math.abs(diffMs) >= ms || unit === 'minute') {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }

  return 'just now';
}

function buildDesignDestination(design: SavedDesignMetadata): string {
  if (design.productSlug && design.slug) {
    return `/designs/${design.productSlug}/${design.slug}?designId=${design.id}`;
  }
  return `/designs?designId=${design.id}`;
}

function composeDescription(design: SavedDesignMetadata): string {
  if (design.inscriptions && design.inscriptions.trim().length > 0) {
    return truncateText(decodeHtmlEntities(design.inscriptions.trim()), 140);
  }

  return commentInstructions;
}

function formatCreatedLabel(id: string): string {
  const timestamp = Number(id);

  if (!Number.isFinite(timestamp)) {
    return '—';
  }

  const date = new Date(timestamp);
  const pad = (value: number) => value.toString().padStart(2, '0');

  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function computePriceLabel(design: SavedDesignMetadata, index: number): string {
  const baseMap: Record<SavedDesignMetadata['productType'], number> = {
    headstone: 3200,
    plaque: 780,
    monument: 5200,
  };

  const base = baseMap[design.productType] ?? 1200;
  const variationSeed = Number(design.id.slice(-3));
  const variation = Number.isFinite(variationSeed) ? variationSeed * 3 : (index + 1) * 150;
  const total = Math.round(base + variation);

  return currencyFormatter.format(total);
}

function normalizePreview(preview?: string): string {
  if (!preview) {
    return '/screen.png';
  }

  if (preview.startsWith('http') || preview.startsWith('/')) {
    return preview;
  }

  return `/ml/${preview}`;
}

function truncateText(value: string, limit: number): string {
  if (value.length <= limit) {
    return value.trim();
  }

  return `${value.slice(0, limit).trim()}…`;
}


function getFallbackCards(): AccountDesignCard[] {
  const fallbackStatuses: DesignStatus[] = ['ready-to-order', 'in-production', 'completed'];
  return [1, 2, 3].map((index) => {
    const status = fallbackStatuses[index % fallbackStatuses.length];
    const statusInfo = statusMeta[status];
    return {
      id: `placeholder-${index}`,
      title: `Sample Design ${index}`,
      productName: 'Laser-etched Black Granite Headstone',
      priceLabel: currencyFormatter.format(2800 + index * 150),
      createdLabel: '15-09-2025 09:15',
      relativeUpdated: '2 days ago',
      preview: '/screen.png',
      description: commentInstructions,
      status,
      primaryActionLabel: statusInfo.primaryAction,
      destinationUrl: '/designs',
    };
  });
}

