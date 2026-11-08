'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserCircleIcon,
  ChevronLeftIcon,
  PencilSquareIcon,
  EllipsisVerticalIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

import type { SavedDesignMetadata } from '#/lib/saved-designs-data';
import { data } from '#/app/_internal/_data';
import { applyDesignSnapshot } from '#/lib/project-serializer';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { buildPdfQuoteFromProject } from '#/lib/design-quote';
import ConfirmModal from '#/components/shared/ConfirmModal';
import dynamic from 'next/dynamic';
import { logger } from '#/lib/logger';
const EmailShareModal = dynamic(
  () => import('#/components/account/EmailShareModal'),
);

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
    'h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 font-sans text-sm text-white placeholder-white/30 transition-all focus:border-[#c49a45] focus:outline-none focus:ring-2 focus:ring-[#c49a45]/20 day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:placeholder-[#a39788] day:focus:border-[#9a742f] day:focus:ring-[#9a742f]/20 day:shadow-xs';

  return (
    <div className="day:bg-[#f7f4ee] day:text-[#1a1714] relative flex min-h-screen items-center justify-center bg-[#0c0b0a] px-4 py-12 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(196,154,69,0.12),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#161412] p-7 shadow-xl backdrop-blur-md day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_30px_rgba(40,30,20,0.06)] sm:p-8">
        <div className="mb-6">
          {isSavingDesign && onBackToDesign && !isReset && (
            <button
              type="button"
              onClick={onBackToDesign}
              className="group mb-5 inline-flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] transition-colors hover:text-[#f0d89f] day:text-[#9a742f] day:hover:text-[#7d5e23]"
            >
              <ChevronLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to your design
            </button>
          )}
          <h1 className="font-serif text-3xl font-normal tracking-tight text-white day:text-[#1a1714]">
            {isReset ? 'Reset Password' : 'My Account'}
          </h1>
          <p className="mt-1 font-sans text-xs font-medium uppercase tracking-wider text-white/50 day:text-[#786e61]">
            Forever Shining Memorial Designs
          </p>
          {isSavingDesign && !isReset && (
            <div className="mt-4 rounded-xl border border-[#c49a45]/30 bg-[#c49a45]/10 p-3.5 shadow-xs day:border-[#9a742f]/30 day:bg-[#9a742f]/10">
              <p className="font-sans text-xs font-medium leading-relaxed text-[#f0d89f] day:text-[#7d5e23]">
                Sign in or create an account to save your project and access it anytime.
              </p>
            </div>
          )}
        </div>

        {/* Tab switcher — hidden in reset mode */}
        {!isReset && (
          <div className="mb-6 flex rounded-xl border border-white/10 bg-[#0c0b0a] p-1 day:border-[#dfd7ca] day:bg-[#f7f4ee]">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError('');
                  setInfo('');
                }}
                className={`flex-1 cursor-pointer rounded-lg py-2 font-sans text-xs font-semibold uppercase tracking-wider transition-all ${
                  tab === t
                    ? 'bg-[#c49a45] text-[#121110] shadow-sm day:bg-[#9a742f] day:text-white'
                    : 'text-white/60 hover:text-white day:text-[#6a6156] day:hover:text-[#1a1714]'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>
        )}

        {isReset && (
          <div className="mb-5 space-y-3 font-sans text-xs leading-relaxed text-white/70 day:text-[#6a6156]">
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
                className="cursor-pointer text-[#c49a45] underline hover:text-[#f0d89f] day:text-[#9a742f] day:hover:text-[#7d5e23]"
              >
                Register again
              </button>
              . Please{' '}
              <a
                href="mailto:admin@forevershining.com.au"
                className="text-[#c49a45] underline hover:text-[#f0d89f] day:text-[#9a742f] day:hover:text-[#7d5e23]"
              >
                Contact Us
              </a>{' '}
              for help.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
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
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
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
                  className="absolute top-1/2 right-3 -translate-y-1/2 font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] transition-colors hover:text-[#f0d89f] day:text-[#9a742f] day:hover:text-[#7d5e23]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}
          {!isReset && tab === 'register' && (
            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
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
            <p className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-2.5 font-sans text-xs text-red-300 day:border-red-200 day:bg-red-50 day:text-red-700">
              {error}
            </p>
          )}

          {info && (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-2.5 font-sans text-xs text-emerald-300 day:border-emerald-200 day:bg-emerald-50 day:text-emerald-700">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full cursor-pointer rounded-xl bg-[#c49a45] py-3 font-sans text-xs font-semibold uppercase tracking-wider text-[#121110] shadow-sm transition-all hover:bg-[#d5ad55] active:scale-[0.99] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Please wait…'
              : isReset
                ? 'Reset Password'
                : tab === 'login'
                  ? 'Sign in'
                  : 'Create account'}
          </button>

          {!isReset && tab === 'login' && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={enterReset}
                className="cursor-pointer font-sans text-xs text-white/60 transition-colors hover:text-[#c49a45] day:text-[#6a6156] day:hover:text-[#9a742f]"
              >
                Forgot your password?{' '}
                <span className="font-semibold text-[#c49a45] underline day:text-[#9a742f]">
                  Reset it
                </span>
              </button>
            </div>
          )}

          {isReset && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={exitReset}
                className="cursor-pointer font-sans text-xs text-white/60 transition-colors hover:text-[#c49a45] day:text-[#6a6156] day:hover:text-[#9a742f]"
              >
                ← Back to sign in
              </button>
            </div>
          )}
        </form>

        <p className="mt-8 text-center font-sans text-xs text-white/50 day:text-[#786e61]">
          Need help?{' '}
          <a
            href="mailto:admin@forevershining.com.au"
            className="font-semibold text-[#c49a45] underline transition-colors hover:text-[#f0d89f] day:text-[#9a742f] day:hover:text-[#7d5e23]"
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
  return (
    <React.Suspense fallback={null}>
      <MyAccountContent />
    </React.Suspense>
  );
}

function MyAccountContent() {
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
      <div className="day:bg-[#f7f4ee] flex min-h-screen items-center justify-center bg-[#0c0b0a]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c49a45]/30 border-t-[#c49a45] day:border-[#9a742f]/30 day:border-t-[#9a742f]" />
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
    <div className="relative min-h-screen bg-[#0c0b0a] text-white day:bg-[#f7f4ee] day:text-[#1a1714]">
      {/* Studio Header Section */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[#161412] day:border-[#dfd7ca] day:bg-[#f5f1e8]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-left">
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#c49a45]/35 bg-[#c49a45]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#c49a45] uppercase day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#78541c]">
                <span className="inline-block size-1.5 rounded-full bg-[#c49a45] day:bg-[#9a742f]" />
                Customer Portal · Account Area
              </div>
              <h1 className="font-serif text-3xl font-normal tracking-tight text-white day:text-[#1a1714] sm:text-4xl lg:text-[40px] lg:leading-tight">
                Saved Designs
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed text-stone-300 day:text-[#5a5248] md:text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium text-white/90 day:text-[#1a1714]">
                  <UserCircleIcon className="size-4 text-[#c49a45] day:text-[#9a742f]" />
                  {session.email}
                </span>
                <span className="text-white/30 day:text-[#c4baa9]">·</span>
                <span>Review your proofs, resume editing, or submit your memorial for fabrication.</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={handleNewDesign}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#c49a45] bg-[#c49a45] px-4 py-2 text-xs font-semibold tracking-wider text-[#121110] shadow-sm transition-all hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] md:text-sm"
              >
                <PlusIcon className="size-4 stroke-[2.5]" />
                <span>New Design</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 md:px-6 md:pt-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-8">
          <div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-white day:text-[#1a1714] md:text-3xl">
              Your Memorials · {visibleCards.length}
            </h2>
            <p className="mt-1 text-xs text-white/65 day:text-[#6a6156] md:text-sm">
              Pick up right where you left off or submit your approved design to manufacturing.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714]">
              Loading your saved designs…
            </h3>
            <p className="mt-2 text-xs text-stone-300 day:text-[#5a5248]">
              Retrieving your memorials and proofs.
            </p>
          </div>
        ) : !visibleCards.length ? (
          <div className="py-20 text-center">
            <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714] md:text-2xl">
              No saved designs yet
            </h3>
            <p className="mt-2 text-xs text-stone-300 day:text-[#5a5248] md:text-sm">
              Start configuring your custom memorial to save and preview proofs here.
            </p>
            <button
              type="button"
              onClick={handleNewDesign}
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#c49a45] bg-[#c49a45] px-5 py-2 text-xs font-semibold tracking-wider text-[#121110] transition-colors hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] md:text-sm"
            >
              <PlusIcon className="size-4 stroke-[2.5]" />
              <span>Create Your First Design</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {visibleCards.map((card) => {
              return (
                <article
                  key={card.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#161412] transition-all duration-300 hover:-translate-y-1 hover:border-[#c49a45]/70 hover:shadow-xl day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f] day:hover:shadow-[0_14px_34px_rgba(40,30,20,0.12)]"
                >
                  {/* Preview Image with status badge */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] p-4 day:border-[#ebe4d8] day:from-[#f8f5ee] day:to-[#ede6d8]">
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center rounded-full border border-[#c49a45]/35 bg-[#161412]/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#f0cf79] uppercase backdrop-blur-sm day:border-[#9a742f]/30 day:bg-white/90 day:text-[#8c6425]">
                        {card.status.replace('-', ' ')}
                      </span>
                    </div>
                    <img
                      src={card.preview}
                      alt={card.title}
                      className="h-full w-full object-contain p-2 transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-4 md:p-5">
                    <div className="mb-2">
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
                            className="min-w-0 flex-1 rounded-lg border border-[#c49a45] bg-black/30 px-3 py-1.5 font-serif text-base font-normal text-white outline-none focus:ring-2 focus:ring-[#c49a45]/20 day:border-[#9a742f] day:bg-white day:text-[#1a1714]"
                            aria-label="Project name"
                          />
                          <button
                            type="submit"
                            disabled={isSavingTitle}
                            className="rounded-lg bg-[#c49a45] px-3 py-1.5 font-sans text-xs font-semibold text-[#121110] transition-colors hover:bg-[#d5ad55] disabled:opacity-50 day:bg-[#9a742f] day:text-white"
                          >
                            {isSavingTitle ? '…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTitleId(null)}
                            className="rounded-lg border border-white/15 px-2.5 py-1.5 font-sans text-xs text-white/70 hover:text-white day:border-[#dfd7ca] day:text-[#6a6156]"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="min-w-0 truncate font-serif text-lg font-normal text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f]">
                            {card.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setDraftTitle(card.title);
                              setEditingTitleId(card.id);
                            }}
                            className="shrink-0 p-1 text-white/40 transition-colors hover:text-[#c49a45] day:text-[#786e61] day:hover:text-[#9a742f]"
                            title={`Rename ${card.title}`}
                            aria-label={`Rename ${card.title}`}
                          >
                            <PencilSquareIcon className="size-4" />
                          </button>
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="font-serif text-base font-medium text-[#c49a45] day:text-[#9a742f]">
                          {card.priceLabel}
                        </span>
                        <span className="text-[11px] text-white/50 day:text-[#786e61]">
                          {card.relativeUpdated}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-stone-300 day:text-[#5a5248]">
                      {card.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-auto grid grid-cols-[1fr_1fr_auto] items-center gap-2 border-t border-white/8 pt-3.5 day:border-[#ebe4d8]">
                      <Link
                        href={`/my-account/designs/${card.id}/buy`}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#c49a45] bg-[#c49a45] px-3 py-1.5 text-center font-sans text-xs font-semibold uppercase tracking-wider text-[#121110] transition-colors hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325]"
                      >
                        Buy
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleEdit(card.id)}
                        disabled={loadingEditId === card.id}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-white/30 hover:bg-white/10 disabled:opacity-50 day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#1a1714] day:hover:bg-[#e7e0d2]"
                      >
                        {loadingEditId === card.id ? 'Loading…' : 'Edit'}
                      </button>
                      <div
                        className="relative"
                        ref={openMenuId === card.id ? menuRef : null}
                      >
                        <button
                          type="button"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#5a5248] day:hover:bg-[#e7e0d2] day:hover:text-[#1a1714]"
                          onClick={() =>
                            setOpenMenuId(openMenuId === card.id ? null : card.id)
                          }
                          aria-label="More options"
                        >
                          <EllipsisVerticalIcon className="size-5" />
                        </button>
                        {openMenuId === card.id && (
                          <div className="absolute right-0 bottom-full z-50 mb-2 w-48 overflow-hidden rounded-xl border border-white/15 bg-[#161412] shadow-2xl day:border-[#dfd7ca] day:bg-white day:shadow-lg">
                            <Link
                              href={`/my-account/designs/${card.id}`}
                              className="block w-full px-4 py-2.5 text-left text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white day:text-[#1a1714] day:hover:bg-[#f5f1e8]"
                              onClick={() => setOpenMenuId(null)}
                            >
                              View details
                            </Link>
                            <button
                              type="button"
                              className="block w-full px-4 py-2.5 text-left text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white day:text-[#1a1714] day:hover:bg-[#f5f1e8]"
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
                              className="block w-full px-4 py-2.5 text-left text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white day:text-[#1a1714] day:hover:bg-[#f5f1e8]"
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
                              className="block w-full px-4 py-2.5 text-left text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white day:text-[#786e61] day:hover:bg-[#f5f1e8]"
                              onClick={() => {
                                setOpenMenuId(null);
                                const u =
                                  window.location.origin +
                                  `/my-account/designs/${card.id}`;
                                const shareUrl =
                                  `mailto:?subject=${encodeURIComponent(
                                    `Forever Shining Design — ${card.title}`,
                                  )}&body=${encodeURIComponent(
                                    `Take a look at this memorial design on Forever Shining:\n\n${card.title}\n${card.priceLabel}\n\n${u}`,
                                  )}`;
                                window.location.href = shareUrl;
                              }}
                            >
                              ✉️ Email Client
                            </button>
                            {card.htmlQuotePath && (
                              <a
                                href={card.htmlQuotePath}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full px-4 py-2.5 text-left text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white day:text-[#1a1714] day:hover:bg-[#f5f1e8]"
                                onClick={() => setOpenMenuId(null)}
                              >
                                📄 HTML Quote
                              </a>
                            )}
                            <button
                              type="button"
                              className="block w-full px-4 py-2.5 text-left text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white day:text-[#786e61] day:hover:bg-[#f5f1e8]"
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
                              className="block w-full px-4 py-2.5 text-left text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white day:text-[#786e61] day:hover:bg-[#f5f1e8]"
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
                              className="block w-full px-4 py-2.5 text-left text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white day:text-[#786e61] day:hover:bg-[#f5f1e8]"
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
                            <div className="border-t border-white/10 day:border-[#dfd7ca]" />
                            <button
                              type="button"
                              className="block w-full px-4 py-2.5 text-left text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white day:text-[#1a1714] day:hover:bg-[#f5f1e8]"
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
                              📥 Download PDF
                            </button>
                            <div className="border-t border-white/10 day:border-[#dfd7ca]" />
                            <button
                              type="button"
                              className="block w-full px-4 py-2.5 text-left text-xs font-medium text-red-400 transition hover:bg-red-500/10 day:text-red-600 day:hover:bg-red-50"
                              onClick={() => handleDeleteCard(card.id)}
                            >
                              🗑️ Delete Design
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

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
      ? `Estimated ${currencyFormatter.format(project.totalPriceCents / 100)}`
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
