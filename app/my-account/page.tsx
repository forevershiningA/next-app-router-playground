'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/outline';

import type { SavedDesignMetadata } from '#/lib/saved-designs-data';
import { data } from '#/app/_internal/_data';
import { applyDesignSnapshot } from '#/lib/project-serializer';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { buildPdfQuoteFromProject } from '#/lib/design-quote';
import ConfirmModal from '#/components/ConfirmModal';
import dynamic from 'next/dynamic';
import { logger } from '#/lib/logger';
const EmailShareModal = dynamic(() => import('#/components/EmailShareModal'));

type DesignStatus =
  | 'awaiting-approval'
  | 'ready-to-order'
  | 'in-production'
  | 'completed'
  | 'draft';

const statusMeta: Record<DesignStatus, { primaryAction: string }> = {
  'awaiting-approval': { primaryAction: 'Review proof' },
  'ready-to-order': { primaryAction: 'Place order' },
  'in-production': { primaryAction: 'Track order' },
  completed: { primaryAction: 'Reorder design' },
  draft: { primaryAction: 'Edit design' },
};

const commentInstructions =
  'Add engraving notes or approval comments before submitting your order.';

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

function AuthGate({
  onLogin,
  isSavingDesign,
  onBackToDesign,
}: {
  onLogin: (email: string) => void;
  isSavingDesign: boolean;
  onBackToDesign?: () => void;
}) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  function enterReset() {
    setIsReset(true);
    setError('');
    setInfo('');
    setPassword('');
    setConfirmPassword('');
  }

  function exitReset() {
    setIsReset(false);
    setError('');
    setInfo('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (isReset) {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Unable to send reset email');
        } else {
          setInfo(
            data.message ||
              'If an account with that email exists, a reset link has been sent.',
          );
        }
      } catch {
        setError('Network error — please try again');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (tab === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const endpoint =
        tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ||
            (tab === 'login' ? 'Login failed' : 'Registration failed'),
        );
      } else {
        window.dispatchEvent(new Event('session-changed'));
        onLogin(email);
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-lg border border-white/18 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/35 transition-colors focus:border-[#D4A84F] focus:outline-none focus:ring-2 focus:ring-[#D4A84F]/35';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050301] px-6 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8">
          {isSavingDesign && onBackToDesign && !isReset && (
            <button
              type="button"
              onClick={onBackToDesign}
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4A84F] transition-colors hover:text-[#e8bc5e]"
            >
              <span aria-hidden="true">←</span>
              Back to your design
            </button>
          )}
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {isReset ? 'Reset Password' : 'My Account'}
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Forever Shining Memorial Designs
          </p>
          {isSavingDesign && !isReset && (
            <p className="mt-4 rounded-lg border border-[#D4A84F]/25 bg-[#D4A84F]/10 px-3 py-2.5 text-sm leading-relaxed text-white/80">
              Sign in or create an account to save your project and access it
              anytime.
            </p>
          )}
        </div>

        {/* Tab switcher — hidden in reset mode */}
        {!isReset && (
          <div className="mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError('');
                  setInfo('');
                }}
                className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'bg-[#D4A84F] text-[#1a0f05]'
                    : 'text-white/65 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>
        )}

        {isReset && (
          <div className="mb-5 space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              If you have lost your password and cannot login, enter your login
              email address into the form below and click the Reset button.
            </p>
            <p>
              You will be sent an email with instructions on how to reset your
              login password.
            </p>
            <p className="italic">
              If you do not know your login email, unfortunately we will not be
              able to recover your account. You will need to{' '}
              <button
                type="button"
                onClick={() => {
                  setIsReset(false);
                  setTab('register');
                  setError('');
                  setInfo('');
                }}
                className="cursor-pointer text-[#D4A84F]/80 underline hover:text-[#D4A84F]"
              >
                Register again
              </button>
              . Please{' '}
              <a
                href="mailto:support@forevershining.com"
                className="text-[#D4A84F]/80 underline hover:text-[#D4A84F]"
              >
                Contact Us
              </a>{' '}
              for help.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs tracking-wider text-white/70 uppercase">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {!isReset && (
            <div>
              <label className="mb-1.5 block text-xs tracking-wider text-white/70 uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-16`}
                  placeholder="••••••••"
                  autoComplete={
                    tab === 'login' ? 'current-password' : 'new-password'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-[#D4A84F] hover:text-[#e8bc5e]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}
          {!isReset && tab === 'register' && (
            <div>
              <label className="mb-1.5 block text-xs tracking-wider text-white/70 uppercase">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400/80">
              {error}
            </p>
          )}

          {info && (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300/90">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full cursor-pointer rounded-lg bg-[#D4A84F] py-3 text-sm font-semibold text-[#1a0f05] transition-colors hover:bg-[#e8bc5e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Please wait…'
              : isReset
                ? 'Reset'
                : tab === 'login'
                  ? 'Sign in'
                  : 'Create account'}
          </button>

          {!isReset && tab === 'login' && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={enterReset}
                className="cursor-pointer text-xs text-white/70 transition-colors hover:text-[#D4A84F]"
              >
                Forgot your password?{' '}
                <span className="text-[#D4A84F]">Reset it</span>
              </button>
            </div>
          )}

          {isReset && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={exitReset}
                className="cursor-pointer text-xs text-white/70 transition-colors hover:text-[#D4A84F]"
              >
                ← Login to an account
              </button>
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-xs text-white/50">
          Need help?{' '}
          <a
            href="mailto:support@forevershining.com"
            className="text-[#D4A84F] hover:text-[#e8bc5e]"
          >
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
  const searchParams = useSearchParams();
  const [session, setSession] = useState<{ email: string } | null | undefined>(
    undefined,
  );
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareProjectId, setShareProjectId] = useState<string | null>(null);
  const [shareProjectTitle, setShareProjectTitle] = useState<
    string | undefined
  >(undefined);
  const [shareProjectScreenshot, setShareProjectScreenshot] = useState<
    string | undefined
  >(undefined);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const resetDesign = useHeadstoneStore((state) => state.resetDesign);

  function handleNewDesign() {
    resetDesign();
    router.push('/select-product');
  }

  async function handleRename(cardId: string) {
    const title = draftTitle.trim();
    if (!title) return;

    setIsSavingTitle(true);
    try {
      const res = await fetch(`/api/projects/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to rename project');
      setSavedProjects((projects) =>
        projects.map((project) =>
          project.id === cardId
            ? {
                ...project,
                title: body.project.title,
                updatedAt: body.project.updatedAt,
              }
            : project,
        ),
      );
      setEditingTitleId(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to rename project. Please try again.',
      );
    } finally {
      setIsSavingTitle(false);
    }
  }

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
      router.push(
        getDesignerProductStepHref('select-size', snapshot.productId),
      );
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

    function onSessionChanged() {
      checkSession();
    }
    window.addEventListener('session-changed', onSessionChanged);
    return () =>
      window.removeEventListener('session-changed', onSessionChanged);
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
    setPendingDeleteId(cardId);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const performDelete = async () => {
    const cardId = pendingDeleteId;
    if (!cardId) return;
    try {
      const res = await fetch(`/api/projects?id=${cardId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSavedProjects((prev) => prev.filter((p) => p.id !== cardId));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || 'Failed to delete. Please try again.');
      }
    } catch {
      alert('Failed to delete. Please try again.');
    } finally {
      setPendingDeleteId(null);
      setDeleteModalOpen(false);
    }
  };

  // Convert API projects to design cards
  const projectCards = savedProjects.map((project) =>
    buildProjectCard(project),
  );
  const cards = projectCards;
  const visibleCards = cards.filter(
    (card) => card.status !== 'awaiting-approval',
  );

  // Still checking session
  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050301]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D4A84F]/30 border-t-[#D4A84F]" />
      </div>
    );
  }

  // Not logged in — show login/register gate
  if (session === null) {
    return (
      <AuthGate
        isSavingDesign={Boolean(searchParams.get('returnTo'))}
        onBackToDesign={() => {
          const returnTo = searchParams.get('returnTo');
          if (returnTo) router.push(returnTo);
        }}
        onLogin={(email) => {
          const params = new URLSearchParams(window.location.search);
          const returnTo = params.get('returnTo');
          if (returnTo) {
            router.push(returnTo);
          } else {
            setSession({ email });
          }
        }}
      />
    );
  }

  return (
    <div className="day:bg-stone-100 day:text-gray-900 relative min-h-screen bg-[#050301] text-white">
      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <section
          className="day:border-gray-200 day:bg-white/90 day:shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl border border-white/10 bg-[#0c0805]/85 px-4 py-5 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:rounded-[32px] sm:px-6 lg:px-10 lg:py-6"
          aria-labelledby="saved-designs-heading"
        >
          <header className="day:border-gray-200 mb-6 border-b border-white/5 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2
                  id="saved-designs-heading"
                  className="text-3xl font-semibold tracking-tight"
                >
                  Saved Designs
                </h2>
                <p className="day:text-gray-500 mt-3 inline-flex items-center gap-2 text-sm text-white/70">
                  <UserCircleIcon
                    className="day:text-gray-400 h-5 w-5 text-white/60"
                    aria-hidden
                  />
                  {session.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleNewDesign}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D4A84F] px-4 py-2.5 text-sm font-semibold text-[#1a0f05] transition-colors hover:bg-[#e8bc5e]"
              >
                <span aria-hidden="true">+</span>
                New Design
              </button>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCards.map((card) => {
              return (
                <article
                  key={card.id}
                  className="day:border-gray-200 day:bg-white day:shadow-md flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-sm"
                >
                  {/* Preview Image */}
                  <div className="mb-4">
                    <div className="day:border-gray-200 relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-[#121212]">
                      <img
                        src={card.preview}
                        alt={card.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Card Header */}
                  <div className="mb-3">
                    {editingTitleId === card.id ? (
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void handleRename(card.id);
                        }}
                      >
                        <input
                          value={draftTitle}
                          onChange={(event) =>
                            setDraftTitle(event.target.value)
                          }
                          maxLength={120}
                          autoFocus
                          className="day:bg-white day:text-gray-900 min-w-0 flex-1 rounded-md border border-[#D4A84F]/60 bg-black/20 px-2 py-1 text-lg font-semibold text-white ring-0 outline-none"
                          aria-label="Project name"
                        />
                        <button
                          type="submit"
                          disabled={isSavingTitle}
                          className="text-xs font-semibold text-[#D4A84F] disabled:opacity-50"
                        >
                          {isSavingTitle ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTitleId(null)}
                          className="day:text-gray-500 day:hover:text-gray-900 text-xs text-white/55 hover:text-white"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="day:text-gray-900 min-w-0 truncate text-lg font-semibold text-white">
                          {card.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setDraftTitle(card.title);
                            setEditingTitleId(card.id);
                          }}
                          className="day:text-gray-400 shrink-0 text-sm text-white/45 transition-colors hover:text-[#D4A84F]"
                          aria-label={`Rename ${card.title}`}
                        >
                          ✎
                        </button>
                      </div>
                    )}
                    <div className="day:text-gray-500 mt-1 flex flex-col gap-0.5 text-sm text-white/70 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">
                      <span className="font-medium text-[#D4A84F]">
                        {card.priceLabel}
                      </span>
                      <span className="day:text-gray-400 text-white/50">
                        {card.relativeUpdated}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="day:text-gray-600 mb-4 line-clamp-2 flex-1 text-sm text-white/75">
                    {card.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                    <Link
                      href={`/my-account/designs/${card.id}/buy`}
                      className="cursor-pointer rounded-lg px-3 py-2 text-center text-xs font-medium text-black transition"
                      style={{ backgroundColor: '#D4A84F' }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = '#C49940')
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = '#D4A84F')
                      }
                    >
                      Buy
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEdit(card.id)}
                      disabled={loadingEditId === card.id}
                      className="day:border-gray-200 day:bg-gray-50 day:text-gray-700 day:hover:bg-gray-100 cursor-pointer rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                    >
                      {loadingEditId === card.id ? 'Loading…' : 'Edit'}
                    </button>
                    <div
                      className="relative"
                      ref={openMenuId === card.id ? menuRef : null}
                    >
                      <button
                        type="button"
                        className="day:border-gray-200 day:bg-gray-50 day:text-gray-700 day:hover:bg-gray-100 flex h-8 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white transition hover:bg-white/10"
                        onClick={() =>
                          setOpenMenuId(openMenuId === card.id ? null : card.id)
                        }
                        aria-label="More options"
                      >
                        ⋮
                      </button>
                      {openMenuId === card.id && (
                        <div className="day:border-gray-200 day:bg-white absolute right-0 bottom-full z-50 mb-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#1a1208] shadow-2xl">
                          <Link
                            href={`/my-account/designs/${card.id}`}
                            className="day:text-gray-700 day:hover:bg-gray-50 block w-full px-4 py-2.5 text-left text-xs text-white transition hover:bg-white/10"
                            onClick={() => setOpenMenuId(null)}
                          >
                            View details
                          </Link>
                          <button
                            type="button"
                            className="day:text-gray-700 day:hover:bg-gray-50 w-full px-4 py-2.5 text-left text-xs text-white transition hover:bg-white/10"
                            onClick={async () => {
                              setOpenMenuId(null);
                              try {
                                await navigator.clipboard.writeText(
                                  window.location.origin +
                                    `/my-account/designs/${card.id}`,
                                );
                                alert('Link copied to clipboard');
                              } catch {
                                alert('Could not copy link');
                              }
                            }}
                          >
                            🔗 Copy Link
                          </button>
                          <button
                            type="button"
                            className="day:text-gray-700 day:hover:bg-gray-50 w-full px-4 py-2.5 text-left text-xs text-white transition hover:bg-white/10"
                            onClick={() => {
                              setOpenMenuId(null);
                              setShareProjectId(card.id);
                              setShareProjectTitle(card.title);
                              setShareProjectScreenshot(card.preview);
                              setShareModalOpen(true);
                            }}
                          >
                            ✉️ Email
                          </button>
                          <button
                            type="button"
                            className="day:text-gray-500 day:hover:bg-gray-50 w-full px-4 py-2.5 text-left text-xs text-white/60 transition hover:bg-white/10"
                            onClick={() => {
                              setOpenMenuId(null);
                              const u =
                                window.location.origin +
                                `/my-account/designs/${card.id}`;
                              window.open(
                                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
                                '_blank',
                                'width=600,height=400',
                              );
                            }}
                          >
                            Facebook
                          </button>
                          <button
                            type="button"
                            className="day:text-gray-500 day:hover:bg-gray-50 w-full px-4 py-2.5 text-left text-xs text-white/60 transition hover:bg-white/10"
                            onClick={() => {
                              setOpenMenuId(null);
                              const u =
                                window.location.origin +
                                `/my-account/designs/${card.id}`;
                              window.open(
                                `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent('Check out my memorial design: ' + card.title)}`,
                                '_blank',
                                'width=600,height=400',
                              );
                            }}
                          >
                            Twitter / X
                          </button>
                          <button
                            type="button"
                            className="day:text-gray-500 day:hover:bg-gray-50 w-full px-4 py-2.5 text-left text-xs text-white/60 transition hover:bg-white/10"
                            onClick={() => {
                              setOpenMenuId(null);
                              const u =
                                window.location.origin +
                                `/my-account/designs/${card.id}`;
                              window.open(
                                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
                                '_blank',
                                'width=600,height=400',
                              );
                            }}
                          >
                            LinkedIn
                          </button>
                          <div className="day:border-gray-100 border-t border-white/10" />
                          <button
                            type="button"
                            className="day:text-gray-700 day:hover:bg-gray-50 w-full px-4 py-2.5 text-left text-xs text-white transition hover:bg-white/10"
                            onClick={async () => {
                              setOpenMenuId(null);
                              try {
                                const detailsRes = await fetch(
                                  `/api/projects/${card.id}`,
                                );
                                if (!detailsRes.ok) {
                                  throw new Error(
                                    'Failed to load project details',
                                  );
                                }
                                const details = await detailsRes.json();
                                const project = details.project;
                                const { generateDesignPDF } = await import(
                                  '#/lib/pdf-generator'
                                );
                                await generateDesignPDF({
                                  title: card.title,
                                  screenshot:
                                    project?.screenshotPath || card.preview,
                                  priceLabel: card.priceLabel,
                                  createdLabel: card.createdLabel,
                                  description: card.description,
                                  productName: card.productName,
                                  quote: buildPdfQuoteFromProject(
                                    project ?? {},
                                  ),
                                });
                              } catch {
                                alert(
                                  'Failed to generate PDF. Please try again.',
                                );
                              }
                            }}
                          >
                            Download PDF
                          </button>
                          <div className="day:border-gray-100 border-t border-white/10" />
                          <button
                            type="button"
                            className="day:text-red-600 day:hover:bg-red-50 w-full px-4 py-2.5 text-left text-xs text-red-400 transition hover:bg-red-500/10"
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
              <div className="day:border-gray-200 day:bg-gray-50 day:text-gray-500 col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                No saved designs available yet. Start a new design to see it
                here.
              </div>
            )}
            {isLoading && (
              <div className="day:border-gray-200 day:bg-gray-50 day:text-gray-500 col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                Loading your saved designs...
              </div>
            )}
          </div>
        </section>

        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setPendingDeleteId(null);
          }}
          onConfirm={performDelete}
          title="Delete design?"
          message="Delete this design? This cannot be undone."
          confirmLabel="Yes, delete"
          cancelLabel="No, keep"
        />

        {/* Email share modal */}
        {shareProjectId && (
          <React.Suspense fallback={null}>
            <EmailShareModal
              isOpen={shareModalOpen}
              onClose={() => {
                setShareModalOpen(false);
                setShareProjectId(null);
                setShareProjectTitle(undefined);
                setShareProjectScreenshot(undefined);
              }}
              projectId={shareProjectId}
              projectTitle={shareProjectTitle}
              senderEmail={session?.email ?? null}
              screenshotUrl={shareProjectScreenshot}
            />
          </React.Suspense>
        )}
      </div>
    </div>
  );
}

function buildProjectCard(project: any): AccountDesignCard {
  const createdDate = new Date(project.createdAt);
  const updatedDate = new Date(project.updatedAt);

  // Get screenshot and thumbnail paths
  const thumbnail =
    project.thumbnailPath || project.screenshotPath || '/screen.png';
  const fullScreenshot = project.screenshotPath || '/screen.png';

  // Get product name from productId
  const productId = project.designState?.productId;
  logger.log('Full designState:', project.designState);
  logger.log('Product lookup:', {
    productId,
    hasProducts: !!data.products,
    productsCount: data.products?.length,
  });
  const product = productId
    ? data.products.find((p) => p.id === productId)
    : null;
  logger.log('Found product:', product);
  const productName = product?.name || 'Custom memorial design';
  logger.log('Final productName:', productName);

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
    primaryActionLabel:
      statusMeta[(project.status || 'draft') as DesignStatus].primaryAction,
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
  const widthMm = project.designState?.widthMm;
  const heightMm = project.designState?.heightMm;
  if (
    Number.isFinite(widthMm) &&
    Number.isFinite(heightMm) &&
    widthMm > 0 &&
    heightMm > 0
  ) {
    return `Headstone · ${widthMm} × ${heightMm} mm`;
  }
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

  if (
    (design.hasMotifs || design.hasAdditions) &&
    design.inscriptionCount >= 1
  ) {
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
  const variation = Number.isFinite(variationSeed)
    ? variationSeed * 3
    : (index + 1) * 150;
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
  const fallbackStatuses: DesignStatus[] = [
    'ready-to-order',
    'in-production',
    'completed',
  ];
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
